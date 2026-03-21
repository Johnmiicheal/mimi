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
  festival: { icon: <Confetti    weight="fill" className="w-3.5 h-3.5" />, color: 'text-purple-100 bg-purple-400/15 border-purple-300/20' },
  holiday:  { icon: <Star        weight="fill" className="w-3.5 h-3.5" />, color: 'text-yellow-100 bg-yellow-400/15 border-yellow-300/20' },
  concert:  { icon: <MusicNote   weight="fill" className="w-3.5 h-3.5" />, color: 'text-pink-100 bg-pink-400/15 border-pink-300/20' },
  sport:    { icon: <Trophy      weight="fill" className="w-3.5 h-3.5" />, color: 'text-emerald-100 bg-emerald-400/15 border-emerald-300/20' },
  market:   { icon: <ShoppingBag weight="fill" className="w-3.5 h-3.5" />, color: 'text-orange-100 bg-orange-400/15 border-orange-300/20' },
  other:    { icon: <CalendarBlank weight="fill" className="w-3.5 h-3.5" />, color: 'text-white/75 bg-white/8 border-white/10' },
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
    <div className="rounded-[28px] overflow-hidden w-full" style={{ background: "linear-gradient(180deg, rgba(14,29,73,0.98) 0%, rgba(9,20,55,0.98) 100%)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 24px 56px rgba(5,10,33,0.3), inset 0 1px 0 rgba(255,255,255,0.06)" }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3" style={{ background: "linear-gradient(180deg, rgba(168,85,247,0.18), rgba(168,85,247,0.05))" }}>
        <p className="text-[11px] font-semibold text-purple-200 uppercase tracking-[0.22em]">Local Events</p>
        <p className="text-sm text-white/62 mt-1">
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
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-yellow-400/15 text-yellow-100 border border-yellow-300/20">
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
