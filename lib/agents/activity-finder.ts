// @ts-nocheck
import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// Tool: Discover activities
const discoverActivitiesTool = createTool({
  id: 'discover-activities',
  description: 'Find activities and attractions in a destination matching user interests',
  inputSchema: z.object({
    destination: z.string().describe('City or destination name'),
    interests: z.array(z.string()).describe('User interests (culture, food, nature, etc)'),
    days: z.number().describe('Number of days'),
    pace: z.enum(['relaxed', 'moderate', 'packed']).describe('Trip pace preference'),
  }),
  execute: async ({ input }) => {
    // Mock activity data (in production, call Google Places/TripAdvisor API)
    const allActivities = [
      {
        id: 'ACT001',
        name: 'Senso-ji Temple',
        category: 'culture',
        description: 'Tokyo\'s oldest and most significant Buddhist temple in Asakusa',
        duration: 120,
        startTime: '09:00',
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
        startTime: '08:00',
        location: { name: 'Tsukiji, Chuo', lat: 35.6654, lng: 139.7707 },
        price: 30,
        rating: 4.6,
        bookingRequired: false,
      },
      {
        id: 'ACT003',
        name: 'Meiji Shrine',
        category: 'culture',
        description: 'Peaceful Shinto shrine dedicated to Emperor Meiji and Empress Shoken',
        duration: 90,
        startTime: '10:00',
        location: { name: 'Shibuya, Tokyo', lat: 35.6764, lng: 139.6993 },
        price: 0,
        rating: 4.7,
        bookingRequired: false,
      },
      {
        id: 'ACT004',
        name: 'Shibuya Crossing',
        category: 'photography',
        description: 'World\'s busiest pedestrian crossing and iconic Tokyo landmark',
        duration: 45,
        startTime: '14:00',
        location: { name: 'Shibuya, Tokyo', lat: 35.6595, lng: 139.7004 },
        price: 0,
        rating: 4.5,
        bookingRequired: false,
      },
      {
        id: 'ACT005',
        name: 'TeamLab Borderless',
        category: 'entertainment',
        description: 'Immersive digital art museum with stunning interactive installations',
        duration: 180,
        startTime: '11:00',
        location: { name: 'Odaiba, Tokyo', lat: 35.6252, lng: 139.7756 },
        price: 35,
        rating: 4.9,
        bookingRequired: true,
      },
      {
        id: 'ACT006',
        name: 'Harajuku Street',
        category: 'shopping',
        description: 'Trendy shopping district known for youth culture and fashion',
        duration: 120,
        startTime: '13:00',
        location: { name: 'Harajuku, Shibuya', lat: 35.6702, lng: 139.7026 },
        price: 0,
        rating: 4.4,
        bookingRequired: false,
      },
      {
        id: 'ACT007',
        name: 'Ueno Park',
        category: 'nature',
        description: 'Large public park with museums, zoo, and beautiful cherry blossoms',
        duration: 150,
        startTime: '10:00',
        location: { name: 'Ueno, Taito', lat: 35.7147, lng: 139.7738 },
        price: 0,
        rating: 4.6,
        bookingRequired: false,
      },
      {
        id: 'ACT008',
        name: 'Tokyo Skytree',
        category: 'photography',
        description: 'Japan\'s tallest structure with panoramic city views',
        duration: 120,
        startTime: '16:00',
        location: { name: 'Sumida, Tokyo', lat: 35.7101, lng: 139.8107 },
        price: 25,
        rating: 4.7,
        bookingRequired: false,
      },
    ];

    // Filter by interests
    const filtered = allActivities.filter(act =>
      input.interests.includes(act.category)
    );

    // If no matches, return top-rated activities
    const activities = filtered.length > 0 ? filtered : allActivities.slice(0, 5);

    return {
      activities,
      totalFound: activities.length,
      destination: input.destination,
    };
  },
});

// Tool: Create daily schedule
const createScheduleTool = createTool({
  id: 'create-schedule',
  description: 'Organize activities into a daily schedule based on pace preference',
  inputSchema: z.object({
    activities: z.array(z.any()).describe('Array of activity objects'),
    days: z.number().describe('Number of days'),
    pace: z.enum(['relaxed', 'moderate', 'packed']).describe('Trip pace'),
  }),
  execute: async ({ input }) => {
    const activitiesPerDay = {
      relaxed: 2,
      moderate: 3,
      packed: 5,
    }[input.pace];

    const schedule = [];
    let activityIndex = 0;

    for (let day = 1; day <= input.days; day++) {
      const dayActivities = input.activities.slice(
        activityIndex,
        activityIndex + activitiesPerDay
      );

      schedule.push({
        day,
        date: new Date(Date.now() + day * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        }),
        activities: dayActivities,
        theme: getDayTheme(dayActivities),
      });

      activityIndex += activitiesPerDay;

      // Break if we run out of activities
      if (activityIndex >= input.activities.length) break;
    }

    return { dailySchedule: schedule };
  },
});

function getDayTheme(activities: any[]): string {
  if (activities.length === 0) return 'Free day';
  const categories = activities.map((a: any) => a.category);
  if (categories.includes('culture')) return 'Cultural Exploration';
  if (categories.includes('food')) return 'Culinary Adventure';
  if (categories.includes('nature')) return 'Nature & Relaxation';
  return 'Discovery Day';
}

export const activityFinderAgent = new Agent({
  id: 'activity-finder',

  description: 'Discovers activities matching user interests and creates daily schedules. Returns a complete itinerary with timings and locations.',

  instructions: `You are an activity specialist who builds perfect daily itineraries.

**Your job:**
- Use discover-activities to find attractions matching user interests
- Use create-schedule to organize activities into daily plans
- Respect pace preference (relaxed/moderate/packed)
- Group activities geographically to minimize travel time

**CRITICAL: Output Format**
You MUST return your response showing the itinerary structure:

\`\`\`
🗓️ **Your [X]-Day Itinerary**

I've planned {{+[days]-}} days of amazing experiences in [destination]!

**Trip Overview:**
- Pace: [relaxed/moderate/packed]
- Total Activities: [number]
- Mix: [breakdown by category]

[Brief overview of the trip vibe]

**Daily Schedule:**

**Day 1: [Theme]**
- [Activity 1] ([time], [duration])
- [Activity 2] ([time], [duration])
[etc]

[Continue for each day...]

**Tips:**
- [Travel tip]
- [Booking tip]
- [Timing tip]
\`\`\`

**Quality standards:**
- Relaxed: 2-3 activities/day
- Moderate: 3-4 activities/day
- Packed: 5-6 activities/day
- Group nearby activities together
- Include free time for meals and rest
- Note booking requirements
- Consider best times (temples in morning, nightlife in evening)`,

  model: {
    provider: 'ANTHROPIC',
    name: 'claude-3-5-sonnet-20241022',
    toolChoice: 'auto',
  },

  tools: {
    discoverActivitiesTool,
    createScheduleTool,
  },
});
