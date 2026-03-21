"use client";

import { useState } from "react";
import { Calendar as CalendarIcon } from "@phosphor-icons/react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import * as Popover from "@radix-ui/react-popover";
import "react-day-picker/style.css";
import { type ColorConfig, CONTROL_COLORS, pillBoxShadow } from "@/lib/inline-ui/colors";

const DEFAULT_COLOR = CONTROL_COLORS[3]; // amber fallback

interface DatePickerProps {
  value: Date | string | number | null | undefined;
  onChange: (date: Date) => void;
  className?: string;
  color?: ColorConfig;
}

function normalizeDate(value: DatePickerProps["value"]): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return new Date();
}

export function DatePicker({ value, onChange, color = DEFAULT_COLOR }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const displayDate = normalizeDate(value);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
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
          <CalendarIcon weight="bold" className="w-4 h-4 text-white/90" />
          <span>{format(displayDate, "MMM dd, yyyy")}</span>
        </motion.button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          className="rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in-0 zoom-in-95"
          style={{ background: "#0d2050", border: "1px solid rgba(255,255,255,0.15)" }}
        >
          <DayPicker
            mode="single"
            selected={displayDate}
            onSelect={(date) => {
              if (date) { onChange(date); setOpen(false); }
            }}
            className="m-0!"
            classNames={{
              months: "flex flex-col",
              month: "space-y-3",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-semibold text-white",
              nav: "space-x-1 flex items-center",
              nav_button: cn(
                "h-7 w-7 bg-transparent p-0 opacity-60 hover:opacity-100 rounded-full hover:bg-white/15 transition-all duration-200"
              ),
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-white/40 rounded-md w-9 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 hover:bg-white/10 rounded-full transition-colors duration-150",
              day: "h-9 w-9 p-0 font-normal rounded-full text-white/80 hover:bg-white/10 transition-all duration-200",
              day_selected: "bg-white/25 text-white font-semibold",
              day_today: "bg-white/10 text-white font-medium",
              day_outside: "text-white/25 opacity-50",
              day_disabled: "text-white/25 opacity-50",
              day_range_middle: "",
              day_hidden: "invisible",
            }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
