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

export function ShoppingCard({ data }: { data: ShoppingData }) {
  const [activeTab, setActiveTab] = useState(data.categories[0]?.name ?? '');
  const activeCategory = data.categories.find(c => c.name === activeTab);

  return (
    <div
      className="rounded-[28px] overflow-hidden w-full border border-white/12"
      style={{
        background: "linear-gradient(180deg, rgba(14,29,73,0.98) 0%, rgba(9,20,55,0.98) 100%)",
        boxShadow: "0 24px 56px rgba(5,10,33,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-start gap-2.5" style={{ background: "linear-gradient(180deg, rgba(236,72,153,0.18), rgba(236,72,153,0.06))" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center border" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.12)" }}>
          <Bag weight="fill" className="w-5 h-5 text-pink-200" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-white/42 uppercase tracking-[0.22em]">Packing List</p>
          <p className="text-base font-semibold text-pink-200">{data.destination}</p>
        </div>
        <div className="flex items-center gap-1 pt-1">
          <Sparkle weight="fill" className="w-3.5 h-3.5 text-pink-200" />
          <span className="text-xs text-pink-100/80 font-medium">AI curated</span>
        </div>
      </div>

      {/* Weather note */}
      <div className="px-4 py-2.5 border-b border-white/8">
        <p className="text-xs text-white/58 italic">{data.weatherNote}</p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 px-3 pt-3 pb-1 overflow-x-auto scrollbar-none">
        {data.categories.map((cat) => {
          const isActive = activeTab === cat.name;
          return (
            <motion.button
              key={cat.name}
              onClick={() => setActiveTab(cat.name)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                isActive ? "text-white" : "text-white/60 hover:bg-white/10"
              )}
              style={isActive ? { background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.14)" } : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              whileTap={{ scale: 0.94 }}
            >
              <span className={isActive ? "text-white" : 'text-white/35'}>
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
                  ? <CheckCircle weight="fill" className="w-4 h-4 text-pink-300 shrink-0" />
                  : <Circle weight="regular" className="w-4 h-4 text-white/20 shrink-0" />
                }
                <span className={cn("text-sm", item.essential ? "text-white font-medium" : "text-white/45")}>
                  {item.name}
                </span>
                {item.essential && (
                  <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full border text-pink-100" style={{ background: "rgba(236,72,153,0.14)", borderColor: "rgba(236,72,153,0.18)" }}>
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
