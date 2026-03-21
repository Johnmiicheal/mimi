"use client";

import { useState } from "react";
import { Star, Confetti, MusicNote, Trophy, ShoppingBag, CalendarBlank } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CONTROL_COLORS, pillBoxShadow } from "@/lib/inline-ui/colors";

export interface TravelEvent {
  id: string;
  name: string;
  date: string;
  category: 'festival' | 'holiday' | 'concert' | 'sport' | 'market' | 'other';
  description: string;
  mustSee: boolean;
}

export interface EventsData {
  destination: string;
  travelDates: { from: string; to: string };
  events: TravelEvent[];
}

const categoryConfig = {
  festival: { icon: <Confetti    weight="fill" className="w-3.5 h-3.5" />, color: 'text-purple-600 bg-purple-50 border-purple-100' },
  holiday:  { icon: <Star        weight="fill" className="w-3.5 h-3.5" />, color: 'text-yellow-600 bg-yellow-50 border-yellow-100' },
  concert:  { icon: <MusicNote   weight="fill" className="w-3.5 h-3.5" />, color: 'text-pink-600 bg-pink-50 border-pink-100' },
  sport:    { icon: <Trophy      weight="fill" className="w-3.5 h-3.5" />, color: 'text-green-600 bg-green-50 border-green-100' },
  market:   { icon: <ShoppingBag weight="fill" className="w-3.5 h-3.5" />, color: 'text-orange-600 bg-orange-50 border-orange-100' },
  other:    { icon: <CalendarBlank weight="fill" className="w-3.5 h-3.5" />, color: 'text-gray-600 bg-gray-50 border-gray-100' },
};

const ACTIVE_COLOR  = CONTROL_COLORS[4]; // purple
const activeStyle   = { background: ACTIVE_COLOR.gradient, boxShadow: pillBoxShadow(ACTIVE_COLOR, "sm") };
const inactiveStyle = { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" };

export function EventsCard({ data }: { data: EventsData }) {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filtered = activeFilter === 'all'
    ? data.events
    : data.events.filter(e => e.category === activeFilter);

  const usedCategories = [...new Set(data.events.map(e => e.category))];
  const filters = ['all', ...usedCategories];

  return (
    <div className="rounded-2xl overflow-hidden w-full" style={{ background: "#0d2050", border: "1px solid rgba(255,255,255,0.12)" }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-2" style={{ background: "rgba(147,51,234,0.15)" }}>
        <p className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Local Events</p>
        <p className="text-sm text-white/60 mt-0.5">
          {data.travelDates.from} – {data.travelDates.to} · {data.destination}
        </p>
      </div>

      {/* Category filter chips */}
      <div className="flex gap-1.5 px-4 py-2.5 overflow-x-auto scrollbar-none border-b border-white/8">
        {filters.map((cat) => (
          <motion.button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className="px-2.5 py-1 text-xs rounded-full font-medium whitespace-nowrap capitalize text-white"
            style={activeFilter === cat ? activeStyle : inactiveStyle}
            whileHover={{ scale: 1.08, transition: { type: "spring", stiffness: 800, damping: 20 } }}
            whileTap={{ scale: 0.93, transition: { type: "spring", stiffness: 1000, damping: 30 } }}
            transition={{ type: "spring", stiffness: 800, damping: 20 }}
          >
            {cat}
          </motion.button>
        ))}
      </div>

      {/* Events list */}
      <div className="px-4 py-3 space-y-2.5 max-h-64 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-xs text-white/35 text-center py-4">No events in this category</p>
        ) : (
          filtered.map((event) => {
            const cat = categoryConfig[event.category];
            return (
              <div key={event.id} className="flex gap-3">
                <div className="shrink-0 w-10 flex flex-col items-center">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <CalendarBlank weight="duotone" className="w-4 h-4 text-white/40" />
                  </div>
                  <span className="text-xs text-white/35 mt-0.5 text-center leading-tight">{event.date}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border", cat.color)}>
                      {cat.icon}
                      {event.category}
                    </span>
                    {event.mustSee && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-yellow-50 text-yellow-700 border border-yellow-100">
                        <Star weight="fill" className="w-3 h-3" />
                        Must-see
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-white/90 mt-1 leading-snug">{event.name}</p>
                  <p className="text-xs text-white/50 mt-0.5 line-clamp-2">{event.description}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
