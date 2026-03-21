"use client";

import { Check, X } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ToggleChipProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  icon?: React.ReactNode;
  className?: string;
}

export function ToggleChip({
  label,
  value,
  onChange,
  icon,
  className
}: ToggleChipProps) {
  return (
    <motion.button
      onClick={() => onChange(!value)}
      className={cn(
        "inline-flex items-center gap-1.5 px-4 py-2 rounded-full",
        "border-2 transition-all duration-300",
        "font-medium text-sm",
        "hover:scale-105 active:scale-95",
        value
          ? "bg-blue-600 border-blue-600 text-white shadow-md"
          : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500",
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      layout
    >
      <motion.div
        initial={false}
        animate={{
          scale: value ? [0.8, 1.2, 1] : 1,
          rotate: value ? [0, 10, 0] : 0
        }}
        transition={{ duration: 0.3, type: "spring" }}
      >
        {value ? (
          <Check weight="bold" className="w-4 h-4" />
        ) : (
          icon || <X weight="bold" className="w-4 h-4 opacity-30" />
        )}
      </motion.div>
      <motion.span layout="position">{label}</motion.span>
    </motion.button>
  );
}
