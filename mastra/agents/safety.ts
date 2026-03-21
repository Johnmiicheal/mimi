import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import { models } from '@/lib/providers/openrouter';

export const safetySchema = z.object({
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  level: z.enum(['high', 'medium', 'low']),
  advisories: z.array(z.string()).max(5),
  headlines: z.array(z.object({ title: z.string(), date: z.string() })).max(3),
  lastUpdated: z.string(),
});

export type SafetyAgentOutput = z.infer<typeof safetySchema>;

export const safetyAgent = new Agent({
  id: 'safety-agent',
  name: 'Safety Agent',
  description: 'Handles destination safety checks by calling the checkSafety tool and returning the safety card data.',
  instructions: `You are a travel safety specialist inside a multi-agent travel planner.

When a confirmed destination is available, always call the \`checkSafety\` tool.
Do not restate the tool result in detail because the UI already renders the card.
After the tool finishes, respond with one short sentence at most.`,
  model: models.agent,
  tools: () => ({
    checkSafety: checkSafetyTool,
  }),
});

export async function runSafety(params: { destination: string; dates?: { from: string; to: string } }): Promise<SafetyAgentOutput> {
  const result = await generateText({
    model: models.research,
    output: Output.object({ schema: safetySchema }),
    prompt: `Research the current travel safety situation for ${params.destination}${params.dates ? ` around ${params.dates.from} to ${params.dates.to}` : ''}.

Return:
- rating: 1 (avoid) to 5 (very safe)
- level: "high" (dangerous), "medium" (caution), or "low" (safe)
- advisories: up to 5 short advisory strings
- headlines: up to 3 recent news items relevant to safety/travel with their dates
- lastUpdated: today's date in "MMM D, YYYY" format

Base this on real, current safety conditions, government travel advisories, and recent news.`,
  });
  return result.output as SafetyAgentOutput;
}

export const checkSafetyTool = createTool({
  id: 'checkSafety',
  description: 'Check current travel safety conditions, advisories, and recent news for a destination. Call whenever a real destination is mentioned.',
  inputSchema: z.object({
    destination: z.string().describe('The travel destination city or country'),
    dates: z.object({ from: z.string(), to: z.string() }).optional().describe('Travel dates if known'),
  }),
  execute: async (input) => {
    return runSafety({ destination: input.destination, dates: input.dates });
  },
});
