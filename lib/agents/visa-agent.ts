import type { VisaData } from '@/components/agent-ui/VisaCard';
import { generateObject } from 'ai';
import { z } from 'zod';
import { models } from '@/lib/providers/openrouter';

interface TripParams {
  destination: string;
  nationality?: string;
  tripDuration?: number;
}

const visaSchema = z.object({
  required: z.boolean(),
  type: z.string(),
  processingDays: z.number(),
  cost: z.number(),
  maxStay: z.number(),
  requirements: z.array(z.string()).max(6),
  applyUrl: z.string().optional(),
});

export async function runVisaAgent(params: TripParams): Promise<VisaData> {
  const nationality = params.nationality ?? 'US';
  const { object } = await generateObject({
    model: models.research,
    schema: visaSchema,
    prompt: `Research visa requirements for a ${nationality} passport holder traveling to ${params.destination}${params.tripDuration ? ` for ${params.tripDuration} days` : ''}.

Return accurate, current information:
- required: whether a visa is needed (true/false)
- type: e.g. "Visa-free", "eVisa", "Visa on arrival", "Tourist visa required"
- processingDays: typical processing time in calendar days (0 if visa-free or on arrival)
- cost: fee in USD (0 if free)
- maxStay: maximum days allowed per visit
- requirements: list of required documents/conditions (passport validity, photos, etc.)
- applyUrl: official government application URL if applicable

Use accurate, current information from official government sources.`,
  });

  return object as VisaData;
}
