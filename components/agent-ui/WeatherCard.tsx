"use client";

import { Sun, Cloud, CloudRain, Snowflake, Lightning, CloudSun, Bag } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface WeatherDay {
  date: string;
  label: string;
  icon: 'sun' | 'cloud' | 'rain' | 'snow' | 'storm' | 'partly-cloudy';
  high: number;
  low: number;
  precipitation: number;
}

export interface WeatherData {
  destination: string;
  unit: 'C' | 'F';
  days: WeatherDay[];
  packingTips: string[];
}

const WeatherIcon = ({ icon, className }: { icon: WeatherDay['icon']; className?: string }) => {
  const cls = cn("w-6 h-6", className);
  switch (icon) {
    case 'sun': return <Sun weight="fill" className={cn(cls, "text-yellow-400")} />;
    case 'cloud': return <Cloud weight="fill" className={cn(cls, "text-gray-400")} />;
    case 'rain': return <CloudRain weight="fill" className={cn(cls, "text-blue-400")} />;
    case 'snow': return <Snowflake weight="fill" className={cn(cls, "text-blue-200")} />;
    case 'storm': return <Lightning weight="fill" className={cn(cls, "text-purple-400")} />;
    case 'partly-cloudy': return <CloudSun weight="fill" className={cn(cls, "text-yellow-300")} />;
  }
};

export function WeatherCard({ data }: { data: WeatherData }) {
  const allHighs = data.days.map(d => d.high);
  const maxTemp = Math.max(...allHighs);
  const minTemp = Math.min(...data.days.map(d => d.low));
  const tempRange = maxTemp - minTemp || 1;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden w-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 bg-sky-50">
        <p className="text-xs font-semibold text-sky-600 uppercase tracking-wide">Weather Forecast</p>
        <p className="text-sm font-medium text-gray-700 mt-0.5">{data.destination}</p>
      </div>

      {/* Day strip */}
      <div className="flex overflow-x-auto px-4 py-3 gap-3 scrollbar-none">
        {data.days.map((day, i) => {
          const highPct = ((day.high - minTemp) / tempRange) * 60 + 20;
          const lowPct = ((day.low - minTemp) / tempRange) * 60 + 20;
          return (
            <div key={i} className="flex flex-col items-center gap-1.5 min-w-[52px]">
              <span className="text-xs text-gray-500 font-medium whitespace-nowrap">{day.label}</span>
              <WeatherIcon icon={day.icon} />
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-xs font-bold text-gray-800">{day.high}°</span>
                <div className="w-1 rounded-full bg-linear-to-b from-orange-300 to-blue-300" style={{ height: `${Math.max(highPct - lowPct, 8)}px` }} />
                <span className="text-xs text-gray-400">{day.low}°</span>
              </div>
              {day.precipitation > 0 && (
                <span className="text-xs text-blue-400">{day.precipitation}mm</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Packing tips */}
      {data.packingTips.length > 0 && (
        <div className="px-4 pb-3 border-t border-gray-50 pt-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Bag weight="fill" className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pack</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.packingTips.map((tip, i) => (
              <span key={i} className="px-2.5 py-1 text-xs rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                {tip}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
