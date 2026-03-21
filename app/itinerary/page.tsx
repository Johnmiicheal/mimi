'use client';

import { useState } from 'react';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { exportToCalendar } from '@/lib/utils/calendar-export';
import { ArrowLeft } from '@phosphor-icons/react';
import Link from 'next/link';

// Sample data for demonstration
const sampleSchedule = [
  {
    day: 1,
    date: new Date(2026, 5, 15).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }),
    theme: 'Cultural Exploration',
    activities: [
      {
        id: 'ACT001',
        name: 'Senso-ji Temple',
        category: 'culture',
        description: "Tokyo's oldest and most significant Buddhist temple in Asakusa",
        duration: 120,
        startTime: '09:00 AM',
        location: { name: 'Asakusa, Taito', lat: 35.7148, lng: 139.7967 },
        price: 0,
        rating: 4.8,
        bookingRequired: false,
      },
      {
        id: 'ACT002',
        name: 'Tsukiji Outer Market',
        category: 'food',
        description: 'Fresh seafood, street food, and traditional Japanese ingredients',
        duration: 90,
        startTime: '12:00 PM',
        location: { name: 'Tsukiji, Chuo', lat: 35.6654, lng: 139.7707 },
        price: 30,
        rating: 4.6,
        bookingRequired: false,
      },
      {
        id: 'ACT003',
        name: 'Tokyo Skytree',
        category: 'photography',
        description: "Japan's tallest structure with panoramic city views",
        duration: 120,
        startTime: '04:00 PM',
        location: { name: 'Sumida, Tokyo', lat: 35.7101, lng: 139.8107 },
        price: 25,
        rating: 4.7,
        bookingRequired: false,
      },
    ],
  },
  {
    day: 2,
    date: new Date(2026, 5, 16).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }),
    theme: 'Nature & Modernity',
    activities: [
      {
        id: 'ACT004',
        name: 'Meiji Shrine',
        category: 'culture',
        description: 'Peaceful Shinto shrine dedicated to Emperor Meiji and Empress Shoken',
        duration: 90,
        startTime: '10:00 AM',
        location: { name: 'Shibuya, Tokyo', lat: 35.6764, lng: 139.6993 },
        price: 0,
        rating: 4.7,
        bookingRequired: false,
      },
      {
        id: 'ACT005',
        name: 'Harajuku Street',
        category: 'shopping',
        description: 'Trendy shopping district known for youth culture and fashion',
        duration: 120,
        startTime: '01:00 PM',
        location: { name: 'Harajuku, Shibuya', lat: 35.6702, lng: 139.7026 },
        price: 0,
        rating: 4.4,
        bookingRequired: false,
      },
      {
        id: 'ACT006',
        name: 'Shibuya Crossing',
        category: 'photography',
        description: "World's busiest pedestrian crossing and iconic Tokyo landmark",
        duration: 45,
        startTime: '05:00 PM',
        location: { name: 'Shibuya, Tokyo', lat: 35.6595, lng: 139.7004 },
        price: 0,
        rating: 4.5,
        bookingRequired: false,
      },
    ],
  },
  {
    day: 3,
    date: new Date(2026, 5, 17).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }),
    theme: 'Digital Art & Entertainment',
    activities: [
      {
        id: 'ACT007',
        name: 'TeamLab Borderless',
        category: 'entertainment',
        description: 'Immersive digital art museum with stunning interactive installations',
        duration: 180,
        startTime: '11:00 AM',
        location: { name: 'Odaiba, Tokyo', lat: 35.6252, lng: 139.7756 },
        price: 35,
        rating: 4.9,
        bookingRequired: true,
      },
      {
        id: 'ACT008',
        name: 'Ueno Park',
        category: 'nature',
        description: 'Large public park with museums, zoo, and beautiful cherry blossoms',
        duration: 150,
        startTime: '03:00 PM',
        location: { name: 'Ueno, Taito', lat: 35.7147, lng: 139.7738 },
        price: 0,
        rating: 4.6,
        bookingRequired: false,
      },
    ],
  },
];

export default function ItineraryPage() {
  const [schedule, setSchedule] = useState(sampleSchedule);

  const handleExportCalendar = () => {
    exportToCalendar(schedule, 'Tokyo Adventure 2026');
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleScheduleChange = (newSchedule: any) => {
    setSchedule(newSchedule);
    console.log('Schedule updated:', newSchedule);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-[1800px] mx-auto p-6">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to planner
        </Link>

        {/* Trip header */}
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Tokyo Adventure 2026
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            3-day cultural and culinary journey through Japan's capital
          </p>
          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-gray-600 dark:text-gray-400">
                2 travelers
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-600 dark:text-gray-400">
                $2,500 budget
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-gray-600 dark:text-gray-400">
                Moderate pace
              </span>
            </div>
          </div>
        </div>

        {/* Kanban board */}
        <KanbanBoard
          schedule={schedule}
          onScheduleChange={handleScheduleChange}
          onExportCalendar={handleExportCalendar}
        />

        {/* Tips section */}
        <div className="mt-6 bg-blue-50/50 dark:bg-blue-900/10 backdrop-blur-sm border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
            💡 Pro Tips
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>• Drag activities between days to reorganize your schedule</li>
            <li>• Click the menu (⋮) on any activity to edit or delete it</li>
            <li>• Watch the time warnings - days over 10 hours might be too packed</li>
            <li>• Export to calendar to sync with Google Calendar, Apple Calendar, or Outlook</li>
            <li>• Activities are grouped geographically to minimize travel time</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
