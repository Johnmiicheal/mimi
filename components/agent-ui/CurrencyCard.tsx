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
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden w-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 bg-blue-50">
        <div className="flex items-center gap-2 mb-1">
          <ArrowsLeftRight weight="bold" className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Exchange Rate</span>
        </div>

        <div className="flex items-end gap-3">
          <div>
            <span className="text-3xl font-bold text-gray-900">{data.rate.toLocaleString()}</span>
            <span className="text-sm text-gray-500 ml-1">{data.to}</span>
          </div>
          <span className="text-sm text-gray-400 mb-1">per 1 {data.from}</span>
        </div>

        {/* Trend */}
        <div className={cn(
          "inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
          data.trend === 'up' ? "bg-emerald-100 text-emerald-700" :
          data.trend === 'down' ? "bg-red-100 text-red-700" :
          "bg-gray-100 text-gray-600"
        )}>
          {data.trend === 'up' && <TrendUp weight="bold" className="w-3 h-3" />}
          {data.trend === 'down' && <TrendDown weight="bold" className="w-3 h-3" />}
          <span>
            {data.trend === 'stable' ? 'Stable' : `${data.trendPct > 0 ? '+' : ''}${data.trendPct}%`} this week
          </span>
        </div>
      </div>

      {/* Live converter */}
      <div className="px-4 py-3 border-b border-gray-50">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Quick Convert</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">{data.from}</span>
            <input
              type="number"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
              min="0"
            />
          </div>
          <CurrencyDollar weight="bold" className="w-4 h-4 text-gray-300 shrink-0" />
          <div className="flex-1 relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">{data.to}</span>
            <div className="w-full pl-9 pr-3 py-2 text-sm border border-gray-100 rounded-lg bg-gray-50 text-gray-700 font-medium">
              {converted}
            </div>
          </div>
        </div>
      </div>

      {/* Quick conversions table */}
      <div className="px-4 py-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Common amounts</p>
        <div className="grid grid-cols-2 gap-1.5">
          {data.quickConversions.map((c, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-gray-50 text-xs">
              <span className="text-gray-500">{c.usd} {data.from}</span>
              <span className="font-semibold text-gray-800">{c.local.toLocaleString()} {data.to}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
