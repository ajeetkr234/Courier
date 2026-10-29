const { createClient } = require('@supabase/supabase-js');

const KNOWN_PRODUCTION_HOST = 'ytydhmrcsowhygttdoiw.supabase.co';

const supabaseUrl = process.env.STAGING_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.STAGING_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required to seed.');
  process.exit(1);
}

try {
  const targetHost = new URL(supabaseUrl).hostname.toLowerCase();
  if (targetHost === KNOWN_PRODUCTION_HOST && !process.env.ALLOW_PRODUCTION_SEED) {
    console.error(`Refusal: Seeding is blocked against known production project (${KNOWN_PRODUCTION_HOST}).`);
    process.exit(1);
  }
} catch {
  console.error('Error: SUPABASE_URL is not a valid URL.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SELLER_ID = process.env.SEED_SELLER_ID || '32d724db-23c4-4cba-a76f-f78e4022194e';

async function seed() {
  console.log('--- 1. Updating Primary Seller Profile ---');
  await supabase.from('sellers').upsert({
    id: SELLER_ID,
    company_name: 'ShipFaster Logistics India Pvt Ltd',
    brand_name: 'Apex D2C Brands',
    gstin: '07AAAAA0000A1Z5',
    pan: 'AAACA1234F',
    status: 'ACTIVE',
    updated_at: new Date().toISOString()
  });

  console.log('--- 2. Seeding Warehouses ---');
  const warehouseData = [
    {
      seller_id: SELLER_ID,
      name: 'Primary Delhi Fulfilment Hub',
      contact_name: 'Rajesh Sharma',
      phone: '9876543210',
      email: 'delhi.hub@shipfaster.in',
      address_line1: 'Plot 42, Okhla Industrial Area Phase III',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110020',
      is_default: true,
    },
    {
      seller_id: SELLER_ID,
      name: 'Mumbai Bhiwandi Logistics Hub',
      contact_name: 'Vikram Joshi',
      phone: '9822334455',
      email: 'mumbai.hub@shipfaster.in',
      address_line1: 'Shed 12, Indian Logistics Park, Mankoli',
      city: 'Bhiwandi',
      state: 'Maharashtra',
      pincode: '421302',
      is_default: false,
    },
    {
      seller_id: SELLER_ID,
      name: 'Bangalore Whitefield Warehouse',
      contact_name: 'Suresh Kumar',
      phone: '9845112233',
      email: 'blr.hub@shipfaster.in',
      address_line1: '14/3, Hoodi Industrial Area, Whitefield',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560066',
      is_default: false,
    },
    {
      seller_id: SELLER_ID,
      name: 'Kolkata Eastern Regional Hub',
      contact_name: 'Anirban Das',
      phone: '9830112233',
      email: 'kolkata.hub@shipfaster.in',
      address_line1: 'Kolkata West International City, Salap',
      city: 'Howrah',
      state: 'West Bengal',
      pincode: '711403',
      is_default: false,
    }
  ];

  const { data: existingWhs } = await supabase.from('warehouses').select('id, name').eq('seller_id', SELLER_ID);
  let warehouses = existingWhs || [];
  if (warehouses.length < warehouseData.length) {
    for (const wh of warehouseData) {
      const exists = warehouses.find(w => w.name === wh.name);
      if (!exists) {
        const { data: created } = await supabase.from('warehouses').insert(wh).select().single();
        if (created) warehouses.push(created);
      }
    }
  }
  console.log(`Warehouses available: ${warehouses.length}`);

  console.log('--- 3. Seeding Customers ---');
  const customerList = [
    { name: 'Amit Patel', phone: '9812345678', email: 'amit.patel@gmail.com' },
    { name: 'Priya Sharma', phone: '9871122334', email: 'priya.sharma@outlook.com' },
    { name: 'Rohan Mehta', phone: '9890123456', email: 'rohan.mehta@gmail.com' },
    { name: 'Sneha Reddy', phone: '9848123456', email: 'sneha.reddy@yahoo.com' },
    { name: 'Arjun Verma', phone: '9820123456', email: 'arjun.verma@gmail.com' },
    { name: 'Deepika Nair', phone: '9847123456', email: 'deepika.nair@gmail.com' },
    { name: 'Manish Gupta', phone: '9811122334', email: 'manish.gupta@hotmail.com' },
    { name: 'Pooja Iyer', phone: '9840123456', email: 'pooja.iyer@gmail.com' },
    { name: 'Gaurav Kulkarni', phone: '9823123456', email: 'gaurav.k@gmail.com' },
    { name: 'Ananya Roy', phone: '9831123456', email: 'ananya.roy@gmail.com' }
  ];

  let customers = [];
  const { data: existingCust } = await supabase.from('customers').select('id, name').eq('seller_id', SELLER_ID);
  customers = existingCust || [];
  if (customers.length < customerList.length) {
    for (const c of customerList) {
      const exists = customers.find(ex => ex.name === c.name);
      if (!exists) {
        const { data: created } = await supabase.from('customers').insert({ ...c, seller_id: SELLER_ID }).select().single();
        if (created) customers.push(created);
      }
    }
  }
  console.log(`Customers available: ${customers.length}`);

  console.log('--- 4. Seeding Couriers check ---');
  const { data: couriers } = await supabase.from('couriers').select('id, code, name');
  console.log(`Couriers available: ${couriers?.length}`);

  const delhivery = couriers?.find(c => c.code === 'delhivery') || couriers?.[0];
  const bluedart = couriers?.find(c => c.code === 'bluedart') || couriers?.[1];
  const xpressbees = couriers?.find(c => c.code === 'xpressbees') || couriers?.[2];
  const ecom = couriers?.find(c => c.code === 'ecom') || couriers?.[3];
  const shadowfax = couriers?.find(c => c.code === 'shadowfax') || couriers?.[4];

  console.log('--- 5. Seeding Orders and Order Items ---');
  const sampleOrders = [
    {
      extId: 'ORD-2026-101',
      status: 'NEW',
      payment: 'PREPAID',
      cod: 0,
      total: 1899.00,
      weight: 0.65,
      whIdx: 0,
      custIdx: 0,
      addr: { fullName: 'Amit Patel', phone: '9812345678', addressLine1: 'B-402, Sunrise Apartments, SG Highway', city: 'Ahmedabad', state: 'Gujarat', pincode: '380015' },
      items: [{ sku: 'SKU-AUDIO-01', name: 'BassPro Wireless Earbuds Gen 2', quantity: 1, unit_price: 1899.00 }]
    },
    {
      extId: 'ORD-2026-102',
      status: 'NEW',
      payment: 'COD',
      cod: 3499.00,
      total: 3499.00,
      weight: 1.20,
      whIdx: 1,
      custIdx: 1,
      addr: { fullName: 'Priya Sharma', phone: '9871122334', addressLine1: 'Flat 12B, Palm Grove Towers, Powai', city: 'Mumbai', state: 'Maharashtra', pincode: '400076' },
      items: [{ sku: 'SKU-WATCH-02', name: 'Titanium Smartwatch Ultra with GPS', quantity: 1, unit_price: 3499.00 }]
    },
    {
      extId: 'ORD-2026-103',
      status: 'CONFIRMED',
      payment: 'PREPAID',
      cod: 0,
      total: 899.00,
      weight: 0.40,
      whIdx: 0,
      custIdx: 2,
      addr: { fullName: 'Rohan Mehta', phone: '9890123456', addressLine1: '45/2, Model Town Main Road', city: 'Ludhiana', state: 'Punjab', pincode: '141002' },
      items: [{ sku: 'SKU-CHARGER-03', name: '65W GaN Fast Charger Dual USB-C', quantity: 1, unit_price: 899.00 }]
    },
    {
      extId: 'ORD-2026-104',
      status: 'READY_TO_SHIP',
      payment: 'PREPAID',
      cod: 0,
      total: 4250.00,
      weight: 2.10,
      whIdx: 2,
      custIdx: 3,
      addr: { fullName: 'Sneha Reddy', phone: '9848123456', addressLine1: 'Villa 18, Green Meadows, Jubilee Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500033' },
      items: [{ sku: 'SKU-HOME-04', name: 'Smart Air Purifier Room Filter HEPA', quantity: 1, unit_price: 4250.00 }]
    },
    {
      extId: 'ORD-2026-105',
      status: 'READY_TO_SHIP',
      payment: 'COD',
      cod: 1599.00,
      total: 1599.00,
      weight: 0.85,
      whIdx: 0,
      custIdx: 4,
      addr: { fullName: 'Arjun Verma', phone: '9820123456', addressLine1: 'House No 120, Sector 15', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301' },
      items: [{ sku: 'SKU-FIT-05', name: 'Adjustable Resistance Band Fitness Kit', quantity: 1, unit_price: 1599.00 }]
    },
    {
      extId: 'ORD-2026-106',
      status: 'SHIPPED',
      payment: 'PREPAID',
      cod: 0,
      total: 2899.00,
      weight: 1.10,
      whIdx: 1,
      custIdx: 5,
      addr: { fullName: 'Deepika Nair', phone: '9847123456', addressLine1: 'TC 24/89, Kowdiar Main Road', city: 'Thiruvananthapuram', state: 'Kerala', pincode: '695003' },
      items: [{ sku: 'SKU-APPRL-06', name: 'Premium Merino Wool Cardigan', quantity: 1, unit_price: 2899.00 }]
    },
    {
      extId: 'ORD-2026-107',
      status: 'IN_TRANSIT',
      payment: 'COD',
      cod: 2199.00,
      total: 2199.00,
      weight: 0.90,
      whIdx: 0,
      custIdx: 6,
      addr: { fullName: 'Manish Gupta', phone: '9811122334', addressLine1: '204, Royal Palms, Aliganj', city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226024' },
      items: [{ sku: 'SKU-AUDIO-07', name: 'Surround Sound Gaming Headset', quantity: 1, unit_price: 2199.00 }]
    },
    {
      extId: 'ORD-2026-108',
      status: 'OUT_FOR_DELIVERY',
      payment: 'PREPAID',
      cod: 0,
      total: 1250.00,
      weight: 0.50,
      whIdx: 2,
      custIdx: 7,
      addr: { fullName: 'Pooja Iyer', phone: '9840123456', addressLine1: 'A-3, Greenways Road, RA Puram', city: 'Chennai', state: 'Tamil Nadu', pincode: '600028' },
      items: [{ sku: 'SKU-BEAUTY-08', name: 'Organic Herbal Skincare Serum Set', quantity: 1, unit_price: 1250.00 }]
    },
    {
      extId: 'ORD-2026-109',
      status: 'DELIVERED',
      payment: 'PREPAID',
      cod: 0,
      total: 5499.00,
      weight: 2.50,
      whIdx: 1,
      custIdx: 8,
      addr: { fullName: 'Gaurav Kulkarni', phone: '9823123456', addressLine1: 'B-10, Venus Corner, FC Road', city: 'Pune', state: 'Maharashtra', pincode: '411005' },
      items: [{ sku: 'SKU-OFFICE-09', name: 'Ergonomic Mesh Lumbar Desk Chair', quantity: 1, unit_price: 5499.00 }]
    },
    {
      extId: 'ORD-2026-110',
      status: 'DELIVERED',
      payment: 'COD',
      cod: 1850.00,
      total: 1850.00,
      weight: 0.75,
      whIdx: 3,
      custIdx: 9,
      addr: { fullName: 'Ananya Roy', phone: '9831123456', addressLine1: 'Flat 4C, Diamond City North, Jessore Road', city: 'Kolkata', state: 'West Bengal', pincode: '700055' },
      items: [{ sku: 'SKU-KITCH-10', name: 'Stainless Steel Pour-Over Coffee Kettle', quantity: 1, unit_price: 1850.00 }]
    },
    {
      extId: 'ORD-2026-111',
      status: 'NDR',
      payment: 'COD',
      cod: 2999.00,
      total: 2999.00,
      weight: 1.40,
      whIdx: 0,
      custIdx: 0,
      addr: { fullName: 'Amit Patel', phone: '9812345678', addressLine1: 'B-402, Sunrise Apartments, SG Highway', city: 'Ahmedabad', state: 'Gujarat', pincode: '380015' },
      items: [{ sku: 'SKU-TECH-11', name: 'Mechanical Keyboard Wireless RGB Hot-Swap', quantity: 1, unit_price: 2999.00 }]
    },
    {
      extId: 'ORD-2026-112',
      status: 'RTO',
      payment: 'COD',
      cod: 1450.00,
      total: 1450.00,
      weight: 0.80,
      whIdx: 1,
      custIdx: 1,
      addr: { fullName: 'Priya Sharma', phone: '9871122334', addressLine1: 'Flat 12B, Palm Grove Towers, Powai', city: 'Mumbai', state: 'Maharashtra', pincode: '400076' },
      items: [{ sku: 'SKU-DEC-12', name: 'Nordic Ceramic Minimalist Vase Set', quantity: 1, unit_price: 1450.00 }]
    }
  ];

  const createdOrdersMap = {};

  for (const sOrd of sampleOrders) {
    const { data: existing } = await supabase
      .from('orders')
      .select('id, current_status')
      .eq('external_order_id', sOrd.extId)
      .maybeSingle();

    let orderId;
    if (existing) {
      orderId = existing.id;
      await supabase.from('orders').update({
        current_status: sOrd.status,
        updated_at: new Date().toISOString()
      }).eq('id', orderId);
    } else {
      const wh = warehouses[sOrd.whIdx] || warehouses[0];
      const cust = customers[sOrd.custIdx] || customers[0];

      const { data: ord, error: ordErr } = await supabase.from('orders').insert({
        seller_id: SELLER_ID,
        warehouse_id: wh?.id,
        customer_id: cust?.id,
        external_order_id: sOrd.extId,
        source: 'SHOPIFY',
        payment_type: sOrd.payment,
        cod_amount: sOrd.cod,
        total_amount: sOrd.total,
        weight_kg: sOrd.weight,
        length_cm: 25,
        width_cm: 18,
        height_cm: 12,
        shipping_address: sOrd.addr,
        current_status: sOrd.status,
      }).select().single();

      if (ordErr || !ord) {
        console.error(`Order insert failed for ${sOrd.extId}:`, ordErr);
        continue;
      }
      orderId = ord.id;

      // Items
      for (const item of sOrd.items) {
        await supabase.from('order_items').insert({
          order_id: orderId,
          sku: item.sku,
          name: item.name,
          quantity: item.quantity,
          unit_price: item.unit_price,
        });
      }

      // Initial Status Event
      await supabase.from('order_status_events').insert({
        order_id: orderId,
        status: sOrd.status,
        description: `Order ingested via API into ${sOrd.status}`,
      });
    }

    createdOrdersMap[sOrd.extId] = { id: orderId, ...sOrd };
  }

  console.log(`Orders processed: ${Object.keys(createdOrdersMap).length}`);

  console.log('--- 6. Seeding Shipments & Tracking Events ---');
  const shipmentsData = [
    {
      ordExt: 'ORD-2026-104',
      courier: delhivery,
      awb: 'DEL8829102910',
      status: 'PICKUP_SCHEDULED',
      date: '2026-09-10',
      events: [
        { status: 'CREATED', loc: 'Bangalore Whitefield Hub', msg: 'Shipping label created & assigned to Delhivery' }
      ]
    },
    {
      ordExt: 'ORD-2026-105',
      courier: bluedart,
      awb: 'BLU7719283741',
      status: 'PICKUP_SCHEDULED',
      date: '2026-09-10',
      events: [
        { status: 'CREATED', loc: 'Delhi Okhla Hub', msg: 'Electronic manifest created for Blue Dart Priority' }
      ]
    },
    {
      ordExt: 'ORD-2026-106',
      courier: xpressbees,
      awb: 'XPB5544332211',
      status: 'PICKED_UP',
      date: '2026-09-08',
      events: [
        { status: 'CREATED', loc: 'Bhiwandi Hub', msg: 'Shipping label generated' },
        { status: 'PICKED_UP', loc: 'Bhiwandi Hub', msg: 'Shipment handed over to Xpressbees carrier van' }
      ]
    },
    {
      ordExt: 'ORD-2026-107',
      courier: delhivery,
      awb: 'DEL1928374650',
      status: 'IN_TRANSIT',
      date: '2026-09-07',
      events: [
        { status: 'CREATED', loc: 'Delhi Okhla Hub', msg: 'Label generated' },
        { status: 'PICKED_UP', loc: 'Delhi Sorting Center', msg: 'Picked up from warehouse' },
        { status: 'IN_TRANSIT', loc: 'Kanpur Transshipment Facility', msg: 'In transit to Lucknow destination hub' }
      ]
    },
    {
      ordExt: 'ORD-2026-108',
      courier: shadowfax,
      awb: 'SFX8817263540',
      status: 'OUT_FOR_DELIVERY',
      date: '2026-09-07',
      events: [
        { status: 'CREATED', loc: 'Bangalore Hub', msg: 'Label generated' },
        { status: 'IN_TRANSIT', loc: 'Chennai Sorting Hub', msg: 'Arrived at delivery hub' },
        { status: 'OUT_FOR_DELIVERY', loc: 'RA Puram Chennai', msg: 'Out for doorstep delivery by Agent Rajesh (9840112233)' }
      ]
    },
    {
      ordExt: 'ORD-2026-109',
      courier: bluedart,
      awb: 'BLU9988776655',
      status: 'DELIVERED',
      date: '2026-09-06',
      events: [
        { status: 'CREATED', loc: 'Bhiwandi Hub', msg: 'Label generated' },
        { status: 'IN_TRANSIT', loc: 'Pune Hub', msg: 'Transit completed' },
        { status: 'OUT_FOR_DELIVERY', loc: 'FC Road Pune', msg: 'Out for delivery' },
        { status: 'DELIVERED', loc: 'FC Road Pune', msg: 'Delivered and digital signature captured' }
      ]
    },
    {
      ordExt: 'ORD-2026-110',
      courier: ecom,
      awb: 'ECOM882199341',
      status: 'DELIVERED',
      date: '2026-09-06',
      events: [
        { status: 'CREATED', loc: 'Howrah Hub', msg: 'Label generated' },
        { status: 'DELIVERED', loc: 'Jessore Road Kolkata', msg: 'Delivered & COD Cash Collected ₹1,850' }
      ]
    },
    {
      ordExt: 'ORD-2026-111',
      courier: delhivery,
      awb: 'DEL6655443322',
      status: 'NDR',
      date: '2026-09-08',
      events: [
        { status: 'CREATED', loc: 'Delhi Okhla Hub', msg: 'Label generated' },
        { status: 'IN_TRANSIT', loc: 'Ahmedabad Hub', msg: 'Arrived at destination' },
        { status: 'OUT_FOR_DELIVERY', loc: 'SG Highway', msg: 'Out for delivery' },
        { status: 'NDR', loc: 'SG Highway', msg: 'Delivery Attempt Failed: Customer Door Locked / Phone Unreachable' }
      ]
    },
    {
      ordExt: 'ORD-2026-112',
      courier: xpressbees,
      awb: 'XPB3322119988',
      status: 'RTO_IN_TRANSIT',
      date: '2026-09-05',
      events: [
        { status: 'CREATED', loc: 'Bhiwandi Hub', msg: 'Label generated' },
        { status: 'NDR', loc: 'Powai Mumbai', msg: 'Buyer rejected package: Customer cancelled order' },
        { status: 'RTO_IN_TRANSIT', loc: 'Thane Sorting Hub', msg: 'RTO Return in transit back to Bhiwandi origin hub' }
      ]
    }
  ];

  let ndrShipmentId = null;
  let disputeShipmentId = null;

  for (const sShp of shipmentsData) {
    const ord = createdOrdersMap[sShp.ordExt];
    if (!ord) continue;

    const { data: existingShp } = await supabase
      .from('shipments')
      .select('id')
      .eq('awb_number', sShp.awb)
      .maybeSingle();

    let shipmentId;
    if (existingShp) {
      shipmentId = existingShp.id;
      await supabase.from('shipments').update({
        status: sShp.status,
        updated_at: new Date().toISOString()
      }).eq('id', shipmentId);
    } else {
      const { data: newShp, error: shpErr } = await supabase.from('shipments').insert({
        seller_id: SELLER_ID,
        order_id: ord.id,
        courier_id: sShp.courier?.id,
        awb_number: sShp.awb,
        label_url: 'https://pdfobject.com/pdf/sample.pdf',
        status: sShp.status,
        pickup_date: sShp.date,
      }).select().single();

      if (shpErr || !newShp) {
        console.error(`Shipment insert error for ${sShp.awb}:`, shpErr);
        continue;
      }
      shipmentId = newShp.id;

      // Tracking events
      for (const ev of sShp.events) {
        await supabase.from('tracking_events').insert({
          shipment_id: shipmentId,
          raw_status: ev.status,
          normalized_status: ev.status,
          event_time: new Date(Date.now() - 3600000).toISOString(),
          location: ev.loc,
          message: ev.msg,
        });
      }
    }

    if (sShp.status === 'NDR') {
      ndrShipmentId = shipmentId;
    }
    if (sShp.status === 'DELIVERED') {
      disputeShipmentId = shipmentId;
    }
  }

  console.log('Shipments seeded.');

  console.log('--- 7. Seeding NDR Cases ---');
  if (ndrShipmentId) {
    const { data: existingNdr } = await supabase.from('ndr_cases').select('id').eq('shipment_id', ndrShipmentId).maybeSingle();
    if (!existingNdr) {
      await supabase.from('ndr_cases').insert({
        seller_id: SELLER_ID,
        shipment_id: ndrShipmentId,
        reason: 'Customer Door Locked & Contact Number Not Responding on 1st Attempt',
        attempt_count: 1,
        last_attempt_at: new Date(Date.now() - 14400000).toISOString(),
        status: 'NDR_PENDING',
      });
      console.log('Seeded NDR case.');
    }
  }

  console.log('--- 8. Seeding Returns ---');
  const deliveredOrd = createdOrdersMap['ORD-2026-109'];
  if (deliveredOrd) {
    const { data: existingRet } = await supabase.from('returns').select('id').eq('original_order_id', deliveredOrd.id).maybeSingle();
    if (!existingRet) {
      await supabase.from('returns').insert({
        seller_id: SELLER_ID,
        original_order_id: deliveredOrd.id,
        return_reason: 'Size not fitting / Requesting larger dimension exchange',
        return_awb: 'RET-BLU-9928172',
        status: 'REQUESTED',
      });
      console.log('Seeded Return request.');
    }
  }

  console.log('--- 9. Seeding Weight Disputes ---');
  if (disputeShipmentId) {
    const { data: existingDispute } = await supabase.from('weight_discrepancies').select('id').eq('shipment_id', disputeShipmentId).maybeSingle();
    if (!existingDispute) {
      await supabase.from('weight_discrepancies').insert({
        seller_id: SELLER_ID,
        shipment_id: disputeShipmentId,
        declared_weight_kg: 2.50,
        charged_weight_kg: 3.80,
        excess_charge: 114.00,
        status: 'PENDING',
        deadline: new Date(Date.now() + 48 * 3600000).toISOString(),
        evidence_urls: [],
      });
      console.log('Seeded Weight Discrepancy.');
    }
  }

  console.log('--- 10. Seeding Wallets & Ledger Entries ---');
  const { data: currentWallet } = await supabase.from('wallets').select('balance').eq('seller_id', SELLER_ID).maybeSingle();
  const currentBal = currentWallet ? Number(currentWallet.balance) : 0;
  if (!currentWallet || currentBal < 1000) {
    await supabase.from('wallets').upsert({
      seller_id: SELLER_ID,
      balance: 28500.00,
      updated_at: new Date().toISOString()
    });
  }

  const { data: existingLedger } = await supabase.from('ledger_entries').select('id').eq('seller_id', SELLER_ID);
  if (!existingLedger || existingLedger.length < 3) {
    const ledgerSample = [
      {
        seller_id: SELLER_ID,
        type: 'RECHARGE',
        amount: 30000.00,
        direction: 'CREDIT',
        reference_type: 'PAYMENT_GATEWAY',
        reference_id: 'PAY-RZP-99281726',
        idempotency_key: 'rec-001',
      },
      {
        seller_id: SELLER_ID,
        type: 'SHIPMENT_DEBIT',
        amount: 86.00,
        direction: 'DEBIT',
        reference_type: 'AWB',
        reference_id: 'DEL1928374650',
        idempotency_key: 'deb-001',
      },
      {
        seller_id: SELLER_ID,
        type: 'SHIPMENT_DEBIT',
        amount: 114.00,
        direction: 'DEBIT',
        reference_type: 'AWB',
        reference_id: 'BLU9988776655',
        idempotency_key: 'deb-002',
      },
      {
        seller_id: SELLER_ID,
        type: 'COD_CHARGE',
        amount: 40.00,
        direction: 'DEBIT',
        reference_type: 'AWB',
        reference_id: 'ECOM882199341',
        idempotency_key: 'cod-001',
      }
    ];

    for (const led of ledgerSample) {
      await supabase.from('ledger_entries').upsert(led, { onConflict: 'idempotency_key' });
    }
    console.log('Seeded Ledger entries.');
  }

  console.log('--- 11. Seeding COD Remittances ---');
  const { data: existingCod } = await supabase.from('cod_remittances').select('id').eq('seller_id', SELLER_ID);
  if (!existingCod || existingCod.length === 0) {
    await supabase.from('cod_remittances').insert([
      { seller_id: SELLER_ID, remittance_reference: 'COD-BATCH-2026-W36', amount: 18500.00, status: 'SETTLED', settled_at: new Date(Date.now() - 86400000).toISOString() },
      { seller_id: SELLER_ID, remittance_reference: 'COD-BATCH-2026-W37', amount: 12400.00, status: 'PENDING' }
    ]);
  }

  console.log('--- 12. Seeding Developer API Keys & Webhooks ---');
  const { data: existingKeys } = await supabase.from('api_keys').select('id').eq('seller_id', SELLER_ID);
  if (!existingKeys || existingKeys.length === 0) {
    await supabase.from('api_keys').insert([
      {
        seller_id: SELLER_ID,
        name: 'Production Shopify Store Sync',
        key_hash: 'hash_prod_live_shopify_9921',
        key_prefix: 'pk_live_shop_',
        scopes: ['orders:read', 'orders:write', 'rates:read', 'shipments:write'],
        is_active: true,
        last_used_at: new Date().toISOString()
      },
      {
        seller_id: SELLER_ID,
        name: 'Warehouse ERP Automation',
        key_hash: 'hash_erp_sync_9918',
        key_prefix: 'pk_live_erp_',
        scopes: ['shipments:read', 'shipments:write', 'tracking:read'],
        is_active: true,
        last_used_at: new Date(Date.now() - 3600000).toISOString()
      }
    ]);
    console.log('Seeded API Keys.');
  }

  const { data: existingWhk } = await supabase.from('webhook_endpoints').select('id').eq('seller_id', SELLER_ID);
  if (!existingWhk || existingWhk.length === 0) {
    await supabase.from('webhook_endpoints').insert([
      {
        seller_id: SELLER_ID,
        url: 'https://api.apexretail.in/webhooks/shipfaster',
        secret: `whsec_${require('node:crypto').randomBytes(12).toString('hex')}`,
        subscribed_events: ['shipment.in_transit', 'shipment.delivered', 'ndr.raised'],
        is_active: true
      }
    ]);
    console.log('Seeded Webhooks.');
  }

  console.log('--- 13. Seeding Platform Audit Logs ---');
  const { data: existingAudit } = await supabase.from('audit_logs').select('id').limit(5);
  if (!existingAudit || existingAudit.length === 0) {
    await supabase.from('audit_logs').insert([
      {
        seller_id: SELLER_ID,
        user_id: '00000000-0000-0000-0000-000000000001',
        action: 'UPDATE_SELLER_STATUS',
        entity_type: 'SELLER',
        entity_id: SELLER_ID,
        payload: { old: 'DRAFT', new: 'ACTIVE' }
      },
      {
        seller_id: SELLER_ID,
        user_id: '00000000-0000-0000-0000-000000000001',
        action: 'BULK_INGEST_ORDERS',
        entity_type: 'ORDER',
        entity_id: 'ORD-BATCH-100',
        payload: { count: 12 }
      },
      {
        seller_id: SELLER_ID,
        user_id: '00000000-0000-0000-0000-000000000001',
        action: 'RECHARGE_WALLET',
        entity_type: 'WALLET',
        entity_id: 'PAY-RZP-99281726',
        payload: { amount: 30000 }
      }
    ]);
    console.log('Seeded Audit Logs.');
  }

  console.log('✅ LIVE DATABASE SEEDING COMPLETE WITH SUCCESS!');
}

seed().catch(err => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
