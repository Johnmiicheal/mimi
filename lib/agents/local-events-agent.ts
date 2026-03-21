import type { EventsData } from '@/components/agent-ui/EventsCard';
import { generateObject } from 'ai';
import { z } from 'zod';
import { models } from '@/lib/providers/openrouter';

interface TripParams {
  destination: string;
  dates?: { from: string; to: string };
}

const eventsSchema = z.object({
  destination: z.string(),
  travelDates: z.object({ from: z.string(), to: z.string() }),
  events: z.array(z.object({
    id: z.string(),
    name: z.string(),
    date: z.string(),
    category: z.enum(['festival', 'holiday', 'concert', 'sport', 'market', 'other']),
    description: z.string().max(120),
    mustSee: z.boolean(),
  })).max(8),
});

export async function runEventsAgent(params: TripParams): Promise<EventsData> {
  const fromDate = params.dates?.from ?? 'the travel period';
  const toDate = params.dates?.to ?? '';

  const { object } = await generateObject({
    model: models.research,
    schema: eventsSchema,
    prompt: `Find local events, festivals, holidays, and special happenings in ${params.destination} during ${fromDate}${toDate ? ` to ${toDate}` : ''}.

Return up to 8 events that would be relevant and interesting for tourists. For each event:
- id: unique short ID (e.g. "evt-1")
- name: event name
- date: formatted date like "Mar 21" or "Mar 21–25"
- category: one of festival, holiday, concert, sport, market, other
- description: one sentence (max 120 chars) describing why it's interesting for visitors
- mustSee: true if this is a major highlight the traveler shouldn't miss

Include real events, national holidays, local markets, and cultural festivals.`,
  });

  return {
    destination: object.destination,
    travelDates: object.travelDates,
    events: object.events,
  };
}
