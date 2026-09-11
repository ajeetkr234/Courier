import { RateQuote, Shipment, TrackingEvent, ShipmentStatus } from '../../types';

export interface ServiceabilityInput {
  pickupPincode: string;
  deliveryPincode: string;
  weightKg: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  paymentType: 'PREPAID' | 'COD';
  orderValue: number;
}

export interface ServiceabilityResult {
  courierId: string;
  courierCode: string;
  courierName: string;
  isServiceable: boolean;
  estimatedDays: number;
  reason?: string;
}

export interface RateInput extends ServiceabilityInput {
  sellerId: string;
  orderId?: string;
}

export interface ShipmentInput {
  sellerId: string;
  orderId: string;
  courierId: string;
  warehouseId: string;
  pickupPincode: string;
  deliveryPincode: string;
  weightKg: number;
  paymentType: 'PREPAID' | 'COD';
  codAmount: number;
  totalAmount: number;
  shippingAddress: any;
  items: any[];
}

export interface ShipmentResult {
  success: boolean;
  awbNumber: string;
  courierId: string;
  shipmentId: string;
  labelUrl: string;
  status: ShipmentStatus;
  pickupDate: string;
}

export interface LabelInput {
  awbNumber: string;
  format?: 'A4' | 'THERMAL_4X6';
}

export interface LabelResult {
  awbNumber: string;
  labelUrl: string;
  pdfBase64?: string;
}

export interface PickupInput {
  sellerId: string;
  warehouseId: string;
  courierId: string;
  pickupDate: string;
  expectedPackageCount: number;
}

export interface PickupResult {
  success: boolean;
  pickupReference: string;
  scheduledDate: string;
}

export interface TrackingResult {
  awbNumber: string;
  normalizedStatus: ShipmentStatus;
  currentStatus: string;
  estimatedDeliveryDate?: string;
  events: TrackingEvent[];
  courierName?: string;
  courierCode?: string;
  orderId?: string;
  originCity?: string;
  originPincode?: string;
  destinationCity?: string;
  destinationPincode?: string;
  recipientName?: string;
  weightKg?: number;
  paymentMode?: 'PREPAID' | 'COD';
  codAmount?: number;
  deliveryAgent?: {
    name: string;
    phone: string;
    hub: string;
  };
  podDetails?: {
    deliveredAt: string;
    receivedBy: string;
    relation?: string;
    signatureUrl?: string;
  };
  ndrDetails?: {
    attemptCount: number;
    reason: string;
    lastAttemptAt: string;
  };
}

export interface CourierAdapter {
  code: string;
  name: string;
  checkServiceability(input: ServiceabilityInput): Promise<ServiceabilityResult>;
  getRates(input: RateInput): Promise<RateQuote[]>;
  createShipment(input: ShipmentInput): Promise<ShipmentResult>;
  cancelShipment(awbNumber: string): Promise<boolean>;
  generateLabel(input: LabelInput): Promise<LabelResult>;
  schedulePickup(input: PickupInput): Promise<PickupResult>;
  trackShipment(awbNumber: string): Promise<TrackingResult>;
}
