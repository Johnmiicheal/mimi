"use client";

import { motion } from "framer-motion";
import { Shield, Warning, Newspaper, Clock } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface SafetyData {
  rating: 1 | 2 | 3 | 4 | 5;
  level: 'high' | 'medium' | 'low';
  advisories: string[];
  headlines: { title: string; date: string }[];
  lastUpdated: string;
}

const levelConfig = {
  low: { label: 'Safe to Travel', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  medium: { label: 'Exercise Caution', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500' },
  high: { label: 'Travel Advisory', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' },
};

export function SafetyCard({ data }: { data: SafetyData }) {
  const config = levelConfig[data.level];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden w-full">
      {/* Header */}
      <div className={cn("px-4 pt-4 pb-3 flex items-start justify-between", config.bg)}>
        <div className="flex items-center gap-2.5">
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", config.bg, config.border, "border")}>
            <Shield weight="fill" className={cn("w-5 h-5", config.color)} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Safety Rating</p>
            <p className={cn("text-base font-semibold", config.color)}>{config.label}</p>
          </div>
        </div>

        {/* Rating dots */}
        <div className="flex items-center gap-1 pt-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-colors",
                n <= data.rating ? config.dot : "bg-gray-200"
              )}
            />
          ))}
        </div>
      </div>

      {/* Advisories */}
      {data.advisories.length > 0 && (
        <div className="px-4 py-3 border-b border-gray-50">
          <div className="flex items-center gap-1.5 mb-2">
            <Warning weight="fill" className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Advisories</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.advisories.map((adv, i) => (
              <span
                key={i}
                className="px-2.5 py-1 text-xs rounded-full bg-amber-50 text-amber-700 border border-amber-100"
              >
                {adv}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Headlines */}
      {data.headlines.length > 0 && (
        <div className="px-4 py-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Newspaper weight="fill" className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recent News</span>
          </div>
          <div className="space-y-2">
            {data.headlines.slice(0, 3).map((h, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-2"
              >
                <div className="w-1 h-1 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 leading-snug line-clamp-2">{h.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{h.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 pb-3 flex items-center gap-1.5">
        <Clock weight="regular" className="w-3 h-3 text-gray-300" />
        <span className="text-xs text-gray-400">Updated {data.lastUpdated}</span>
      </div>
    </div>
  );
}
