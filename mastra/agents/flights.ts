import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import { models } from '@/lib/providers/openrouter';

export const flightsSchema = z.object({
  route: z.string(),
  options: z.array(z.object({
    airline: z.string(),
    price: z.number(),
    duration: z.string(),
    stops: z.number(),
    departTime: z.string(),
    arrivalTime: z.string(),
    class: z.enum(['economy', 'premium', 'business']),
  })).max(4),
  cheapestTip: z.string(),
  bestMonths: z.string(),
});

export type FlightsAgentOutput = z.infer<typeof flightsSchema>;

export const flightsAgent = new Agent({
  id: 'flights-agent',
  name: 'Flights Agent',
  description: 'Handles flight research by calling the searchFlights tool and returning the flights comparison card data.',
  instructions: `You are a flights specialist inside a multi-agent travel planner.

Only act when the user explicitly asks for flights, booking, or airfare.
When they do, call the \`searchFlights\` tool.
Do not rewrite the flight table because the UI already renders the card.
After the tool finishes, respond with one short sentence at most.`,
  model: models.research,
  tools: () => ({
    searchFlights: searchFlightsTool,
  }),
});

export async function runFlights(params: {
  destination: string;
  origin?: string;
  dates?: { from: string; to: string };
  travelers?: number;
}): Promise<FlightsAgentOutput> {
  const origin = params.origin ?? 'New York';
  const datesCtx = params.dates ? ` departing ${params.dates.from}` : '';
  const travelersCtx = params.travelers ? ` for ${params.travelers} traveller${params.travelers > 1 ? 's' : ''}` : '';

  const result = await generateText({
    model: models.research,
    output: Output.object({ schema: flightsSchema }),
    prompt: `Research typical flights from ${origin} to ${params.destination}${datesCtx}${travelersCtx}.

Return realistic flight options based on current market:
- route: e.g. "JFK → NRT"
- options: up to 4 realistic flight options with:
  - airline: real airline name
  - price: realistic one-way price in USD per person
  - duration: e.g. "14h 30m"
  - stops: 0 for direct, 1+ for connections
  - departTime: e.g. "08:30"
  - arrivalTime: e.g. "22:45 +1"
  - class: economy, premium, or business
- cheapestTip: one practical tip for finding cheaper flights
- bestMonths: best months to visit for good prices + weather combo`,
  });
  return result.output;
}

export const searchFlightsTool = createTool({
  id: 'searchFlights',
  description: 'Search for typical flight options and prices. Only call when the user explicitly asks about flights or booking.',
  inputSchema: z.object({
    destination: z.string().describe('The destination city or country'),
    origin: z.string().optional().describe('Departure city (default New York)'),
    dates: z.object({ from: z.string(), to: z.string() }).optional().describe('Travel dates'),
    travelers: z.number().optional().describe('Number of travellers'),
  }),
  execute: async (input) => {
    return runFlights({
      destination: input.destination,
      origin: input.origin,
      dates: input.dates,
      travelers: input.travelers,
    });
  },
});
