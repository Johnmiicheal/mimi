import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import { models } from '@/lib/providers/openrouter';

export const eventsSchema = z.object({
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

export type EventsAgentOutput = z.infer<typeof eventsSchema>;

export const eventsAgent = new Agent({
  id: 'events-agent',
  name: 'Events Agent',
  description: 'Handles local events research by calling the getLocalEvents tool and returning the events card data.',
  instructions: `You are an events specialist inside a multi-agent travel planner.

Only act when destination and travel dates are known.
When they are known, call the \`getLocalEvents\` tool.
Do not restate the full event list because the UI already renders the card.
After the tool finishes, respond with one short sentence at most.`,
  model: models.research,
  tools: () => ({
    getLocalEvents: getLocalEventsTool,
  }),
});

export async function runEvents(params: { destination: string; dates?: { from: string; to: string } }): Promise<EventsAgentOutput> {
  const fromDate = params.dates?.from ?? 'the travel period';
  const toDate = params.dates?.to ?? '';
  const result = await generateText({
    model: models.research,
    output: Output.object({ schema: eventsSchema }),
    prompt: `Find local events, festivals, holidays, and special happenings in ${params.destination} during ${fromDate}${toDate ? ` to ${toDate}` : ''}.

Return up to 8 events relevant and interesting for tourists:
- id: unique short ID (e.g. "evt-1")
- name: event name
- date: formatted date like "Mar 21" or "Mar 21–25"
- category: one of festival, holiday, concert, sport, market, other
- description: one sentence (max 120 chars)
- mustSee: true if this is a major highlight

Include real events, national holidays, local markets, and cultural festivals.`,
  });
  return {
    destination: result.output.destination,
    travelDates: result.output.travelDates,
    events: result.output.events,
  };
}

export const getLocalEventsTool = createTool({
  id: 'getLocalEvents',
  description: 'Find local events, festivals, and cultural happenings. Only call when travel dates are provided.',
  inputSchema: z.object({
    destination: z.string().describe('The travel destination'),
    dates: z.object({ from: z.string(), to: z.string() }).describe('The travel dates (required)'),
  }),
  execute: async (input) => {
    return runEvents({ destination: input.destination, dates: input.dates });
  },
});
