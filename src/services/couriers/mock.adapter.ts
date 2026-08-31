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
      labelUrl: `https://pdfobject.com/pdf/sample.pdf`,
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
      labelUrl: `https://pdfobject.com/pdf/sample.pdf`
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
    const now = new Date();
    return {
      awbNumber,
      normalizedStatus: 'IN_TRANSIT',
      currentStatus: 'In Transit to Destination Hub',
      estimatedDeliveryDate: new Date(now.getTime() + 2 * 86400000).toISOString(),
      events: [
        {
          id: `evt-1`,
          shipment_id: awbNumber,
          raw_status: 'MANIFEST_CREATED',
          normalized_status: 'CREATED',
          event_time: new Date(now.getTime() - 36 * 3600000).toISOString(),
          location: 'Delhi Hub',
          message: 'Shipping label & manifest generated'
        },
        {
          id: `evt-2`,
          shipment_id: awbNumber,
          raw_status: 'PICKED_UP',
          normalized_status: 'PICKED_UP',
          event_time: new Date(now.getTime() - 24 * 3600000).toISOString(),
          location: 'Okhla Hub',
          message: 'Package picked up by executive'
        },
        {
          id: `evt-3`,
          shipment_id: awbNumber,
          raw_status: 'IN_TRANSIT',
          normalized_status: 'IN_TRANSIT',
          event_time: new Date(now.getTime() - 8 * 3600000).toISOString(),
          location: 'National Sorting Center',
          message: 'Arrived at sorting facility'
        }
      ]
    };
  }
}
