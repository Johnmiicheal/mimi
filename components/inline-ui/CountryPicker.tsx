"use client";

import { useState } from "react";
import { Check, CaretDown, MagnifyingGlass } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import * as Popover from "@radix-ui/react-popover";

export interface Country {
  code: string;
  name: string;
  flag: string;
}

// Popular travel destinations
const COUNTRIES: Country[] = [
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "GR", name: "Greece", flag: "🇬🇷" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "IS", name: "Iceland", flag: "🇮🇸" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "AE", name: "UAE", flag: "🇦🇪" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "MA", name: "Morocco", flag: "🇲🇦" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "PE", name: "Peru", flag: "🇵🇪" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷" },
  { code: "FI", name: "Finland", flag: "🇫🇮" },
];

interface CountryPickerProps {
  value: Country;
  onChange: (country: Country) => void;
  className?: string;
}

export function CountryPicker({ value, onChange, className }: CountryPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredCountries = COUNTRIES.filter((country) =>
    country.name.toLowerCase().includes(search.toLowerCase())
  );

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
          <span className="text-xl leading-none">{value.flag}</span>
          <span>{value.name}</span>
          <CaretDown
            weight="bold"
            className={cn(
              "w-3 h-3 text-gray-500 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </motion.button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          className={cn(
            "bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-xl border border-gray-200 dark:border-gray-700",
            "w-[320px] z-50 animate-in fade-in-0 zoom-in-95"
          )}
        >
                {/* Search input */}
                <div className="relative mb-2">
                  <MagnifyingGlass
                    weight="bold"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search countries..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={cn(
                      "w-full pl-9 pr-3 py-2 rounded-xl",
                      "bg-white/50 dark:bg-black/20 border border-gray-200/50 dark:border-gray-700/50",
                      "text-sm placeholder:text-gray-400",
                      "focus:outline-none focus:ring-2 focus:ring-primary-400/50",
                      "transition-all duration-200"
                    )}
                  />
                </div>

                {/* Countries list */}
                <div className="max-h-[300px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {filteredCountries.map((country, index) => (
                    <motion.button
                      key={country.code}
                      onClick={() => {
                        onChange(country);
                        setOpen(false);
                        setSearch("");
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-xl",
                        "hover:bg-blue-50 dark:hover:bg-blue-900/30",
                        "transition-all duration-200",
                        value.code === country.code &&
                          "bg-blue-100 dark:bg-blue-900/50"
                      )}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.01 }}
                      whileHover={{ x: 4 }}
                    >
                      <span className="text-2xl leading-none">{country.flag}</span>
                      <span className="flex-1 text-left text-sm font-medium">
                        {country.name}
                      </span>
                      {value.code === country.code && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <Check weight="bold" className="w-4 h-4 text-blue-600" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}

                  {filteredCountries.length === 0 && (
                    <div className="text-center py-8 text-sm text-gray-500">
                      No countries found
                    </div>
                  )}
                </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

// Custom scrollbar styles
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(102, 126, 234, 0.3);
    border-radius: 3px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(102, 126, 234, 0.5);
  }
`;
