import { 
  CourierAdapter, ServiceabilityInput, ServiceabilityResult, 
  RateInput, ShipmentInput, ShipmentResult, LabelInput, LabelResult, 
  PickupInput, PickupResult, TrackingResult 
} from './adapter.interface';
import { RateQuote, ShipmentStatus } from '../../types';

export class MockCourierAdapter implements CourierAdapter {
  code: string;
  name: string;
  private courierId: string;
  private baseMultiplier: number;
  private etaOffset: number;

  constructor(code: string, name: string, courierId: string, baseMultiplier: number = 1.0, etaOffset: number = 0) {
    this.code = code;
    this.name = name;
    this.courierId = courierId;
    this.baseMultiplier = baseMultiplier;
    this.etaOffset = etaOffset;
  }

  async checkServiceability(input: ServiceabilityInput): Promise<ServiceabilityResult> {
    // Simulate API delay
    await new Promise(res => setTimeout(res, 120 + Math.random() * 150));
    
    // Remote pincodes starting with '79' or '19' might be restricted for demo
    const isServiceable = !input.deliveryPincode.startsWith('00');

    return {
      courierId: this.courierId,
      courierCode: this.code,
      courierName: this.name,
      isServiceable,
      estimatedDays: Math.max(2, 3 + this.etaOffset),
      reason: isServiceable ? undefined : 'Pincode non-serviceable for heavy parcels'
    };
  }

  async getRates(input: RateInput): Promise<RateQuote[]> {
    const serviceability = await this.checkServiceability(input);
    if (!serviceability.isServiceable) return [];

    // Calculate freight rate based on weight slab (500g slabs)
    const weightSlabs = Math.ceil(input.weightKg / 0.5);
    const baseFreight = (50 + (weightSlabs - 1) * 25) * this.baseMultiplier;
    
    const codCharge = input.paymentType === 'COD' 
      ? Math.max(30, Number((input.orderValue * 0.018).toFixed(2))) 
      : 0;

    const surcharges = Number((baseFreight * 0.10).toFixed(2)); // Fuel surcharge 10%
    const subtotal = baseFreight + codCharge + surcharges;
    const taxAmount = Number((subtotal * 0.18).toFixed(2)); // GST 18%
    const totalRate = Number((subtotal + taxAmount).toFixed(2));

    const quoteId = `quote-${this.code}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 mins validity

    return [{
      id: quoteId,
      seller_id: input.sellerId,
      order_id: input.orderId,
      courier_id: this.courierId,
      courier_name: this.name,
      courier_code: this.code,
      service_name: `${this.name} Surface Express`,
      base_rate: Number(baseFreight.toFixed(2)),
      cod_charge: codCharge,
      surcharges,
      tax_amount: taxAmount,
      total_rate: totalRate,
      estimated_days: serviceability.estimatedDays,
      expires_at: expiresAt
    }];
  }

  async createShipment(input: ShipmentInput): Promise<ShipmentResult> {
    await new Promise(res => setTimeout(res, 250));

    const prefix = this.code.slice(0, 3).toUpperCase();
    const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
    const awbNumber = `${prefix}${randomDigits}`;

    return {
      success: true,
      awbNumber,
      courierId: this.courierId,
      shipmentId: `shp-${Date.now()}`,
      labelUrl: '',
      status: 'CREATED',
      pickupDate: new Date(Date.now() + 86400000).toISOString().split('T')[0]
    };
  }

  async cancelShipment(awbNumber: string): Promise<boolean> {
    await new Promise(res => setTimeout(res, 150));
    return true;
  }

  async generateLabel(input: LabelInput): Promise<LabelResult> {
    return {
      awbNumber: input.awbNumber,
      labelUrl: ''
    };
  }

  async schedulePickup(input: PickupInput): Promise<PickupResult> {
    await new Promise(res => setTimeout(res, 200));
    return {
      success: true,
      pickupReference: `PU-${this.code.toUpperCase()}-${Date.now()}`,
      scheduledDate: input.pickupDate
    };
  }

  async trackShipment(awbNumber: string): Promise<TrackingResult> {
    const cleanAwb = awbNumber.trim().toUpperCase();
    const now = new Date();

    // Simulate invalid or not-found AWBs
    if (cleanAwb.startsWith('INV') || cleanAwb.length < 6 || cleanAwb === '000000') {
      throw new Error(`Shipment with AWB ${cleanAwb} not found in carrier network.`);
    }

    // 1. Delivered Case (Shadowfax or contains SFX/DELV)
    if (cleanAwb.startsWith('SFX') || cleanAwb.includes('DELV') || cleanAwb === 'SFX8817263540') {
      return {
        awbNumber: cleanAwb,
        normalizedStatus: 'DELIVERED',
        currentStatus: 'Package Delivered Successfully',
        courierName: 'Shadowfax Logistics',
        courierCode: 'shadowfax',
        orderId: '#ORD-1004',
        originCity: 'Mumbai, MH',
        originPincode: '400050',
        destinationCity: 'Pune, MH',
        destinationPincode: '411001',
        recipientName: 'Kavita Nair',
        weightKg: 0.35,
        paymentMode: 'PREPAID',
        estimatedDeliveryDate: new Date(now.getTime() - 3 * 3600000).toISOString(),
        podDetails: {
          deliveredAt: new Date(now.getTime() - 3 * 3600000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          receivedBy: 'Kavita Nair',
          relation: 'Self / Consignee',
          signatureUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10 25 Q 30 10, 50 25 T 90 20" stroke="%232563eb" stroke-width="2" fill="none"/></svg>'
        },
        events: [
          {
            id: 'evt-sf-1',
            shipment_id: cleanAwb,
            raw_status: 'MANIFEST_CREATED',
            normalized_status: 'CREATED',
            event_time: new Date(now.getTime() - 30 * 3600000).toISOString(),
            location: 'Mumbai Central Hub (400050)',
            message: 'Electronic manifest received & consignment registered'
          },
          {
            id: 'evt-sf-2',
            shipment_id: cleanAwb,
            raw_status: 'PICKED_UP',
            normalized_status: 'PICKED_UP',
            event_time: new Date(now.getTime() - 22 * 3600000).toISOString(),
            location: 'Andheri West Warehouse',
            message: 'Handover complete to Shadowfax express courier'
          },
          {
            id: 'evt-sf-3',
            shipment_id: cleanAwb,
            raw_status: 'IN_TRANSIT',
            normalized_status: 'IN_TRANSIT',
            event_time: new Date(now.getTime() - 14 * 3600000).toISOString(),
            location: 'Pune Express Gateway',
            message: 'Departed Mumbai Gateway for Pune Hub'
          },
          {
            id: 'evt-sf-4',
            shipment_id: cleanAwb,
            raw_status: 'OUT_FOR_DELIVERY',
            normalized_status: 'OUT_FOR_DELIVERY',
            event_time: new Date(now.getTime() - 6 * 3600000).toISOString(),
            location: 'Kothrud Hub, Pune (411001)',
            message: 'Assigned to delivery agent for doorstep fulfillment'
          },
          {
            id: 'evt-sf-5',
            shipment_id: cleanAwb,
            raw_status: 'DELIVERED',
            normalized_status: 'DELIVERED',
            event_time: new Date(now.getTime() - 3 * 3600000).toISOString(),
            location: 'Pune Doorstep (411001)',
            message: 'Delivered to Kavita Nair. Digital signature acknowledged'
          }
        ]
      };
    }

    // 2. NDR / Delivery Attempt Failed (Ecom Express or contains NDR)
    if (cleanAwb.startsWith('ECOM') || cleanAwb.includes('NDR') || cleanAwb === 'ECOM882199341') {
      return {
        awbNumber: cleanAwb,
        normalizedStatus: 'NDR',
        currentStatus: 'Delivery Attempt #2 Failed — Customer Unavailable',
        courierName: 'Ecom Express',
        courierCode: 'ecom',
        orderId: '#ORD-1003',
        originCity: 'Surat, GJ',
        originPincode: '395001',
        destinationCity: 'Jaipur, RJ',
        destinationPincode: '302001',
        recipientName: 'Rahul Meena',
        weightKg: 0.65,
        paymentMode: 'COD',
        codAmount: 850,
        estimatedDeliveryDate: new Date(now.getTime() + 24 * 3600000).toISOString(),
        deliveryAgent: {
          name: 'Sunil Verma',
          phone: '+91 99887 76655',
          hub: 'Jaipur Central Delivery Hub (PIN 302001)'
        },
        ndrDetails: {
          attemptCount: 2,
          reason: 'Customer phone unreachable & premise gate closed',
          lastAttemptAt: new Date(now.getTime() - 2 * 3600000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        },
        events: [
          {
            id: 'evt-ndr-1',
            shipment_id: cleanAwb,
            raw_status: 'MANIFEST_CREATED',
            normalized_status: 'CREATED',
            event_time: new Date(now.getTime() - 36 * 3600000).toISOString(),
            location: 'Surat Textile Hub (395001)',
            message: 'Manifest created for COD delivery'
          },
          {
            id: 'evt-ndr-2',
            shipment_id: cleanAwb,
            raw_status: 'IN_TRANSIT',
            normalized_status: 'IN_TRANSIT',
            event_time: new Date(now.getTime() - 18 * 3600000).toISOString(),
            location: 'Jaipur Processing Hub',
            message: 'Arrived at destination transit facility'
          },
          {
            id: 'evt-ndr-3',
            shipment_id: cleanAwb,
            raw_status: 'OUT_FOR_DELIVERY',
            normalized_status: 'OUT_FOR_DELIVERY',
            event_time: new Date(now.getTime() - 6 * 3600000).toISOString(),
            location: 'Jaipur Hub (302001)',
            message: 'Out for delivery attempt with executive Sunil Verma'
          },
          {
            id: 'evt-ndr-4',
            shipment_id: cleanAwb,
            raw_status: 'NDR_ATTEMPT_FAILED',
            normalized_status: 'NDR',
            event_time: new Date(now.getTime() - 2 * 3600000).toISOString(),
            location: 'Jaipur (302001)',
            message: 'Attempt Failed: Customer unreachable. Reattempt scheduled'
          }
        ]
      };
    }

    // 3. In Transit (Xpressbees or contains XPB/TRANSIT)
    if (cleanAwb.startsWith('XPB') || cleanAwb.includes('AIR') || cleanAwb === 'XPB9928172610') {
      return {
        awbNumber: cleanAwb,
        normalizedStatus: 'IN_TRANSIT',
        currentStatus: 'In Transit between Sorting Facility and Hub',
        courierName: 'Xpressbees Logistics',
        courierCode: 'xpressbees',
        orderId: '#ORD-1002',
        originCity: 'Bengaluru, KA',
        originPincode: '560001',
        destinationCity: 'Gurugram, HR',
        destinationPincode: '122002',
        recipientName: 'Vikram Malhotra',
        weightKg: 0.85,
        paymentMode: 'PREPAID',
        estimatedDeliveryDate: new Date(now.getTime() + 26 * 3600000).toISOString(),
        events: [
          {
            id: 'evt-xpb-1',
            shipment_id: cleanAwb,
            raw_status: 'MANIFEST_CREATED',
            normalized_status: 'CREATED',
            event_time: new Date(now.getTime() - 28 * 3600000).toISOString(),
            location: 'Bengaluru Fulfillment Center (560001)',
            message: 'Air AWB generated & packaging verified'
          },
          {
            id: 'evt-xpb-2',
            shipment_id: cleanAwb,
            raw_status: 'PICKED_UP',
            normalized_status: 'PICKED_UP',
            event_time: new Date(now.getTime() - 20 * 3600000).toISOString(),
            location: 'Kempegowda Cargo Terminal',
            message: 'Air cargo scan completed and loaded on flight'
          },
          {
            id: 'evt-xpb-3',
            shipment_id: cleanAwb,
            raw_status: 'IN_TRANSIT',
            normalized_status: 'IN_TRANSIT',
            event_time: new Date(now.getTime() - 5 * 3600000).toISOString(),
            location: 'IGI Airport T3 Cargo Hub (Delhi)',
            message: 'Arrived at transshipment hub. Processing dispatch to Gurugram'
          }
        ]
      };
    }

    // 4. Default: Out for Delivery (Delhivery or standard AWB)
    return {
      awbNumber: cleanAwb,
      normalizedStatus: 'OUT_FOR_DELIVERY',
      currentStatus: 'Out for Delivery with Rajesh Kumar',
      courierName: cleanAwb.startsWith('DTC') ? 'DTDC Express' : 'Delhivery Direct',
      courierCode: cleanAwb.startsWith('DTC') ? 'dtdc' : 'delhivery',
      orderId: '#ORD-1001',
      originCity: 'New Delhi, DL',
      originPincode: '110020',
      destinationCity: 'Mumbai, MH',
      destinationPincode: '400001',
      recipientName: 'Aditi Sharma',
      weightKg: 0.48,
      paymentMode: 'COD',
      codAmount: 1499,
      estimatedDeliveryDate: new Date(now.getTime() + 4 * 3600000).toISOString(),
      deliveryAgent: {
        name: 'Rajesh Kumar',
        phone: '+91 98765 82910',
        hub: 'Delhivery Bandra West Hub (PIN 400001)'
      },
      events: [
        {
          id: `evt-del-1`,
          shipment_id: cleanAwb,
          raw_status: 'MANIFEST_CREATED',
          normalized_status: 'CREATED',
          event_time: new Date(now.getTime() - 36 * 3600000).toISOString(),
          location: 'Delhi Okhla Hub (110020)',
          message: 'Shipping label & COD manifest generated'
        },
        {
          id: `evt-del-2`,
          shipment_id: cleanAwb,
          raw_status: 'PICKED_UP',
          normalized_status: 'PICKED_UP',
          event_time: new Date(now.getTime() - 24 * 3600000).toISOString(),
          location: 'Delhi Hub',
          message: 'Package picked up by executive'
        },
        {
          id: `evt-del-3`,
          shipment_id: cleanAwb,
          raw_status: 'IN_TRANSIT',
          normalized_status: 'IN_TRANSIT',
          event_time: new Date(now.getTime() - 12 * 3600000).toISOString(),
          location: 'Western Inter-Hub Transit Facility',
          message: 'Arrived at Mumbai Central Gateway'
        },
        {
          id: `evt-del-4`,
          shipment_id: cleanAwb,
          raw_status: 'OUT_FOR_DELIVERY',
          normalized_status: 'OUT_FOR_DELIVERY',
          event_time: new Date(now.getTime() - 2 * 3600000).toISOString(),
          location: 'Bandra West Hub (400001)',
          message: 'Out for delivery. Rajesh Kumar assigned for doorstep fulfillment'
        }
      ]
    };
  }
}
