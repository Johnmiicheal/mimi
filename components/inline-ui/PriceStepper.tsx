"use client";

import { Minus, Plus } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { type ColorConfig, CONTROL_COLORS, pillBoxShadow } from "@/lib/inline-ui/colors";

const DEFAULT_COLOR = CONTROL_COLORS[2]; // green fallback

interface PriceStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  currency?: string;
  className?: string;
  color?: ColorConfig;
}

export function PriceStepper({
  value,
  onChange,
  min = 0,
  max = 100000,
  step = 50,
  currency = "$",
  color = DEFAULT_COLOR,
}: PriceStepperProps) {
  const handleDecrement = () => {
    const newValue = Math.max(min, value - step);
    if (newValue !== value) onChange(newValue);
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, value + step);
    if (newValue !== value) onChange(newValue);
  };

  const btnStyle = {
    background: color.gradient,
    boxShadow: pillBoxShadow(color, "sm"),
  };

  return (
    <motion.span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
      style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 800, damping: 20 }}
    >
      <motion.button
        onClick={handleDecrement}
        disabled={value <= min}
        className="flex items-center justify-center w-6 h-6 rounded-full text-white disabled:opacity-35 disabled:cursor-not-allowed"
        style={btnStyle}
        whileHover={{ scale: value > min ? 1.15 : 1, transition: { type: "spring", stiffness: 800, damping: 20 } }}
        whileTap={{ scale: value > min ? 0.88 : 1, transition: { type: "spring", stiffness: 1000, damping: 30 } }}
        transition={{ type: "spring", stiffness: 800, damping: 20 }}
      >
        <Minus weight="bold" className="w-3.5 h-3.5" />
      </motion.button>

      <span className="flex items-center justify-center min-w-18">
        <span className="font-semibold text-base text-white leading-none">{currency}</span>
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const newValue = parseInt(e.target.value) || min;
            onChange(Math.max(min, Math.min(max, newValue)));
          }}
          className="font-semibold text-base text-white w-12 p-0 pl-0.5 text-left bg-transparent border-none outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          min={min}
          max={max}
          step={step}
        />
      </span>

      <motion.button
        onClick={handleIncrement}
        disabled={value >= max}
        className="flex items-center justify-center w-6 h-6 rounded-full text-white disabled:opacity-35 disabled:cursor-not-allowed"
        style={btnStyle}
        whileHover={{ scale: value < max ? 1.15 : 1, transition: { type: "spring", stiffness: 800, damping: 20 } }}
        whileTap={{ scale: value < max ? 0.88 : 1, transition: { type: "spring", stiffness: 1000, damping: 30 } }}
        transition={{ type: "spring", stiffness: 800, damping: 20 }}
      >
        <Plus weight="bold" className="w-3.5 h-3.5" />
      </motion.button>
    </motion.span>
  );
}
