import { RateInput } from './adapter.interface';
import { RateQuote } from '../../types';
import { supabase, getEffectiveSellerId } from '../../lib/supabase';

type RateSlabRow = {
  id: string;
  courier_id: string;
  zone: string;
  base_weight_kg: number | string;
  base_freight_rate: number | string;
  additional_weight_step_kg: number | string;
  additional_freight_rate: number | string;
  cod_flat_fee: number | string;
  cod_percent_fee: number | string;
  couriers: { id: string; code: string; name: string; is_active: boolean } | null;
};

function calculateZone(pickup: string, delivery: string): string {
  if (pickup.slice(0, 3) === delivery.slice(0, 3)) return 'LOCAL';
  if (pickup[0] === delivery[0]) return 'ZONAL';
  return 'NATIONAL';
}

export class RateEngine {
  async fetchComparisonQuotes(input: RateInput): Promise<RateQuote[]> {
    const sellerId = await getEffectiveSellerId(input.sellerId);
    const requestedZone = calculateZone(input.pickupPincode, input.deliveryPincode);
    const { data, error } = await supabase
      .from('rate_slabs')
      .select('*, couriers!inner(id, code, name, is_active)')
      .eq('couriers.is_active', true);

    if (error) throw new Error(`Unable to load live courier rates: ${error.message}`);

    const rows = (data || []) as unknown as RateSlabRow[];
    const zoneRows = rows.some((row) => row.zone.toUpperCase() === requestedZone)
      ? rows.filter((row) => row.zone.toUpperCase() === requestedZone)
      : rows;
    const expiresAt = new Date(Date.now() + 15 * 60_000).toISOString();

    const quotes = zoneRows.map((row): RateQuote => {
      const baseWeight = Number(row.base_weight_kg);
      const step = Math.max(Number(row.additional_weight_step_kg), 0.001);
      const extraSteps = Math.max(0, Math.ceil((input.weightKg - baseWeight) / step));
      const baseRate = Number(row.base_freight_rate) + extraSteps * Number(row.additional_freight_rate);
      const codCharge = input.paymentType === 'COD'
        ? Math.max(Number(row.cod_flat_fee), input.orderValue * Number(row.cod_percent_fee) / 100)
        : 0;
      const taxAmount = (baseRate + codCharge) * 0.18;
      const courier = row.couriers!;
      return {
        id: row.id,
        seller_id: sellerId,
        order_id: input.orderId,
        courier_id: courier.id,
        courier_name: courier.name,
        courier_code: courier.code,
        service_name: row.zone,
        base_rate: baseRate,
        cod_charge: codCharge,
        surcharges: 0,
        tax_amount: taxAmount,
        total_rate: baseRate + codCharge + taxAmount,
        estimated_days: requestedZone === 'LOCAL' ? 1 : requestedZone === 'ZONAL' ? 3 : 5,
        expires_at: expiresAt,
      };
    });

    if (!quotes.length) return [];
    const cheapest = quotes.reduce((a, b) => a.total_rate <= b.total_rate ? a : b);
    const fastest = quotes.reduce((a, b) => a.estimated_days <= b.estimated_days ? a : b);
    return quotes.map((quote) => ({
      ...quote,
      recommendation_badge: quote.id === cheapest.id
        ? 'Cheapest'
        : quote.id === fastest.id ? 'Fastest' : undefined,
    }));
  }
}

export const rateEngine = new RateEngine();
