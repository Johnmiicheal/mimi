"use client";

import { Clock, MapPin, Camera, ForkKnife, Buildings, Mountains } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface Activity {
  id: string;
  name: string;
  description: string;
  category: 'culture' | 'food' | 'nature' | 'photography' | 'shopping' | 'entertainment';
  duration: number; // minutes
  startTime?: string; // "09:00"
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  price?: number;
  rating?: number;
  bookingRequired?: boolean;
}

export interface DayPlan {
  day: number;
  date: string;
  theme?: string;
  activities: Activity[];
  totalDuration?: number;
}

interface DailyTimelineProps {
  dailyPlans: DayPlan[];
  pace?: 'relaxed' | 'moderate' | 'packed';
  onActivityClick?: (activity: Activity) => void;
}

const categoryIcons: Record<Activity['category'], React.ReactNode> = {
  culture: <Buildings weight="duotone" className="w-5 h-5" />,
  food: <ForkKnife weight="duotone" className="w-5 h-5" />,
  nature: <Mountains weight="duotone" className="w-5 h-5" />,
  photography: <Camera weight="duotone" className="w-5 h-5" />,
  shopping: <Buildings weight="duotone" className="w-5 h-5" />,
  entertainment: <Camera weight="duotone" className="w-5 h-5" />,
};

const categoryColors: Record<Activity['category'], string> = {
  culture: 'from-purple-500 to-purple-600',
  food: 'from-orange-500 to-orange-600',
  nature: 'from-green-500 to-green-600',
  photography: 'from-pink-500 to-pink-600',
  shopping: 'from-blue-500 to-blue-600',
  entertainment: 'from-yellow-500 to-yellow-600',
};

export function DailyTimeline({
  dailyPlans,
  pace = 'moderate',
  onActivityClick
}: DailyTimelineProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {dailyPlans.map((dayPlan, dayIndex) => {
        const totalTime = dayPlan.activities.reduce((sum, act) => sum + act.duration, 0);
        const isTooPacked = totalTime > 600; // More than 10 hours

        return (
          <motion.div
            key={dayPlan.day}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: dayIndex * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
          >
            {/* Day header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">Day {dayPlan.day}</h3>
                  <p className="text-sm text-blue-100">{dayPlan.date}</p>
                  {dayPlan.theme && (
                    <p className="text-sm text-blue-100 mt-1 italic">"{dayPlan.theme}"</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{dayPlan.activities.length} activities</div>
                  <div className="text-xs text-blue-100">{formatDuration(totalTime)} total</div>
                  {isTooPacked && (
                    <div className="text-xs text-yellow-300 mt-1">⚠️ Packed day!</div>
                  )}
                </div>
              </div>
            </div>

            {/* Activities timeline */}
            <div className="p-6 space-y-4">
              {dayPlan.activities.map((activity, actIndex) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: dayIndex * 0.1 + actIndex * 0.05 }}
                  className="relative"
                >
                  {/* Timeline connector */}
                  {actIndex < dayPlan.activities.length - 1 && (
                    <div className="absolute left-[19px] top-12 w-0.5 h-8 bg-gray-200 dark:bg-gray-700" />
                  )}

                  <motion.button
                    onClick={() => onActivityClick?.(activity)}
                    className={cn(
                      "w-full flex gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700",
                      "hover:border-blue-300 dark:hover:border-blue-600",
                      "hover:shadow-md transition-all duration-200",
                      "text-left"
                    )}
                    whileHover={{ scale: 1.01, x: 4 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {/* Icon */}
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                      `bg-gradient-to-br ${categoryColors[activity.category]}`,
                      "text-white shadow-md"
                    )}>
                      {categoryIcons[activity.category]}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {activity.name}
                        </h4>
                        {activity.startTime && (
                          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                            <Clock weight="bold" className="w-4 h-4" />
                            <span>{activity.startTime}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {activity.description}
                      </p>

                      <div className="flex flex-wrap gap-3 text-xs">
                        {/* Location */}
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                          <MapPin weight="fill" className="w-3 h-3" />
                          <span>{activity.location.name}</span>
                        </div>

                        {/* Duration */}
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                          <Clock weight="bold" className="w-3 h-3" />
                          <span>{formatDuration(activity.duration)}</span>
                        </div>

                        {/* Price */}
                        {activity.price !== undefined && activity.price > 0 && (
                          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                            <span>💰</span>
                            <span>${activity.price}</span>
                          </div>
                        )}

                        {activity.price === 0 && (
                          <div className="text-green-600 dark:text-green-400 font-medium">
                            Free!
                          </div>
                        )}

                        {/* Rating */}
                        {activity.rating && (
                          <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                            <span>⭐</span>
                            <span>{activity.rating.toFixed(1)}</span>
                          </div>
                        )}

                        {/* Booking required */}
                        {activity.bookingRequired && (
                          <div className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                            Booking required
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.button>
                </motion.div>
              ))}

              {dayPlan.activities.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No activities planned yet</p>
                  <p className="text-sm">Add activities to your itinerary!</p>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
