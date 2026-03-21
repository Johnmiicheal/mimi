"use client";

import { useState } from "react";
import { Star, Confetti, MusicNote, Trophy, ShoppingBag, CalendarBlank } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

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
  festival: { icon: <Confetti weight="fill" className="w-3.5 h-3.5" />, color: 'text-purple-600 bg-purple-50 border-purple-100' },
  holiday: { icon: <Star weight="fill" className="w-3.5 h-3.5" />, color: 'text-yellow-600 bg-yellow-50 border-yellow-100' },
  concert: { icon: <MusicNote weight="fill" className="w-3.5 h-3.5" />, color: 'text-pink-600 bg-pink-50 border-pink-100' },
  sport: { icon: <Trophy weight="fill" className="w-3.5 h-3.5" />, color: 'text-green-600 bg-green-50 border-green-100' },
  market: { icon: <ShoppingBag weight="fill" className="w-3.5 h-3.5" />, color: 'text-orange-600 bg-orange-50 border-orange-100' },
  other: { icon: <CalendarBlank weight="fill" className="w-3.5 h-3.5" />, color: 'text-gray-600 bg-gray-50 border-gray-100' },
};

const categories = ['all', 'festival', 'holiday', 'concert', 'sport', 'market', 'other'] as const;

export function EventsCard({ data }: { data: EventsData }) {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filtered = activeFilter === 'all'
    ? data.events
    : data.events.filter(e => e.category === activeFilter);

  const usedCategories = [...new Set(data.events.map(e => e.category))];
  const filters = ['all', ...usedCategories];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden w-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 bg-purple-50">
        <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Local Events</p>
        <p className="text-sm text-gray-600 mt-0.5">
          {data.travelDates.from} – {data.travelDates.to} · {data.destination}
        </p>
      </div>

      {/* Category filters */}
      <div className="flex gap-1.5 px-4 py-2.5 overflow-x-auto scrollbar-none border-b border-gray-50">
        {filters.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={cn(
              "px-2.5 py-1 text-xs rounded-full border font-medium whitespace-nowrap transition-colors capitalize",
              activeFilter === cat
                ? "bg-purple-600 text-white border-purple-600"
                : "text-gray-500 border-gray-200 hover:border-gray-300"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events list */}
      <div className="px-4 py-3 space-y-2.5 max-h-64 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No events in this category</p>
        ) : (
          filtered.map((event) => {
            const cat = categoryConfig[event.category];
            return (
              <div key={event.id} className="flex gap-3">
                {/* Date chip */}
                <div className="shrink-0 w-10 flex flex-col items-center">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                    <CalendarBlank weight="duotone" className="w-4 h-4 text-gray-400" />
                  </div>
                  <span className="text-xs text-gray-400 mt-0.5 text-center leading-tight">{event.date}</span>
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
                  <p className="text-sm font-semibold text-gray-800 mt-1 leading-snug">{event.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{event.description}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
