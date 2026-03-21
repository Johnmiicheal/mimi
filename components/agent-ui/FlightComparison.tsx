"use client";

import { Airplane, Clock, CurrencyDollar, Lightning, Leaf } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface Flight {
  id: string;
  airline: string;
  price: number;
  currency: string;
  duration: number; // minutes
  departure: { time: string; airport: string };
  arrival: { time: string; airport: string };
  layovers: number;
  carbonEmissions?: number; // kg CO2
  baggage?: { checked: number; carryon: number };
  score?: number;
}

interface FlightComparisonProps {
  flights: Flight[];
  travelers: number;
  currency?: string;
  onSelect?: (flightId: string) => void;
}

export function FlightComparison({
  flights,
  travelers,
  currency = "USD",
  onSelect
}: FlightComparisonProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getBestValueIndex = () => {
    if (flights.length === 0) return -1;
    let bestIndex = 0;
    let bestScore = flights[0].score || 0;

    flights.forEach((flight, index) => {
      const score = flight.score || 0;
      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });

    return bestIndex;
  };

  const bestValueIndex = getBestValueIndex();

  return (
    <div className="space-y-4">
      {flights.map((flight, index) => {
        const isBestValue = index === bestValueIndex;
        const totalPrice = flight.price * travelers;

        return (
          <motion.div
            key={flight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            {/* Best value badge */}
            {isBestValue && (
              <motion.div
                initial={{ scale: 0, rotate: -12 }}
                animate={{ scale: 1, rotate: -12 }}
                transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                className="absolute -top-3 -right-3 z-10"
              >
                <div className="glass-strong px-3 py-1 rounded-full border border-accent-300/50 bg-gradient-to-r from-accent-50 to-accent-100 shadow-lg">
                  <div className="flex items-center gap-1">
                    <Lightning weight="fill" className="w-4 h-4 text-accent-600" />
                    <span className="text-xs font-bold text-accent-700">Best Value</span>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.button
              onClick={() => onSelect?.(flight.id)}
              className={cn(
                "w-full glass-strong rounded-2xl p-6 border transition-all duration-300",
                "hover:shadow-xl hover:scale-[1.02]",
                isBestValue
                  ? "border-accent-300/50 shadow-lg glow"
                  : "border-white/20 hover:border-primary-200/50"
              )}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: Flight info */}
                <div className="flex-1 space-y-4">
                  {/* Airline */}
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center">
                      <Airplane weight="duotone" className="w-5 h-5 text-primary-600 dark:text-primary-300" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200">
                        {flight.airline}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Flight {flight.id}
                      </div>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="flex items-center gap-4">
                    {/* Departure */}
                    <div className="text-left">
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {flight.departure.time}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {flight.departure.airport}
                      </div>
                    </div>

                    {/* Duration & layovers */}
                    <div className="flex-1 relative">
                      <div className="h-0.5 bg-gradient-to-r from-primary-300 via-primary-400 to-primary-300 rounded-full" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="glass px-2 py-1 rounded-full border border-primary-200/50 text-xs font-medium text-primary-700 dark:text-primary-300 whitespace-nowrap">
                          {formatDuration(flight.duration)}
                        </div>
                      </div>
                      {flight.layovers > 0 && (
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs text-orange-600 dark:text-orange-400 whitespace-nowrap">
                          {flight.layovers} stop{flight.layovers > 1 ? 's' : ''}
                        </div>
                      )}
                      {flight.layovers === 0 && (
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs text-green-600 dark:text-green-400 whitespace-nowrap flex items-center gap-1">
                          <Lightning weight="fill" className="w-3 h-3" />
                          Direct
                        </div>
                      )}
                    </div>

                    {/* Arrival */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {flight.arrival.time}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {flight.arrival.airport}
                      </div>
                    </div>
                  </div>

                  {/* Additional info */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    {flight.baggage && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                        <span>🎒</span>
                        <span>{flight.baggage.checked} checked, {flight.baggage.carryon} carry-on</span>
                      </div>
                    )}
                    {flight.carbonEmissions && (
                      <div className="flex items-center gap-1 text-xs">
                        <Leaf weight="fill" className="w-3 h-3 text-green-600" />
                        <span className="text-green-600 dark:text-green-400">
                          {flight.carbonEmissions}kg CO₂
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Price */}
                <div className="text-right">
                  <motion.div
                    className={cn(
                      "glass-strong px-4 py-3 rounded-2xl border",
                      isBestValue
                        ? "border-accent-300/50 bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/30 dark:to-accent-800/30"
                        : "border-gray-200/50 dark:border-gray-700/50"
                    )}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <CurrencyDollar weight="bold" className="w-3 h-3" />
                      <span>per person</span>
                    </div>
                    <div className={cn(
                      "text-3xl font-bold",
                      isBestValue
                        ? "text-accent-600 dark:text-accent-400"
                        : "text-gray-900 dark:text-gray-100"
                    )}>
                      ${flight.price.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      ${totalPrice.toLocaleString()} total
                    </div>
                  </motion.div>

                  <motion.div
                    className="mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold text-sm shadow-md"
                    whileHover={{ scale: 1.05, boxShadow: "0 8px 16px rgba(102, 126, 234, 0.3)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Select
                  </motion.div>
                </div>
              </div>
            </motion.button>
          </motion.div>
        );
      })}
    </div>
  );
}
