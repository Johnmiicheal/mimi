"use client";

import { useState } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  formatValue?: (value: number) => string;
  label?: string;
  className?: string;
}

export function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  formatValue = (v) => v.toString(),
  label,
  className
}: SliderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <motion.div
      className={cn(
        "inline-flex flex-col gap-2 px-4 py-3 rounded-xl",
        "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
        "shadow-sm min-w-[200px]",
        className
      )}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {label}
          </span>
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {formatValue(value)}
          </span>
        </div>
      )}

      <SliderPrimitive.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        onPointerDown={() => setIsDragging(true)}
        onPointerUp={() => setIsDragging(false)}
        min={min}
        max={max}
        step={step}
      >
        <SliderPrimitive.Track className="bg-gray-200 dark:bg-gray-700 relative grow rounded-full h-2">
          <SliderPrimitive.Range
            className="absolute bg-gradient-to-r from-blue-500 to-blue-600 rounded-full h-full"
            style={{
              background: `linear-gradient(90deg, #3b82f6 0%, #2563eb ${percentage}%, #1d4ed8 100%)`
            }}
          />
        </SliderPrimitive.Track>

        <SliderPrimitive.Thumb
          className={cn(
            "block w-5 h-5 bg-white dark:bg-gray-100 shadow-md rounded-full",
            "border-2 border-blue-600",
            "hover:scale-110 focus:scale-110",
            "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
            "transition-transform duration-150",
            isDragging && "scale-110 ring-2 ring-blue-400 ring-offset-2"
          )}
        />
      </SliderPrimitive.Root>

      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </motion.div>
  );
}
