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
  low: { label: 'Safe to Travel', color: 'text-emerald-200', bg: 'rgba(52,211,153,0.14)', border: 'rgba(74,222,128,0.18)', dot: 'bg-emerald-400' },
  medium: { label: 'Exercise Caution', color: 'text-amber-200', bg: 'rgba(251,191,36,0.14)', border: 'rgba(251,191,36,0.18)', dot: 'bg-amber-400' },
  high: { label: 'Travel Advisory', color: 'text-red-200', bg: 'rgba(248,113,113,0.14)', border: 'rgba(248,113,113,0.18)', dot: 'bg-red-400' },
};

export function SafetyCard({ data }: { data: SafetyData }) {
  const config = levelConfig[data.level];

  return (
    <div
      className="rounded-[28px] overflow-hidden w-full border border-white/12"
      style={{
        background: "linear-gradient(180deg, rgba(14,29,73,0.98) 0%, rgba(9,20,55,0.98) 100%)",
        boxShadow: "0 24px 56px rgba(5,10,33,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between" style={{ background: `linear-gradient(180deg, ${config.bg}, rgba(255,255,255,0))` }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center border" style={{ background: "rgba(255,255,255,0.05)", borderColor: config.border }}>
            <Shield weight="fill" className={cn("w-5 h-5", config.color)} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-white/42 uppercase tracking-[0.22em]">Safety Rating</p>
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
                n <= data.rating ? config.dot : "bg-white/12"
              )}
            />
          ))}
        </div>
      </div>

      {/* Advisories */}
      {data.advisories.length > 0 && (
        <div className="px-4 py-3 border-b border-white/8">
          <div className="flex items-center gap-1.5 mb-2">
            <Warning weight="fill" className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-[11px] font-semibold text-white/42 uppercase tracking-[0.22em]">Advisories</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.advisories.map((adv, i) => (
              <span
                key={i}
                className="px-2.5 py-1 text-xs rounded-full text-amber-100 border"
                style={{ background: "rgba(251,191,36,0.14)", borderColor: "rgba(251,191,36,0.18)" }}
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
            <Newspaper weight="fill" className="w-3.5 h-3.5 text-white/45" />
            <span className="text-[11px] font-semibold text-white/42 uppercase tracking-[0.22em]">Recent News</span>
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
                <div className="w-1 h-1 rounded-full bg-white/24 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/80 leading-snug line-clamp-2">{h.title}</p>
                  <p className="text-xs text-white/40 mt-0.5">{h.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 pb-3 flex items-center gap-1.5">
        <Clock weight="regular" className="w-3 h-3 text-white/28" />
        <span className="text-xs text-white/40">Updated {data.lastUpdated}</span>
      </div>
    </div>
  );
}
