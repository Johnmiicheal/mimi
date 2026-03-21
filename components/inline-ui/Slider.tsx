"use client";

import { useState } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { type ColorConfig, CONTROL_COLORS } from "@/lib/inline-ui/colors";

const DEFAULT_COLOR = CONTROL_COLORS[1];

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  formatValue?: (value: number) => string;
  label?: string;
  className?: string;
  color?: ColorConfig;
}

export function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  formatValue = (v) => v.toString(),
  label,
  color = DEFAULT_COLOR,
}: SliderProps) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <motion.div
      className="inline-flex flex-col gap-2 px-4 py-3 rounded-xl min-w-[200px]"
      style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 800, damping: 20 }}
    >
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-semibold text-white/60">{label}</span>
          <span className="text-sm font-semibold text-white">{formatValue(value)}</span>
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
        <SliderPrimitive.Track className="relative grow rounded-full h-2" style={{ background: "rgba(255,255,255,0.15)" }}>
          <SliderPrimitive.Range
            className="absolute rounded-full h-full"
            style={{ background: color.gradient }}
          />
        </SliderPrimitive.Track>

        <SliderPrimitive.Thumb
          className={cn(
            "block w-5 h-5 rounded-full shadow-md focus:outline-none transition-transform duration-150",
            isDragging && "scale-110"
          )}
          style={{
            background: color.gradient,
            boxShadow: `0 0 0 3px rgba(255,255,255,0.25), 0 3px 10px rgba(${color.shadowRgb},0.5)`,
          }}
        />
      </SliderPrimitive.Root>

      <div className="flex justify-between text-xs text-white/40">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </motion.div>
  );
}
