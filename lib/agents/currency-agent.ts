import type { CurrencyData } from '@/components/agent-ui/CurrencyCard';

interface TripParams {
  destination: string;
  baseCurrency?: string;
}

const CURRENCY_MAP: Record<string, string> = {
  japan: 'JPY', france: 'EUR', germany: 'EUR', italy: 'EUR', spain: 'EUR',
  thailand: 'THB', indonesia: 'IDR', vietnam: 'VND', singapore: 'SGD',
  uk: 'GBP', 'united kingdom': 'GBP', england: 'GBP',
  australia: 'AUD', canada: 'CAD', mexico: 'MXN',
  brazil: 'BRL', india: 'INR', china: 'CNY', 'south korea': 'KRW', korea: 'KRW',
  'new zealand': 'NZD', switzerland: 'CHF', turkey: 'TRY',
  egypt: 'EGP', morocco: 'MAD', 'south africa': 'ZAR',
  argentina: 'ARS', colombia: 'COP', peru: 'PEN',
  portugal: 'EUR', greece: 'EUR', netherlands: 'EUR',
  dubai: 'AED', uae: 'AED', 'united arab emirates': 'AED',
};

function getCurrencyCode(destination: string): string {
  const lower = destination.toLowerCase();
  for (const [key, code] of Object.entries(CURRENCY_MAP)) {
    if (lower.includes(key)) return code;
  }
  return 'USD';
}

export async function runCurrencyAgent(params: TripParams): Promise<CurrencyData> {
  const from = params.baseCurrency ?? 'USD';
  const to = getCurrencyCode(params.destination);

  if (from === to) {
    return {
      from, to: 'LOCAL',
      rate: 1, trend: 'stable', trendPct: 0,
      quickConversions: [
        { usd: 10, local: 10 }, { usd: 50, local: 50 },
        { usd: 100, local: 100 }, { usd: 500, local: 500 },
      ],
    };
  }

  try {
    const res = await fetch(
      `https://api.exchangerate.host/latest?base=${from}&symbols=${to}`,
      { next: { revalidate: 3600 } }
    );
    const json = await res.json();
    const rate: number = json?.rates?.[to] ?? 1;

    const weekRes = await fetch(
      `https://api.exchangerate.host/timeseries?base=${from}&symbols=${to}&start_date=${getDateDaysAgo(7)}&end_date=${getDateDaysAgo(0)}`,
      { next: { revalidate: 3600 } }
    );
    const weekJson = await weekRes.json();
    const weekRates = Object.values(weekJson?.rates ?? {}) as Record<string, number>[];
    const oldRate = weekRates[0]?.[to] ?? rate;
    const trendPct = parseFloat((((rate - oldRate) / oldRate) * 100).toFixed(2));
    const trend = Math.abs(trendPct) < 0.5 ? 'stable' : trendPct > 0 ? 'up' : 'down';

    const amounts = [10, 50, 100, 500];
    const quickConversions = amounts.map(usd => ({
      usd,
      local: Math.round(usd * rate),
    }));

    return { from, to, rate: parseFloat(rate.toFixed(4)), trend, trendPct, quickConversions };
  } catch {
    const fallbackRate = getFallbackRate(to);
    return {
      from, to, rate: fallbackRate, trend: 'stable', trendPct: 0,
      quickConversions: [10, 50, 100, 500].map(usd => ({ usd, local: Math.round(usd * fallbackRate) })),
    };
  }
}

function getDateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

function getFallbackRate(currency: string): number {
  const rates: Record<string, number> = {
    JPY: 149, EUR: 0.92, GBP: 0.79, THB: 35, SGD: 1.34,
    AUD: 1.53, CAD: 1.36, INR: 83, KRW: 1320, CNY: 7.2,
    MXN: 17, BRL: 5, IDR: 15500, VND: 24800,
  };
  return rates[currency] ?? 1;
}
