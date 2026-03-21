"use client";

import { Check, X } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { type ColorConfig, CONTROL_COLORS, pillBoxShadow } from "@/lib/inline-ui/colors";

const DEFAULT_COLOR = CONTROL_COLORS[1]; // blue fallback

interface ToggleChipProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  icon?: React.ReactNode;
  className?: string;
  color?: ColorConfig;
}

export function ToggleChip({
  label,
  value,
  onChange,
  icon,
  color = DEFAULT_COLOR,
}: ToggleChipProps) {
  return (
    <motion.button
      onClick={() => onChange(!value)}
      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-semibold text-base text-white"
      style={
        value
          ? {
              background: color.gradient,
              boxShadow: pillBoxShadow(color),
              border: "none",
            }
          : {
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.18)",
            }
      }
      whileHover={{ scale: 1.08, transition: { type: "spring", stiffness: 800, damping: 20 } }}
      whileTap={{ scale: 0.93, transition: { type: "spring", stiffness: 1000, damping: 30 } }}
      transition={{ type: "spring", stiffness: 800, damping: 20 }}
      layout
    >
      <motion.div
        initial={false}
        animate={{ scale: value ? 1 : 1, rotate: value ? [0, 12] : 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {value ? (
          <Check weight="bold" className="w-4 h-4" />
        ) : (
          icon || <X weight="bold" className="w-4 h-4 opacity-40" />
        )}
      </motion.div>
      <motion.span layout="position">{label}</motion.span>
    </motion.button>
  );
}
