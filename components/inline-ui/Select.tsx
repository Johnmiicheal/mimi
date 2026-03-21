"use client";

import { CaretDown, Check } from "@phosphor-icons/react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
}

export function Select({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className
}: SelectProps) {
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <SelectPrimitive.Root value={value} onValueChange={onChange}>
      <SelectPrimitive.Trigger asChild>
        <motion.button
          className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
            "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
            "shadow-sm hover:shadow-md",
            "text-gray-900 dark:text-white font-medium text-sm",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            className
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {selectedOption?.icon && (
            <span className="flex-shrink-0">{selectedOption.icon}</span>
          )}
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <CaretDown weight="bold" className="w-3 h-3 text-gray-500" />
          </SelectPrimitive.Icon>
        </motion.button>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={cn(
            "bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700",
            "overflow-hidden z-50",
            "animate-in fade-in-0 zoom-in-95"
          )}
          position="popper"
          sideOffset={8}
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className={cn(
                  "relative flex items-center gap-2 px-3 py-2 rounded-lg",
                  "text-sm text-gray-900 dark:text-white",
                  "hover:bg-blue-50 dark:hover:bg-blue-900/30",
                  "focus:bg-blue-50 dark:focus:bg-blue-900/30",
                  "focus:outline-none cursor-pointer",
                  "transition-colors duration-150",
                  "select-none"
                )}
              >
                <SelectPrimitive.ItemIndicator className="absolute left-1 flex items-center justify-center">
                  <Check weight="bold" className="w-4 h-4 text-blue-600" />
                </SelectPrimitive.ItemIndicator>

                <div className="flex items-center gap-2 pl-6">
                  {option.icon && (
                    <span className="flex-shrink-0">{option.icon}</span>
                  )}
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
