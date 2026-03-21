import type { WeatherData, WeatherDay } from '@/components/agent-ui/WeatherCard';

interface TripParams {
  destination: string;
  dates?: { from: string; to: string };
}

const GEOCODE_MAP: Record<string, { lat: number; lon: number }> = {
  tokyo: { lat: 35.6762, lon: 139.6503 },
  osaka: { lat: 34.6937, lon: 135.5022 },
  kyoto: { lat: 35.0116, lon: 135.7681 },
  paris: { lat: 48.8566, lon: 2.3522 },
  london: { lat: 51.5074, lon: -0.1278 },
  rome: { lat: 41.9028, lon: 12.4964 },
  barcelona: { lat: 41.3851, lon: 2.1734 },
  amsterdam: { lat: 52.3676, lon: 4.9041 },
  bangkok: { lat: 13.7563, lon: 100.5018 },
  bali: { lat: -8.3405, lon: 115.0920 },
  singapore: { lat: 1.3521, lon: 103.8198 },
  sydney: { lat: -33.8688, lon: 151.2093 },
  'new york': { lat: 40.7128, lon: -74.0060 },
  dubai: { lat: 25.2048, lon: 55.2708 },
  istanbul: { lat: 41.0082, lon: 28.9784 },
  cairo: { lat: 30.0444, lon: 31.2357 },
  'mexico city': { lat: 19.4326, lon: -99.1332 },
  'buenos aires': { lat: -34.6037, lon: -58.3816 },
  'rio de janeiro': { lat: -22.9068, lon: -43.1729 },
  toronto: { lat: 43.6532, lon: -79.3832 },
  vancouver: { lat: 49.2827, lon: -123.1207 },
  seoul: { lat: 37.5665, lon: 126.9780 },
  beijing: { lat: 39.9042, lon: 116.4074 },
  'hong kong': { lat: 22.3193, lon: 114.1694 },
  mumbai: { lat: 19.0760, lon: 72.8777 },
  delhi: { lat: 28.6139, lon: 77.2090 },
};

function getCoords(destination: string): { lat: number; lon: number } | null {
  const lower = destination.toLowerCase();
  for (const [key, coords] of Object.entries(GEOCODE_MAP)) {
    if (lower.includes(key)) return coords;
  }
  return null;
}

type WMOCode = 0 | 1 | 2 | 3 | 45 | 48 | 51 | 53 | 55 | 61 | 63 | 65 | 71 | 73 | 75 | 80 | 81 | 82 | 95 | 96 | 99;

function wmoToIcon(code: number): WeatherDay['icon'] {
  if (code === 0) return 'sun';
  if (code <= 2) return 'partly-cloudy';
  if (code <= 3) return 'cloud';
  if (code <= 48) return 'cloud';
  if (code <= 67) return 'rain';
  if (code <= 77) return 'snow';
  if (code <= 82) return 'rain';
  return 'storm';
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
}

function getPackingTips(days: WeatherDay[]): string[] {
  const tips: string[] = [];
  const avgHigh = days.reduce((s, d) => s + d.high, 0) / days.length;
  const hasRain = days.some(d => ['rain', 'storm'].includes(d.icon));
  const hasCold = days.some(d => d.low < 10);
  const hasHot = avgHigh > 28;
  const hasSnow = days.some(d => d.icon === 'snow');

  if (hasSnow) tips.push('Heavy coat', 'Waterproof boots', 'Thermal layers');
  else if (hasCold) tips.push('Light jacket', 'Layers');
  if (hasHot) tips.push('Sunscreen', 'Light clothing', 'Hat');
  if (hasRain) tips.push('Umbrella', 'Waterproof jacket');
  if (!tips.length) tips.push('Comfortable walking shoes');
  return tips;
}

export async function runWeatherAgent(params: TripParams): Promise<WeatherData> {
  const coords = getCoords(params.destination);

  if (!coords) {
    return getMockWeather(params.destination);
  }

  try {
    const startDate = params.dates?.from ?? new Date().toISOString().split('T')[0];
    const endDate = params.dates?.to ?? getDateDaysAhead(7);

    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(coords.lat));
    url.searchParams.set('longitude', String(coords.lon));
    url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode');
    url.searchParams.set('start_date', startDate);
    url.searchParams.set('end_date', endDate);
    url.searchParams.set('timezone', 'auto');

    const res = await fetch(url.toString());
    const json = await res.json();
    const daily = json.daily;

    const days: WeatherDay[] = daily.time.map((date: string, i: number) => ({
      date,
      label: getDayLabel(date),
      icon: wmoToIcon(daily.weathercode[i]),
      high: Math.round(daily.temperature_2m_max[i]),
      low: Math.round(daily.temperature_2m_min[i]),
      precipitation: parseFloat((daily.precipitation_sum[i] ?? 0).toFixed(1)),
    }));

    const packingTips = getPackingTips(days);

    return { destination: params.destination, unit: 'C', days, packingTips };
  } catch {
    return getMockWeather(params.destination);
  }
}

function getDateDaysAhead(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function getMockWeather(destination: string): WeatherData {
  const days: WeatherDay[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      date: d.toISOString().split('T')[0],
      label: getDayLabel(d.toISOString().split('T')[0]),
      icon: ['sun', 'partly-cloudy', 'sun', 'cloud', 'rain', 'partly-cloudy', 'sun'][i] as WeatherDay['icon'],
      high: 22 + Math.floor(Math.random() * 6),
      low: 14 + Math.floor(Math.random() * 4),
      precipitation: i === 4 ? 3.2 : 0,
    };
  });
  return { destination, unit: 'C', days, packingTips: ['Comfortable shoes', 'Light jacket', 'Sunscreen'] };
}
