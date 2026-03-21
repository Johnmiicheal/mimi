import type { SafetyData } from '@/components/agent-ui/SafetyCard';
import { generateObject } from 'ai';
import { z } from 'zod';
import { models } from '@/lib/providers/openrouter';

interface TripParams {
  destination: string;
  dates?: { from: string; to: string };
}

const safetySchema = z.object({
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  level: z.enum(['high', 'medium', 'low']),
  advisories: z.array(z.string()).max(5),
  headlines: z.array(z.object({ title: z.string(), date: z.string() })).max(3),
  lastUpdated: z.string(),
});

export async function runSafetyAgent(params: TripParams): Promise<SafetyData> {
  const { object } = await generateObject({
    model: models.research,
    schema: safetySchema,
    prompt: `Research the current travel safety situation for ${params.destination}${params.dates ? ` around ${params.dates.from} to ${params.dates.to}` : ''}.

Return:
- rating: 1 (avoid) to 5 (very safe)
- level: "high" (dangerous), "medium" (caution), or "low" (safe)
- advisories: up to 5 short advisory strings (e.g. "Petty theft in tourist areas")
- headlines: up to 3 recent news items relevant to safety/travel with their dates
- lastUpdated: today's date in "MMM D, YYYY" format

Base this on real, current safety conditions, government travel advisories, and recent news.`,
  });

  return object as SafetyData;
}
