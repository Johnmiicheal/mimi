"use client";

import { CaretDown, Check } from "@phosphor-icons/react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { motion } from "framer-motion";
import { type ColorConfig, CONTROL_COLORS, pillBoxShadow } from "@/lib/inline-ui/colors";

const DEFAULT_COLOR = CONTROL_COLORS[1];

interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  color?: ColorConfig;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = "Select...",
  color = DEFAULT_COLOR,
}: SelectProps) {
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <SelectPrimitive.Root value={value} onValueChange={onChange}>
      <SelectPrimitive.Trigger asChild>
        <motion.button
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-semibold text-base text-white focus:outline-none"
          style={{
            background: color.gradient,
            boxShadow: pillBoxShadow(color),
          }}
          whileHover={{ scale: 1.08, transition: { type: "spring", stiffness: 800, damping: 20 } }}
          whileTap={{ scale: 0.93, transition: { type: "spring", stiffness: 1000, damping: 30 } }}
          transition={{ type: "spring", stiffness: 800, damping: 20 }}
        >
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <CaretDown weight="bold" className="w-3.5 h-3.5 text-white/70" />
          </SelectPrimitive.Icon>
        </motion.button>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in-0 zoom-in-95"
          style={{ background: "#0d2050", border: "1px solid rgba(255,255,255,0.15)" }}
          position="popper"
          sideOffset={8}
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/85 hover:bg-white/10 focus:bg-white/10 focus:outline-none cursor-pointer transition-colors duration-150 select-none"
              >
                <SelectPrimitive.ItemIndicator className="absolute left-1 flex items-center justify-center">
                  <Check weight="bold" className="w-4 h-4 text-white" />
                </SelectPrimitive.ItemIndicator>
                <div className="flex items-center gap-2 pl-6">
                  {option.icon && <span className="shrink-0">{option.icon}</span>}
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                </div>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
