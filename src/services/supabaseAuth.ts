import { supabase } from '../lib/supabase';
import { UserProfile, Seller, Warehouse } from '../types';

export interface AuthSessionData {
  user: UserProfile;
  seller: Seller;
  warehouses: Warehouse[];
}

/**
 * Ensure the authenticated user has an associated seller tenant, membership, and default warehouse.
 */
export async function provisionSellerAccount(
  userId: string,
  email: string,
  companyName: string = 'My Brand Logistics',
  phone: string = '+91 9876543210'
): Promise<AuthSessionData> {
  // 1. Check if user is already linked to a seller
  const { data: existingMembership } = await supabase
    .from('seller_users')
    .select('*, sellers(*)')
    .eq('user_id', userId)
    .maybeSingle();

  if (existingMembership && existingMembership.sellers) {
    const seller = existingMembership.sellers as Seller;
    const { data: warehouses } = await supabase
      .from('warehouses')
      .select('*')
      .eq('seller_id', seller.id);

    return {
      user: {
        id: userId,
        email,
        name: companyName || email.split('@')[0],
        phone,
        seller_id: seller.id,
        role: existingMembership.role || 'OWNER',
        is_active: true,
      },
      seller,
      warehouses: warehouses && warehouses.length > 0 ? warehouses : [
        {
          id: `wh-${seller.id.slice(0, 8)}`,
          seller_id: seller.id,
          name: 'Primary Fulfillment Center',
          contact_name: companyName,
          phone,
          email,
          address_line1: 'B-401 Logistics Park, Andheri East',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400069',
          is_default: true,
          created_at: new Date().toISOString(),
        }
      ],
    };
  }

  // 2. Create a new seller record
  const { data: newSeller, error: sellerError } = await supabase
    .from('sellers')
    .insert({
      company_name: companyName,
      brand_name: companyName,
      pan: 'PAN999999X',
      status: 'ACTIVE',
    })
    .select()
    .single();

  if (sellerError || !newSeller) {
    throw new Error(sellerError?.message || 'Failed to create seller organization');
  }

  // 3. Link user to seller as OWNER
  await supabase
    .from('seller_users')
    .insert({
      seller_id: newSeller.id,
      user_id: userId,
      role: 'OWNER',
    });

  // 4. Create a default primary warehouse
  const defaultWarehouse: Omit<Warehouse, 'created_at'> = {
    id: crypto.randomUUID ? crypto.randomUUID() : `wh-${Date.now()}`,
    seller_id: newSeller.id,
    name: 'Primary Fulfillment Center',
    contact_name: companyName,
    phone,
    email,
    address_line1: 'B-401 Logistics Park, Andheri East',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400069',
    is_default: true,
  };

  const { data: createdWh } = await supabase
    .from('warehouses')
    .insert(defaultWarehouse)
    .select()
    .single();

  return {
    user: {
      id: userId,
      email,
      name: companyName,
      phone,
      seller_id: newSeller.id,
      role: 'OWNER',
      is_active: true,
    },
    seller: newSeller,
    warehouses: [createdWh || { ...defaultWarehouse, created_at: new Date().toISOString() }],
  };
}

/**
 * Register a new user in Supabase Auth and provision their seller workspace
 */
export async function signUpUser(
  email: string,
  password: string,
  companyName: string,
  phone: string
): Promise<AuthSessionData> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { company_name: companyName, phone },
    },
  });

  if (error) throw error;
  if (!data.user) throw new Error('Registration failed: no user returned from Supabase.');

  return await provisionSellerAccount(data.user.id, email, companyName, phone);
}

/**
 * Sign in an existing user with Supabase Auth
 */
export async function signInUser(email: string, password: string): Promise<AuthSessionData> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  if (!data.user) throw new Error('Sign in failed: invalid credentials.');

  const companyName = data.user.user_metadata?.company_name || email.split('@')[0];
  const phone = data.user.user_metadata?.phone || '+91 9876543210';

  return await provisionSellerAccount(data.user.id, email, companyName, phone);
}

/**
 * Sign out current session
 */
export async function signOutUser(): Promise<void> {
  await supabase.auth.signOut();
}

/**
 * Get active session user and seller data
 */
export async function getActiveSession(): Promise<AuthSessionData | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const user = session.user;
  const companyName = user.user_metadata?.company_name || user.email?.split('@')[0] || 'Brand Logistics';
  const phone = user.user_metadata?.phone || '+91 9876543210';

  return await provisionSellerAccount(user.id, user.email || '', companyName, phone);
}
