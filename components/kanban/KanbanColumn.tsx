'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import { Clock, MapPin, CurrencyDollar, Warning, Plus } from '@phosphor-icons/react';
import { KanbanCard } from './KanbanCard';

interface Activity {
  id: string;
  name: string;
  category: string;
  description: string;
  duration: number;
  startTime?: string;
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  price: number;
  rating?: number;
  bookingRequired?: boolean;
}

interface KanbanColumnProps {
  day: number;
  date: string;
  theme?: string;
  activities: Activity[];
  onEdit?: (activity: Activity) => void;
  onDelete?: (activityId: string) => void;
  onAddActivity?: (day: number) => void;
}

export function KanbanColumn({
  day,
  date,
  theme,
  activities,
  onEdit,
  onDelete,
  onAddActivity,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${day}`,
  });

  // Calculate total duration and cost
  const totalDuration = activities.reduce((sum, act) => sum + act.duration, 0);
  const totalCost = activities.reduce((sum, act) => sum + act.price, 0);
  const hours = Math.floor(totalDuration / 60);
  const minutes = totalDuration % 60;

  // Check if day is too packed (>10 hours)
  const isTooPackedWarning = totalDuration > 600;
  const isModerateWarning = totalDuration > 480 && totalDuration <= 600;

  return (
    <div className="flex-shrink-0 w-80">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-50/50 dark:bg-gray-900/30 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-4 h-full"
      >
        {/* Column header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                Day {day}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{date}</p>
            </div>
            <button
              onClick={() => onAddActivity?.(day)}
              className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors group"
              title="Add activity"
            >
              <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
            </button>
          </div>

          {theme && (
            <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-3">
              {theme}
            </div>
          )}

          {/* Day stats */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>
                {hours > 0 && `${hours}h `}
                {minutes > 0 && `${minutes}m`}
                {totalDuration === 0 && 'No activities'}
              </span>
              {isTooPackedWarning && (
                <span className="ml-auto flex items-center gap-1 text-red-600 dark:text-red-400">
                  <Warning className="w-4 h-4" weight="fill" />
                  Too packed!
                </span>
              )}
              {isModerateWarning && !isTooPackedWarning && (
                <span className="ml-auto flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <Warning className="w-4 h-4" weight="fill" />
                  Busy day
                </span>
              )}
            </div>

            {totalCost > 0 && (
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <CurrencyDollar className="w-4 h-4" />
                <span>${totalCost} in activities</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>{activities.length} activities</span>
            </div>
          </div>
        </div>

        {/* Drop area */}
        <div
          ref={setNodeRef}
          className={`min-h-[400px] space-y-3 rounded-lg transition-colors ${
            isOver
              ? 'bg-blue-50/50 dark:bg-blue-900/10 border-2 border-dashed border-blue-400'
              : ''
          }`}
        >
          <SortableContext
            items={activities.map((a) => a.id)}
            strategy={verticalListSortingStrategy}
          >
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Drop activities here or click + to add
                </p>
              </div>
            ) : (
              activities.map((activity) => (
                <KanbanCard
                  key={activity.id}
                  activity={activity}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </SortableContext>
        </div>
      </motion.div>
    </div>
  );
}
