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
    <div
      className="rounded-[28px] overflow-hidden w-full border border-white/12"
      style={{
        background: "linear-gradient(180deg, rgba(14,29,73,0.98) 0%, rgba(9,20,55,0.98) 100%)",
        boxShadow: "0 24px 56px rgba(5,10,33,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3" style={{ background: "linear-gradient(180deg, rgba(103,166,255,0.18), rgba(103,166,255,0.06))" }}>
        <p className="text-[11px] font-semibold text-sky-200 uppercase tracking-[0.22em]">Weather Forecast</p>
        <p className="text-sm font-semibold text-white mt-1">{data.destination}</p>
      </div>

      {/* Day strip */}
      <div
        className="grid px-4 py-3 gap-3"
        style={{ gridTemplateColumns: `repeat(${Math.max(data.days.length, 1)}, minmax(0, 1fr))` }}
      >
        {data.days.map((day, i) => {
          const highPct = ((day.high - minTemp) / tempRange) * 60 + 20;
          const lowPct = ((day.low - minTemp) / tempRange) * 60 + 20;
          return (
            <div
              key={i}
              className="flex flex-col items-center gap-1.5 min-w-0 rounded-2xl px-2.5 py-2"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <span className="text-xs text-white/55 font-medium whitespace-nowrap">{day.label}</span>
              <WeatherIcon icon={day.icon} />
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-xs font-bold text-white">{day.high}°</span>
                <div className="w-1 rounded-full bg-linear-to-b from-orange-300 to-blue-300" style={{ height: `${Math.max(highPct - lowPct, 8)}px` }} />
                <span className="text-xs text-white/40">{day.low}°</span>
              </div>
              {day.precipitation > 0 && (
                <span className="text-xs text-sky-300">{day.precipitation}mm</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Packing tips */}
      {data.packingTips.length > 0 && (
        <div className="px-4 pb-4 border-t border-white/8 pt-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Bag weight="fill" className="w-3.5 h-3.5 text-sky-200" />
            <span className="text-[11px] font-semibold text-white/42 uppercase tracking-[0.22em]">Pack</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.packingTips.map((tip, i) => (
              <span
                key={i}
                className="px-2.5 py-1 text-xs rounded-full text-sky-100 border"
                style={{ background: "rgba(103,166,255,0.14)", borderColor: "rgba(124,182,255,0.22)" }}
              >
                {tip}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
