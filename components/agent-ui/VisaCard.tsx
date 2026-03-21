"use client";

import { CheckCircle, XCircle, Timer, CurrencyDollar, CalendarCheck, ArrowSquareOut } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

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
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden w-full">
      {/* Header badge */}
      <div className={cn(
        "px-4 pt-4 pb-3 flex items-center gap-3",
        data.required ? "bg-amber-50" : "bg-emerald-50"
      )}>
        {data.required
          ? <XCircle weight="fill" className="w-8 h-8 text-amber-500 shrink-0" />
          : <CheckCircle weight="fill" className="w-8 h-8 text-emerald-500 shrink-0" />
        }
        <div>
          <p className={cn("text-base font-bold", data.required ? "text-amber-700" : "text-emerald-700")}>
            {data.type}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {data.required ? 'Visa required before travel' : 'No visa required'}
          </p>
        </div>
      </div>

      {/* Stats row */}
      {data.required && (
        <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
          {[
            { icon: <CurrencyDollar weight="bold" className="w-4 h-4 text-gray-400" />, label: 'Cost', value: data.cost === 0 ? 'Free' : `$${data.cost}` },
            { icon: <Timer weight="bold" className="w-4 h-4 text-gray-400" />, label: 'Processing', value: `${data.processingDays}d` },
            { icon: <CalendarCheck weight="bold" className="w-4 h-4 text-gray-400" />, label: 'Max Stay', value: `${data.maxStay}d` },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center py-3 gap-1">
              {stat.icon}
              <span className="text-sm font-bold text-gray-800">{stat.value}</span>
              <span className="text-xs text-gray-400">{stat.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Requirements checklist */}
      {data.requirements.length > 0 && (
        <div className="px-4 py-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Requirements</p>
          <ul className="space-y-1.5">
            {data.requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
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
          <a
            href={data.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Apply Online
            <ArrowSquareOut weight="bold" className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
