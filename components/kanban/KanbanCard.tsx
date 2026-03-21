'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import {
  MapPin,
  Clock,
  CurrencyDollar,
  Star,
  DotsThreeVertical,
  Trash,
  Pencil,
  CalendarBlank,
  Users
} from '@phosphor-icons/react';
import { useState } from 'react';

interface Activity {
  id: string;
  name: string;
  category: string;
  description: string;
  duration: number; // minutes
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

interface KanbanCardProps {
  activity: Activity;
  onEdit?: (activity: Activity) => void;
  onDelete?: (activityId: string) => void;
}

const categoryConfig: Record<string, { icon: string; color: string; bg: string }> = {
  culture: { icon: '⛩️', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  food: { icon: '🍜', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  nature: { icon: '🌳', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
  shopping: { icon: '🛍️', color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-900/20' },
  entertainment: { icon: '🎭', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  photography: { icon: '📸', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  default: { icon: '✨', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-900/20' },
};

export function KanbanCard({ activity, onEdit, onDelete }: KanbanCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const config = categoryConfig[activity.category] || categoryConfig.default;
  const hours = Math.floor(activity.duration / 60);
  const minutes = activity.duration % 60;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-all duration-200"
      >
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute left-0 top-0 bottom-0 w-8 cursor-grab active:cursor-grabbing flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <div className="w-1 h-8 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        <div className="pl-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xl">{config.icon}</span>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">
                {activity.name}
              </h3>
            </div>

            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors opacity-0 group-hover:opacity-100"
              >
                <DotsThreeVertical className="w-4 h-4 text-gray-500" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-6 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 min-w-[140px]">
                    <button
                      onClick={() => {
                        onEdit?.(activity);
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        onDelete?.(activity.id);
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-red-600 dark:text-red-400"
                    >
                      <Trash className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Category badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.color} font-medium`}>
              {activity.category}
            </span>
            {activity.bookingRequired && (
              <span className="text-xs px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-medium">
                Booking required
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {activity.description}
          </p>

          {/* Details grid */}
          <div className="space-y-2">
            {/* Time */}
            {activity.startTime && (
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>
                  {activity.startTime}
                  {hours > 0 && ` • ${hours}h`}
                  {minutes > 0 && ` ${minutes}m`}
                </span>
              </div>
            )}

            {/* Location */}
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4 text-red-500" />
              <span className="line-clamp-1">{activity.location.name}</span>
            </div>

            {/* Price and rating */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <CurrencyDollar className="w-4 h-4 text-green-500" />
                <span>
                  {activity.price === 0 ? 'Free' : `$${activity.price}`}
                </span>
              </div>

              {activity.rating && (
                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <Star className="w-4 h-4 text-yellow-500" weight="fill" />
                  <span>{activity.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
