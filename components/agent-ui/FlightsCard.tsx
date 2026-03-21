"use client";

import { motion } from "framer-motion";
import { Airplane, Clock, ArrowRight, Lightbulb, Star } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface FlightOption {
  airline: string;
  price: number;
  duration: string;
  stops: number;
  departTime: string;
  arrivalTime: string;
  class: 'economy' | 'premium' | 'business';
}

export interface FlightsData {
  route: string;
  options: FlightOption[];
  cheapestTip: string;
  bestMonths: string;
}

const classColors = {
  economy:  { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-100' },
  premium:  { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
  business: { bg: 'bg-amber-50',  text: 'text-amber-600',  border: 'border-amber-100' },
};

export function FlightsCard({ data }: { data: FlightsData }) {
  const cheapest = data.options.reduce((min, o) => o.price < min.price ? o : min, data.options[0]);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden w-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 bg-sky-50 flex items-start gap-2.5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-sky-100 border border-sky-200">
          <Airplane weight="fill" className="w-5 h-5 text-sky-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Flights</p>
          <p className="text-base font-semibold text-sky-700">{data.route}</p>
        </div>
        <div className="text-right pt-0.5">
          <p className="text-xs text-gray-400">from</p>
          <p className="text-base font-bold text-sky-700">${cheapest?.price.toLocaleString()}</p>
        </div>
      </div>

      {/* Flight options */}
      <div className="divide-y divide-gray-50">
        {data.options.map((option, i) => {
          const colors = classColors[option.class];
          const isCheapest = option === cheapest;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={cn("px-4 py-3 flex items-center gap-3", isCheapest && "bg-sky-50/40")}
            >
              {/* Airline + badge */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm font-semibold text-gray-800">{option.airline}</span>
                  {isCheapest && (
                    <span className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-600 border border-sky-200">
                      <Star weight="fill" className="w-2.5 h-2.5" /> Best
                    </span>
                  )}
                  <span className={cn("text-xs px-1.5 py-0.5 rounded-full border capitalize", colors.bg, colors.text, colors.border)}>
                    {option.class}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{option.departTime}</span>
                  <ArrowRight className="w-3 h-3" />
                  <span>{option.arrivalTime}</span>
                  <span className="text-gray-300">·</span>
                  <Clock className="w-3 h-3" />
                  <span>{option.duration}</span>
                  <span className="text-gray-300">·</span>
                  <span>{option.stops === 0 ? 'Direct' : `${option.stops} stop${option.stops > 1 ? 's' : ''}`}</span>
                </div>
              </div>

              {/* Price */}
              <div className="text-right shrink-0">
                <p className="text-base font-bold text-gray-900">${option.price.toLocaleString()}</p>
                <p className="text-xs text-gray-400">per person</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tips */}
      <div className="px-4 py-3 border-t border-gray-50 space-y-2">
        <div className="flex items-start gap-2">
          <Lightbulb weight="fill" className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-gray-600">{data.cheapestTip}</p>
        </div>
        <div className="flex items-start gap-2">
          <Star weight="fill" className="w-3.5 h-3.5 text-sky-400 mt-0.5 shrink-0" />
          <p className="text-xs text-gray-500">Best time to visit: <span className="font-medium text-gray-700">{data.bestMonths}</span></p>
        </div>
      </div>
    </div>
  );
}
