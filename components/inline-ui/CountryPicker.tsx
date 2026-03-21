"use client";

import { useState } from "react";
import { Check, CaretDown, MagnifyingGlass } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import * as Popover from "@radix-ui/react-popover";
import { type ColorConfig, CONTROL_COLORS, pillBoxShadow } from "@/lib/inline-ui/colors";
import { POPULAR_COUNTRIES, ALL_COUNTRIES, type Country } from "@/lib/inline-ui/countries";

export type { Country };

const DEFAULT_COLOR = CONTROL_COLORS[1];

function FlagAvatar({ code, name, size = "sm" }: { code: string; name: string; size?: "sm" | "md" }) {
  const dim = size === "md" ? "w-7 h-7" : "w-6 h-6";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
      alt={name}
      className={cn(dim, "rounded-full object-cover shrink-0")}
    />
  );
}

interface CountryPickerProps {
  value: Country;
  onChange: (country: Country) => void;
  className?: string;
  color?: ColorConfig;
}

export function CountryPicker({ value, onChange, color = DEFAULT_COLOR }: CountryPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const query = search.toLowerCase();
  const filteredPopular = POPULAR_COUNTRIES.filter((c) => c.name.toLowerCase().includes(query));
  const filteredAll = ALL_COUNTRIES.filter((c) => c.name.toLowerCase().includes(query));
  const totalCount = filteredPopular.length + filteredAll.length;

  const renderRow = (country: Country, index: number) => (
    <motion.button
      key={country.code}
      onClick={() => { onChange(country); setOpen(false); setSearch(""); }}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/80 hover:bg-white/10 transition-colors duration-150",
        value.code === country.code && "bg-white/15 text-white"
      )}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.006 }}
      whileHover={{ x: 3 }}
    >
      <FlagAvatar code={country.code} name={country.name} />
      <span className="flex-1 text-left text-base font-semibold">{country.name}</span>
      {value.code === country.code && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>
          <Check weight="bold" className="w-4 h-4 text-white" />
        </motion.div>
      )}
    </motion.button>
  );

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
          <FlagAvatar code={value.code} name={value.name} />
          <span>{value.name}</span>
          <CaretDown
            weight="bold"
            className={cn("w-3.5 h-3.5 text-white/70 transition-transform duration-200", open && "rotate-180")}
          />
        </motion.button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          className="rounded-2xl p-3 shadow-2xl w-[300px] animate-in fade-in-0 zoom-in-95"
          style={{ background: "#0d2050", border: "1px solid rgba(255,255,255,0.15)", zIndex: 9999 }}
        >
          <div className="relative mb-3">
            <MagnifyingGlass weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search countries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/10 border border-white/15 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-0.5 pr-1 scrollbar-none">
            {filteredPopular.length > 0 && (
              <>
                <div className="px-3 pb-1 pt-0.5">
                  <span className="text-[10px] font-semibold tracking-widest uppercase text-white/40">Popular</span>
                </div>
                {filteredPopular.map((c, i) => renderRow(c, i))}
              </>
            )}

            {filteredAll.length > 0 && (
              <>
                {filteredPopular.length > 0 && (
                  <div className="px-3 pb-1 pt-2">
                    <span className="text-[10px] font-semibold tracking-widest uppercase text-white/40">All destinations</span>
                  </div>
                )}
                {filteredAll.map((c, i) => renderRow(c, filteredPopular.length + i))}
              </>
            )}

            {totalCount === 0 && (
              <div className="text-center py-6 text-sm text-white/35">No countries found</div>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
