"use client";

import { useState } from "react";
import { Calendar as CalendarIcon } from "@phosphor-icons/react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import * as Popover from "@radix-ui/react-popover";
import "react-day-picker/style.css";

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
}

export function DatePicker({ value, onChange, className }: DatePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <motion.button
          className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
            "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
            "shadow-sm hover:shadow-md",
            "text-gray-900 dark:text-white font-medium",
            "transition-all duration-200",
            className
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <CalendarIcon weight="duotone" className="w-4 h-4 text-blue-600" />
          <span>{format(value, "MMM dd, yyyy")}</span>
        </motion.button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          className={cn(
            "bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl border border-gray-200 dark:border-gray-700",
            "z-50 animate-in fade-in-0 zoom-in-95"
          )}
        >
                <DayPicker
                  mode="single"
                  selected={value}
                  onSelect={(date) => {
                    if (date) {
                      onChange(date);
                      setOpen(false);
                    }
                  }}
                  className="!m-0"
                  classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-sm font-medium text-foreground",
                    nav: "space-x-1 flex items-center",
                    nav_button: cn(
                      "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                      "rounded-full hover:bg-primary-100 dark:hover:bg-primary-900",
                      "transition-all duration-200"
                    ),
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                    row: "flex w-full mt-2",
                    cell: cn(
                      "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                      "hover:bg-primary-50 dark:hover:bg-primary-900 rounded-full",
                      "transition-colors duration-200"
                    ),
                    day: cn(
                      "h-9 w-9 p-0 font-normal rounded-full",
                      "hover:bg-primary-100 dark:hover:bg-primary-800",
                      "transition-all duration-200"
                    ),
                    day_selected: cn(
                      "bg-blue-600",
                      "text-white font-medium",
                      "hover:bg-blue-700",
                      "shadow-md"
                    ),
                    day_today: "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-medium",
                    day_outside: "text-muted-foreground opacity-50",
                    day_disabled: "text-muted-foreground opacity-50",
                    day_range_middle: "aria-selected:bg-accent-100 aria-selected:text-accent-900",
                    day_hidden: "invisible",
                  }}
                />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
