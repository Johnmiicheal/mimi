"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bag, CheckCircle, Circle, TShirt, DeviceMobile, IdentificationCard, FirstAid, Sparkle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface ShoppingItem {
  name: string;
  essential: boolean;
}

export interface ShoppingCategory {
  name: string;
  items: ShoppingItem[];
}

export interface ShoppingData {
  destination: string;
  weatherNote: string;
  categories: ShoppingCategory[];
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Clothing:    <TShirt weight="fill" className="w-4 h-4" />,
  Tech:        <DeviceMobile weight="fill" className="w-4 h-4" />,
  Documents:   <IdentificationCard weight="fill" className="w-4 h-4" />,
  Toiletries:  <FirstAid weight="fill" className="w-4 h-4" />,
  Accessories: <Bag weight="fill" className="w-4 h-4" />,
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; activeBg: string }> = {
  Clothing:    { bg: 'bg-pink-50',   text: 'text-pink-600',   activeBg: 'bg-pink-100' },
  Tech:        { bg: 'bg-blue-50',   text: 'text-blue-600',   activeBg: 'bg-blue-100' },
  Documents:   { bg: 'bg-amber-50',  text: 'text-amber-600',  activeBg: 'bg-amber-100' },
  Toiletries:  { bg: 'bg-teal-50',   text: 'text-teal-600',   activeBg: 'bg-teal-100' },
  Accessories: { bg: 'bg-purple-50', text: 'text-purple-600', activeBg: 'bg-purple-100' },
};

export function ShoppingCard({ data }: { data: ShoppingData }) {
  const [activeTab, setActiveTab] = useState(data.categories[0]?.name ?? '');
  const activeCategory = data.categories.find(c => c.name === activeTab);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden w-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 bg-purple-50 flex items-start gap-2.5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-100 border border-purple-200">
          <Bag weight="fill" className="w-5 h-5 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Packing List</p>
          <p className="text-base font-semibold text-purple-700">{data.destination}</p>
        </div>
        <div className="flex items-center gap-1 pt-1">
          <Sparkle weight="fill" className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs text-purple-500 font-medium">AI curated</span>
        </div>
      </div>

      {/* Weather note */}
      <div className="px-4 py-2.5 bg-purple-50/40 border-b border-purple-100/60">
        <p className="text-xs text-gray-600 italic">{data.weatherNote}</p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 px-3 pt-3 pb-1 overflow-x-auto scrollbar-none">
        {data.categories.map((cat) => {
          const colors = CATEGORY_COLORS[cat.name] ?? { bg: 'bg-gray-50', text: 'text-gray-600', activeBg: 'bg-gray-100' };
          const isActive = activeTab === cat.name;
          return (
            <motion.button
              key={cat.name}
              onClick={() => setActiveTab(cat.name)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                isActive ? cn(colors.activeBg, colors.text) : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              )}
              whileTap={{ scale: 0.94 }}
            >
              <span className={isActive ? colors.text : 'text-gray-400'}>
                {CATEGORY_ICONS[cat.name] ?? <Bag weight="fill" className="w-4 h-4" />}
              </span>
              {cat.name}
            </motion.button>
          );
        })}
      </div>

      {/* Items list */}
      <AnimatePresence mode="wait">
        {activeCategory && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="px-4 py-3 space-y-1.5"
          >
            {activeCategory.items.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-2.5"
              >
                {item.essential
                  ? <CheckCircle weight="fill" className="w-4 h-4 text-purple-500 shrink-0" />
                  : <Circle weight="regular" className="w-4 h-4 text-gray-300 shrink-0" />
                }
                <span className={cn("text-sm", item.essential ? "text-gray-800 font-medium" : "text-gray-500")}>
                  {item.name}
                </span>
                {item.essential && (
                  <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-500 border border-purple-100">
                    essential
                  </span>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
