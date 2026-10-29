import { supabase } from '../lib/supabase';
import { UserProfile, Seller, Warehouse } from '../types';

export interface AuthSessionData {
  user: UserProfile;
  seller: Seller;
  warehouses: Warehouse[];
}

export const DEMO_SELLER_ID = '32d724db-23c4-4cba-a76f-f78e4022194e';

export const DEMO_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-delhi-01',
    seller_id: DEMO_SELLER_ID,
    name: 'Primary Delhi Fulfilment Hub',
    contact_name: 'Rajesh Sharma',
    phone: '9876543210',
    email: 'delhi.hub@shipfaster.in',
    address_line1: 'Plot 42, Okhla Industrial Area Phase III',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110020',
    is_default: true,
    address_verified_at: new Date().toISOString(),
    phone_verified_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'wh-mumbai-02',
    seller_id: DEMO_SELLER_ID,
    name: 'Mumbai Bhiwandi Logistics Hub',
    contact_name: 'Vikram Joshi',
    phone: '9822334455',
    email: 'mumbai.hub@shipfaster.in',
    address_line1: 'Shed 12, Indian Logistics Park, Mankoli',
    city: 'Bhiwandi',
    state: 'Maharashtra',
    pincode: '421302',
    is_default: false,
    address_verified_at: new Date().toISOString(),
    phone_verified_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }
];

export function createDemoSession(email: string, isAdmin = false): AuthSessionData {
  const isSeller = !isAdmin;
  const seller: Seller = {
    id: DEMO_SELLER_ID,
    company_name: isSeller ? 'ShipFaster Logistics India Pvt Ltd' : 'ShipFaster Control Tower HQ',
    brand_name: isSeller ? 'Apex D2C Logistics' : 'Control Tower HQ',
    gstin: '07AAAAA0000A1Z5',
    pan: 'AAACA1234F',
    status: 'ACTIVE',
    rate_card_id: 'rc-standard',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const user: UserProfile = {
    id: isAdmin ? '00000000-0000-0000-0000-000000000002' : '00000000-0000-0000-0000-000000000001',
    email: email || (isAdmin ? 'admin.demo@shipfaster.test' : 'seller.demo@shipfaster.test'),
    name: isAdmin ? 'Platform Control Tower' : 'Demo Seller',
    phone: '+91 9000000001',
    seller_id: seller.id,
    role: isAdmin ? 'PLATFORM_ADMIN' : 'OWNER',
    is_active: true,
  };

  const sessionData: AuthSessionData = {
    user,
    seller,
    warehouses: DEMO_WAREHOUSES,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('shipfaster_session', JSON.stringify(sessionData));
    } catch {}
  }

  return sessionData;
}

/**
 * Ensure the authenticated user has an associated seller tenant, membership, and default warehouse.
 */
export async function provisionSellerAccount(
  userId: string,
  email: string,
  companyName: string = '',
  phone: string = '',
  platformRole?: UserProfile['role']
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
        role: platformRole?.startsWith('PLATFORM_') ? platformRole : (existingMembership.role || 'OWNER'),
        is_active: true,
      },
      seller,
      warehouses: warehouses || [],
    };
  }

  // 2. Create a new seller record
  const { data: newSeller, error: sellerError } = await supabase
    .from('sellers')
    .insert({
      company_name: companyName,
      brand_name: companyName,
      pan: `PENDING-${userId.replaceAll('-', '').slice(0, 10).toUpperCase()}`,
      status: 'DRAFT',
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
    warehouses: [],
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
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { company_name: companyName, phone },
      },
    });

    if (error) {
      const message = error.message.toLowerCase();
      if (error.status === 429 || message.includes('rate limit')) {
        throw new Error('Too many registration attempts. Please wait a few minutes before trying again. If this account was already created, sign in instead.');
      }
      if (message.includes('already registered') || message.includes('already exists')) {
        throw new Error('An account with this email already exists. Please sign in instead.');
      }
      throw error;
    }
    if (!data.user) throw new Error('Registration failed: no user returned from Supabase.');

    if (!data.session) {
      throw new Error('Email confirmation is enabled, but no sign-in session was created. Configure SMTP for verification emails or disable Confirm email in Supabase to sign in immediately.');
    }

    try {
      await supabase.auth.refreshSession();
    } catch {}

    const sessionData = await provisionSellerAccount(data.user.id, email, companyName, phone, data.user.app_metadata?.role);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('shipfaster_session', JSON.stringify(sessionData));
      } catch {}
    }
    return sessionData;
  } catch (err: any) {
    const isNetworkError =
      err?.message?.toLowerCase().includes('failed to fetch') ||
      err?.message?.toLowerCase().includes('network') ||
      err?.name === 'AuthRetryableFetchError';

    if (isNetworkError) {
      throw new Error(
        'Cannot reach Supabase server (the project is paused or offline). ' +
        'New seller accounts require an active database to store your business profile, warehouses, and credentials. ' +
        'Please restore your project on the Supabase dashboard.'
      );
    }
    throw err;
  }
}

/**
 * Sign in an existing user with Supabase Auth or fallback to demo account if unreachable
 */
export async function signInUser(email: string, password: string): Promise<AuthSessionData> {
  const normalizedEmail = (email || '').trim().toLowerCase();

  // All email addresses must be validated against the Supabase database.
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      const isNetworkError =
        error.message?.toLowerCase().includes('failed to fetch') ||
        error.message?.toLowerCase().includes('network') ||
        (error as any)?.status === 0 ||
        (error as any)?.name === 'AuthRetryableFetchError';

      if (isNetworkError) {
        throw new Error(
          'Cannot reach the Supabase backend server (the database project is paused or offline). ' +
          'Personal email accounts cannot be authenticated without an active database connection. ' +
          'Please restore your Supabase project in the Supabase dashboard or use the Quick Demo buttons to test.'
        );
      }
      throw new Error('Invalid email or password. Please check your credentials or register a new account.');
    }

    if (!data.user) throw new Error('Sign in failed: invalid credentials.');

    const companyName = data.user.user_metadata?.company_name || normalizedEmail.split('@')[0];
    const phone = data.user.user_metadata?.phone || '';

    const sessionData = await provisionSellerAccount(data.user.id, normalizedEmail, companyName, phone, data.user.app_metadata?.role);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('shipfaster_session', JSON.stringify(sessionData));
      } catch {}
    }
    return sessionData;
  } catch (err: any) {
    const isNetworkError =
      err?.message?.toLowerCase().includes('failed to fetch') ||
      err?.message?.toLowerCase().includes('network') ||
      err?.name === 'AuthRetryableFetchError';

    if (isNetworkError) {
      throw new Error(
        'Cannot reach the Supabase backend server (the database project is paused or offline). ' +
        'Personal email accounts cannot be authenticated without an active database connection. ' +
        'Please restore your Supabase project in the Supabase dashboard or use the Quick Demo buttons to test.'
      );
    }
    throw err;
  }
}

/**
 * Sign out current session
 */
export async function signOutUser(): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('shipfaster_session');
    } catch {}
  }
  try {
    await supabase.auth.signOut();
  } catch {}
}

/**
 * Get active session user and seller data
 */
export async function getActiveSession(): Promise<AuthSessionData | null> {
  // 1. Check local session cache (for offline / demo login support)
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('shipfaster_session');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.user?.id && parsed?.seller?.id) {
          return parsed;
        }
      }
    } catch {}
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const user = session.user;
    const companyName = user.user_metadata?.company_name || user.email?.split('@')[0] || '';
    const phone = user.user_metadata?.phone || '';

    const sessionData = await provisionSellerAccount(user.id, user.email || '', companyName, phone, user.app_metadata?.role);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('shipfaster_session', JSON.stringify(sessionData));
      } catch {}
    }
    return sessionData;
  } catch (err) {
    console.warn('Unable to retrieve session from Supabase:', err);
    return null;
  }
}
