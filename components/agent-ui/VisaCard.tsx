"use client";

import { CheckCircle, XCircle, Timer, CurrencyDollar, CalendarCheck, ArrowSquareOut } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CONTROL_COLORS, pillBoxShadow } from "@/lib/inline-ui/colors";

const BLUE = CONTROL_COLORS[1];

export interface VisaData {
  required: boolean;
  type: string;
  processingDays: number;
  cost: number;
  maxStay: number;
  requirements: string[];
  applyUrl?: string;
}

export function VisaCard({ data }: { data: VisaData }) {
  return (
    <div className="rounded-2xl overflow-hidden w-full" style={{ background: "#0d2050", border: "1px solid rgba(255,255,255,0.12)" }}>
      {/* Header */}
      <div className={cn(
        "px-4 pt-4 pb-3 flex items-center gap-3",
        data.required ? "bg-amber-500/15" : "bg-emerald-500/15"
      )}>
        {data.required
          ? <XCircle    weight="fill" className="w-8 h-8 text-amber-400 shrink-0" />
          : <CheckCircle weight="fill" className="w-8 h-8 text-emerald-400 shrink-0" />
        }
        <div>
          <p className={cn("text-base font-bold", data.required ? "text-amber-300" : "text-emerald-300")}>
            {data.type}
          </p>
          <p className="text-xs text-white/50 mt-0.5">
            {data.required ? 'Visa required before travel' : 'No visa required'}
          </p>
        </div>
      </div>

      {/* Stats row */}
      {data.required && (
        <div className="grid grid-cols-3 divide-x divide-white/10 border-b border-white/10">
          {[
            { icon: <CurrencyDollar weight="bold" className="w-4 h-4 text-white/35" />, label: 'Cost',       value: data.cost === 0 ? 'Free' : `$${data.cost}` },
            { icon: <Timer          weight="bold" className="w-4 h-4 text-white/35" />, label: 'Processing', value: `${data.processingDays}d` },
            { icon: <CalendarCheck  weight="bold" className="w-4 h-4 text-white/35" />, label: 'Max Stay',   value: `${data.maxStay}d` },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center py-3 gap-1">
              {stat.icon}
              <span className="text-sm font-bold text-white/85">{stat.value}</span>
              <span className="text-xs text-white/35">{stat.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Requirements checklist */}
      {data.requirements.length > 0 && (
        <div className="px-4 py-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-2">Requirements</p>
          <ul className="space-y-1.5">
            {data.requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-white/70">
                <CheckCircle weight="fill" className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Apply button */}
      {data.applyUrl && (
        <div className="px-4 pb-4">
          <motion.a
            href={data.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white text-sm font-semibold"
            style={{
              background: BLUE.gradient,
              boxShadow: pillBoxShadow(BLUE),
            }}
            whileHover={{ scale: 1.04, transition: { type: "spring", stiffness: 800, damping: 20 } }}
            whileTap={{ scale: 0.96, transition: { type: "spring", stiffness: 1000, damping: 30 } }}
            transition={{ type: "spring", stiffness: 800, damping: 20 }}
          >
            Apply Online
            <ArrowSquareOut weight="bold" className="w-3.5 h-3.5" />
          </motion.a>
        </div>
      )}
    </div>
  );
}
