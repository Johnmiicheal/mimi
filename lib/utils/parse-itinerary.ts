export interface Activity {
  id: string;
  name: string;
  category: string;
  description: string;
  duration: number;
  startTime?: string;
  location: { name: string; lat: number; lng: number };
  price: number;
  rating?: number;
  bookingRequired?: boolean;
}

export interface DaySchedule {
  day: number;
  date: string;
  theme?: string;
  activities: Activity[];
}

// Match: ### Day 1: Theme Title
const DAY_HEADING = /^#{2,3}\s+Day\s+(\d+)(?:\s*[:\-–]\s*(.+))?$/i;

// Time prefixes for categorization
const TIME_TO_CATEGORY: Record<string, string> = {
  morning: 'morning',
  afternoon: 'afternoon',
  evening: 'evening',
  night: 'night',
  breakfast: 'morning',
  lunch: 'afternoon',
  dinner: 'evening',
  sunrise: 'morning',
  sunset: 'evening',
};

const START_TIMES: Record<string, string> = {
  morning: '09:00',
  afternoon: '14:00',
  evening: '19:00',
  night: '21:00',
};

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  for (const [keyword, cat] of Object.entries(TIME_TO_CATEGORY)) {
    if (lower.startsWith(keyword) || lower.includes(`**${keyword}`)) {
      return cat;
    }
  }
  return 'activity';
}

function detectStartTime(text: string): string | undefined {
  const lower = text.toLowerCase();
  for (const [keyword, time] of Object.entries(START_TIMES)) {
    if (lower.startsWith(keyword) || lower.includes(`**${keyword}`)) {
      return time;
    }
  }
  const timeMatch = text.match(/\b(\d{1,2}:\d{2})\b/);
  return timeMatch?.[1];
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*[-–:]\s*/, '')
    .trim();
}

let activityCounter = 0;
function nextId(day: number): string {
  return `day${day}-act${++activityCounter}`;
}

function parseActivity(line: string, day: number): Activity {
  // Remove leading bullet
  const raw = line.replace(/^[-*+]\s*/, '').trim();

  const category = detectCategory(raw);
  const startTime = detectStartTime(raw);

  // Try to split "**Morning** – Description" or "**Morning**: Description"
  const split = raw.match(/^\*\*[^*]+\*\*\s*[–\-:]\s*(.+)/) ?? null;
  const description = split ? stripMarkdown(split[1]) : stripMarkdown(raw);

  // Extract a short name (first ~40 chars of description, cut at comma or dash)
  const namePart = description.split(/[,\-–]/)[0].trim();
  const name = namePart.length > 50 ? namePart.slice(0, 50) + '…' : namePart;

  return {
    id: nextId(day),
    name: name || 'Activity',
    category,
    description,
    duration: category === 'morning' || category === 'afternoon' ? 180 : 120,
    startTime,
    location: { name: 'See description', lat: 0, lng: 0 },
    price: 0,
  };
}

/**
 * Parses Day X section headings + bullet points out of a markdown string.
 * Returns DaySchedule[] if at least one day section is found, otherwise null.
 */
export function parseItinerary(text: string): DaySchedule[] | null {
  activityCounter = 0;
  const lines = text.split('\n');
  const days: DaySchedule[] = [];
  let current: DaySchedule | null = null;

  for (const line of lines) {
    const dayMatch = line.match(DAY_HEADING);
    if (dayMatch) {
      if (current) days.push(current);
      current = {
        day: parseInt(dayMatch[1], 10),
        date: `Day ${dayMatch[1]}`,
        theme: dayMatch[2]?.trim(),
        activities: [],
      };
      continue;
    }

    if (current && /^[-*+]\s/.test(line)) {
      const activity = parseActivity(line, current.day);
      current.activities.push(activity);
    }
  }

  if (current) days.push(current);

  return days.length >= 2 ? days : null;
}
