import { NextResponse } from 'next/server';
import { callCivic, extractText } from '@/lib/civic/client';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface Activity {
  name: string;
  description: string;
  duration: number;
  startTime?: string;
  location: { name: string };
}

interface DaySchedule {
  day: number;
  date: string;
  theme?: string;
  activities: Activity[];
}

interface ExportRequest {
  schedule: DaySchedule[];
  tripName: string;
  destination: string;
  startDate?: string; // ISO date string e.g. "2026-06-15"
}

export async function POST(req: Request) {
  try {
    const { schedule, tripName, destination, startDate } = (await req.json()) as ExportRequest;

    if (!schedule?.length) {
      return NextResponse.json({ error: 'No itinerary to export' }, { status: 400 });
    }

    // Build a clear prompt for Claude to create calendar events via Civic
    const eventsDescription = schedule
      .map((day) => {
        const dateInfo = startDate
          ? `Date: offset Day ${day.day} from ${startDate}`
          : `Day ${day.day}`;
        const theme = day.theme ? ` (${day.theme})` : '';

        const activities = day.activities
          .map((a) => {
            const time = a.startTime ?? 'TBD';
            return `  - ${a.name} at ${time}, ${a.duration} min, location: ${a.location.name}. ${a.description}`;
          })
          .join('\n');

        return `${dateInfo}${theme}:\n${activities}`;
      })
      .join('\n\n');

    const prompt = `Create Google Calendar events for this trip itinerary "${tripName}" in ${destination}.

${startDate ? `The trip starts on ${startDate}.` : 'Use upcoming dates starting from next Monday.'}

For each activity below, create a separate calendar event with:
- The activity name as the event title
- The start time and duration as specified
- The location
- A brief description including the day theme

Itinerary:
${eventsDescription}

After creating all events, list the event names and their Google Calendar links.`;

    const response = await callCivic(prompt);
    const text = extractText(response);

    return NextResponse.json({
      success: true,
      message: text,
      eventsCreated: schedule.reduce((sum, day) => sum + day.activities.length, 0),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Export Calendar] Error:', msg, error);
    return NextResponse.json(
      { error: 'Failed to export to Google Calendar', detail: msg },
      { status: 500 },
    );
  }
}
