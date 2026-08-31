import { CourierAdapter, RateInput } from './adapter.interface';
import { MockCourierAdapter } from './mock.adapter';
import { RateQuote } from '../../types';

export class RateEngine {
  private adapters: CourierAdapter[] = [];

  constructor() {
    // Register V1 adapters
    this.adapters = [
      new MockCourierAdapter('delhivery', 'Delhivery Direct', 'c-delhivery', 1.0, 0),
      new MockCourierAdapter('xpressbees', 'Xpressbees Express', 'c-xpressbees', 1.15, -1),
      new MockCourierAdapter('ecom', 'Ecom Express', 'c-ecom', 0.92, 1),
      new MockCourierAdapter('shadowfax', 'Shadowfax Local', 'c-shadowfax', 1.05, 0),
    ];
  }

  async fetchComparisonQuotes(input: RateInput): Promise<RateQuote[]> {
    const promises = this.adapters.map(adapter => adapter.getRates(input));
    const results = await Promise.allSettled(promises);

    const quotes: RateQuote[] = [];

    results.forEach(res => {
      if (res.status === 'fulfilled' && res.value.length > 0) {
        quotes.push(...res.value);
      }
    });

    if (quotes.length === 0) return [];

    // Sort to determine recommendation badges
    // 1. Find cheapest
    let cheapestQuote = quotes[0];
    let fastestQuote = quotes[0];

    quotes.forEach(q => {
      if (q.total_rate < cheapestQuote.total_rate) {
        cheapestQuote = q;
      }
      if (q.estimated_days < fastestQuote.estimated_days) {
        fastestQuote = q;
      }
    });

    // Tag quotes
    return quotes.map(q => {
      let badge: RateQuote['recommendation_badge'];
      if (q.id === cheapestQuote.id) {
        badge = 'Cheapest';
      } else if (q.id === fastestQuote.id) {
        badge = 'Fastest';
      } else if (q.courier_code === 'delhivery') {
        badge = 'Recommended';
      }

      return {
        ...q,
        recommendation_badge: badge
      };
    });
  }
}

export const rateEngine = new RateEngine();
