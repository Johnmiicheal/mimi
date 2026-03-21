"use client";

import { Minus, Plus } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  className?: string;
}

export function NumberStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  step = 1,
  unit,
  className
}: NumberStepperProps) {
  const handleDecrement = () => {
    const newValue = Math.max(min, value - step);
    if (newValue !== value) onChange(newValue);
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, value + step);
    if (newValue !== value) onChange(newValue);
  };

  return (
    <motion.span
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1.5 rounded-full",
        "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
        "shadow-sm",
        className
      )}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.button
        onClick={handleDecrement}
        disabled={value <= min}
        className={cn(
          "flex items-center justify-center w-6 h-6 rounded-full",
          "bg-blue-600 hover:bg-blue-700",
          "text-white",
          "disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed",
          "transition-colors duration-200"
        )}
        whileHover={{ scale: value > min ? 1.1 : 1 }}
        whileTap={{ scale: value > min ? 0.95 : 1 }}
      >
        <Minus weight="bold" className="w-3 h-3" />
      </motion.button>

      <div className="flex items-center">
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const newValue = parseInt(e.target.value) || min;
            const clampedValue = Math.max(min, Math.min(max, newValue));
            onChange(clampedValue);
          }}
          className={cn(
            "font-semibold text-gray-900 dark:text-white w-12 text-center",
            "bg-transparent border-none outline-none",
            "appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          )}
          min={min}
          max={max}
        />
        {unit && <span className="font-semibold text-gray-900 dark:text-white ml-0.5">{unit}</span>}
      </div>

      <motion.button
        onClick={handleIncrement}
        disabled={value >= max}
        className={cn(
          "flex items-center justify-center w-6 h-6 rounded-full",
          "bg-blue-600 hover:bg-blue-700",
          "text-white",
          "disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed",
          "transition-colors duration-200"
        )}
        whileHover={{ scale: value < max ? 1.1 : 1 }}
        whileTap={{ scale: value < max ? 0.95 : 1 }}
      >
        <Plus weight="bold" className="w-3 h-3" />
      </motion.button>
    </motion.span>
  );
}
