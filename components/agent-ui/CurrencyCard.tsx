"use client";

import { useState } from "react";
import { TrendUp, TrendDown, CurrencyDollar, ArrowsLeftRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface CurrencyData {
  from: string;
  to: string;
  rate: number;
  trend: 'up' | 'down' | 'stable';
  trendPct: number;
  quickConversions: { usd: number; local: number }[];
}

export function CurrencyCard({ data }: { data: CurrencyData }) {
  const [inputAmount, setInputAmount] = useState<string>('100');
  const converted = (parseFloat(inputAmount || '0') * data.rate).toFixed(2);

  return (
    <div
      className="rounded-[28px] overflow-hidden w-full border border-white/12"
      style={{
        background: "linear-gradient(180deg, rgba(14,29,73,0.98) 0%, rgba(9,20,55,0.98) 100%)",
        boxShadow: "0 24px 56px rgba(5,10,33,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3" style={{ background: "linear-gradient(180deg, rgba(52,211,153,0.18), rgba(52,211,153,0.05))" }}>
        <div className="flex items-center gap-2 mb-1">
          <ArrowsLeftRight weight="bold" className="w-4 h-4 text-emerald-200" />
          <span className="text-[11px] font-semibold text-emerald-200 uppercase tracking-[0.22em]">Exchange Rate</span>
        </div>

        <div className="flex items-end gap-3">
          <div>
            <span className="text-3xl font-bold text-white">{data.rate.toLocaleString()}</span>
            <span className="text-sm text-white/55 ml-1">{data.to}</span>
          </div>
          <span className="text-sm text-white/40 mb-1">per 1 {data.from}</span>
        </div>

        {/* Trend */}
        <div className={cn(
          "inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
          data.trend === 'up' ? "bg-emerald-400/15 text-emerald-100" :
          data.trend === 'down' ? "bg-red-400/15 text-red-100" :
          "bg-white/8 text-white/65"
        )}>
          {data.trend === 'up' && <TrendUp weight="bold" className="w-3 h-3" />}
          {data.trend === 'down' && <TrendDown weight="bold" className="w-3 h-3" />}
          <span>
            {data.trend === 'stable' ? 'Stable' : `${data.trendPct > 0 ? '+' : ''}${data.trendPct}%`} this week
          </span>
        </div>
      </div>

      {/* Live converter */}
      <div className="px-4 py-3 border-b border-white/8">
        <p className="text-[11px] font-semibold text-white/42 uppercase tracking-[0.22em] mb-2">Quick Convert</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-white/40">{data.from}</span>
            <input
              type="number"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300/30 bg-white/6 text-white"
              style={{ borderColor: "rgba(255,255,255,0.1)" }}
              min="0"
            />
          </div>
          <CurrencyDollar weight="bold" className="w-4 h-4 text-white/25 shrink-0" />
          <div className="flex-1 relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-white/40">{data.to}</span>
            <div className="w-full pl-9 pr-3 py-2 text-sm border rounded-xl bg-white/6 text-white font-medium" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              {converted}
            </div>
          </div>
        </div>
      </div>

      {/* Quick conversions table */}
      <div className="px-4 py-3">
        <p className="text-[11px] font-semibold text-white/42 uppercase tracking-[0.22em] mb-2">Common amounts</p>
        <div className="grid grid-cols-2 gap-1.5">
          {data.quickConversions.map((c, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-xl text-xs border" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
              <span className="text-white/55">{c.usd} {data.from}</span>
              <span className="font-semibold text-white">{c.local.toLocaleString()} {data.to}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
