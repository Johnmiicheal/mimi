import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import { models } from '@/lib/providers/openrouter';

export const visaSchema = z.object({
  required: z.boolean(),
  type: z.string(),
  processingDays: z.number(),
  cost: z.number(),
  maxStay: z.number(),
  requirements: z.array(z.string()).max(6),
  applyUrl: z.string().optional(),
});

export type VisaAgentOutput = z.infer<typeof visaSchema>;

export const visaAgent = new Agent({
  id: 'visa-agent',
  name: 'Visa Agent',
  description: 'Handles visa eligibility and entry rules by calling the checkVisa tool and returning the visa card data.',
  instructions: `You are a visa specialist inside a multi-agent travel planner.

Only act when both nationality and destination are known.
When they are known, call the \`checkVisa\` tool.
Do not restate the checklist in full because the UI already renders the card.
After the tool finishes, respond with one short sentence at most.`,
  model: models.research,
  tools: () => ({
    checkVisa: checkVisaTool,
  }),
});

export async function runVisa(params: { destination: string; nationality?: string; tripDuration?: number }): Promise<VisaAgentOutput> {
  const nationality = params.nationality ?? 'US';
  const result = await generateText({
    model: models.research,
    output: Output.object({ schema: visaSchema }),
    prompt: `Research visa requirements for a ${nationality} passport holder traveling to ${params.destination}${params.tripDuration ? ` for ${params.tripDuration} days` : ''}.

Return accurate, current information:
- required: whether a visa is needed
- type: e.g. "Visa-free", "eVisa", "Visa on arrival", "Tourist visa required"
- processingDays: typical processing time (0 if visa-free or on arrival)
- cost: fee in USD (0 if free)
- maxStay: maximum days allowed per visit
- requirements: list of required documents/conditions
- applyUrl: official government application URL if applicable`,
  });
  return result.output as VisaAgentOutput;
}

export const checkVisaTool = createTool({
  id: 'checkVisa',
  description: "Check visa requirements. Only call when the user's nationality is explicitly known.",
  inputSchema: z.object({
    destination: z.string().describe('The travel destination'),
    nationality: z.string().describe('Two-letter passport country code (e.g. US, GB, AU)'),
    tripDuration: z.number().optional().describe('Trip length in days'),
  }),
  execute: async (input) => {
    return runVisa({ destination: input.destination, nationality: input.nationality, tripDuration: input.tripDuration });
  },
});
