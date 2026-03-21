import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import { models } from '@/lib/providers/openrouter';

export const shoppingSchema = z.object({
  destination: z.string(),
  weatherNote: z.string(),
  categories: z.array(z.object({
    name: z.string(),
    items: z.array(z.object({
      name: z.string(),
      essential: z.boolean(),
    })).max(8),
  })).max(5),
});

export type ShoppingAgentOutput = z.infer<typeof shoppingSchema>;

export const shoppingAgent = new Agent({
  id: 'shopping-agent',
  name: 'Shopping & Packing Agent',
  description: 'Handles packing recommendations by calling the getPackingList tool and returning the packing card data.',
  instructions: `You are a packing specialist inside a multi-agent travel planner.

When a confirmed destination is available, call the \`getPackingList\` tool.
Use weather, activities, and trip duration when available.
Do not rewrite the packing list in prose because the UI already renders the card.
After the tool finishes, respond with one short sentence at most.`,
  model: models.fast,
  tools: () => ({
    getPackingList: getPackingListTool,
  }),
});

export async function runShopping(params: {
  destination: string;
  weather?: string;
  activities?: string[];
  tripDuration?: number;
}): Promise<ShoppingAgentOutput> {
  const weatherCtx = params.weather ? `Weather: ${params.weather}.` : '';
  const activitiesCtx = params.activities?.length ? `Activities: ${params.activities.join(', ')}.` : '';
  const durationCtx = params.tripDuration ? `Trip duration: ${params.tripDuration} days.` : '';

  const result = await generateText({
    model: models.fast,
    output: Output.object({ schema: shoppingSchema }),
    prompt: `Create a smart packing list for a trip to ${params.destination}. ${weatherCtx} ${activitiesCtx} ${durationCtx}

Consider local culture, climate, and planned activities. Organise into:
- Clothing (weather-appropriate, culturally respectful)
- Tech (adapters, devices)
- Documents (passport, insurance, tickets)
- Toiletries (travel-sized essentials)
- Accessories (day bag, etc.)

Mark items as essential (true) if they're critical — everything else is nice-to-have.
weatherNote: one sentence tip about what to expect clothing-wise (e.g. "Pack light layers — Tokyo spring is mild but evenings get cool").`,
  });
  return result.output;
}

export const getPackingListTool = createTool({
  id: 'getPackingList',
  description: 'Generate a smart packing list based on destination and weather. Call after getWeather or any time a destination is confirmed.',
  inputSchema: z.object({
    destination: z.string().describe('The travel destination'),
    weather: z.string().optional().describe('Brief weather summary (e.g. "warm and sunny, 25°C")'),
    activities: z.array(z.string()).optional().describe('Planned activities'),
    tripDuration: z.number().optional().describe('Trip length in days'),
  }),
  execute: async (input) => {
    return runShopping({
      destination: input.destination,
      weather: input.weather,
      activities: input.activities,
      tripDuration: input.tripDuration,
    });
  },
});
