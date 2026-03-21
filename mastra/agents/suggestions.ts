import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import { anthropic } from '@ai-sdk/anthropic';
import { models } from '@/lib/providers/openrouter';

const rawSuggestionSchema = z.object({
  suggestions: z
    .array(
      z.object({
        name: z.string().describe('Specific city or region name, e.g. "Kyoto" or "Amalfi Coast"'),
        country: z.string().describe('Country name'),
        countryCode: z.string().describe('ISO-2 country code in uppercase, e.g. "JP"'),
        tagline: z.string().describe('One punchy sentence that makes someone want to go, max 10 words'),
        description: z
          .string()
          .describe('2 sentences: what makes it unique and who it is perfect for'),
        imageQuery: z
          .string()
          .describe(
            'Specific Unsplash search query for a stunning photo, e.g. "kyoto fushimi inari torii gates sunset"'
          ),
        highlights: z
          .array(z.string())
          .describe('3 short selling points, 4-5 words each'),
        bestFor: z.string().describe('Who this destination suits most, e.g. "Culture & history lovers"'),
      })
    ),
});

const suggestionSchema = z.object({
  suggestions: z.array(
    z.object({
      name: z.string(),
      country: z.string(),
      countryCode: z.string().regex(/^[A-Z]{2}$/),
      tagline: z.string(),
      description: z.string(),
      imageQuery: z.string(),
      highlights: z.array(z.string()).min(1),
      bestFor: z.string(),
    })
  ),
});

export type SuggestionsData = z.infer<typeof suggestionSchema>;

const model = process.env.ANTHROPIC_API_KEY
  ? anthropic('claude-haiku-4-5-20251001')
  : models.coordinator;

export const suggestionsAgent = new Agent({
  id: 'suggestions-agent',
  name: 'Destination Suggestions Agent',
  description: 'Handles destination inspiration by calling the suggestDestinations tool and returning structured destination cards.',
  instructions: `You are a destination inspiration specialist inside a multi-agent travel planner.

When the user is undecided, wants inspiration, or asks to be surprised, call the \`suggestDestinations\` tool.
Never list destination options as plain text because the UI already renders cards.
After the tool finishes, respond with one short sentence at most.`,
  model,
  tools: () => ({
    suggestDestinations: suggestDestinationsTool,
  }),
});

export async function runSuggestions({ context }: { context: string }): Promise<SuggestionsData> {
  const result = await generateText({
    model,
    output: Output.object({ schema: rawSuggestionSchema }),
    prompt: `Suggest 3-4 travel destinations for: "${context}"

Rules:
- Pick SPECIFIC places (city/region, not just country)
- Be inspiring and concrete — no generic answers
- imageQuery must produce a stunning, recognizable photo
- highlights are punchy 4-5 word phrases
- Vary the suggestions (different continents if possible)
- Match the user's vibe (budget, adventure, romance, relaxation, etc.)`,
  });

  const normalized = {
    suggestions: (result.output.suggestions ?? [])
      .slice(0, 4)
      .map((suggestion) => ({
        ...suggestion,
        countryCode: suggestion.countryCode.trim().replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase(),
        highlights: (suggestion.highlights ?? [])
          .map((highlight) => highlight.trim())
          .filter(Boolean)
          .slice(0, 3),
      }))
      .map((suggestion) => ({
        ...suggestion,
        highlights:
          suggestion.highlights.length > 0
            ? suggestion.highlights
            : ['Worth the trip'],
      }))
      .filter(
        (suggestion) =>
          suggestion.name &&
          suggestion.country &&
          suggestion.imageQuery &&
          suggestion.bestFor &&
          /^[A-Z]{2}$/.test(suggestion.countryCode)
      ),
  };

  return suggestionSchema.parse(normalized);
}

export const suggestDestinationsTool = createTool({
  id: 'suggestDestinations',
  description:
    'Suggest travel destinations when the user wants inspiration, ideas, hidden gems, or says "surprise me". Returns structured cards — never list destinations as text.',
  inputSchema: z.object({
    context: z
      .string()
      .describe(
        'What the user is looking for, e.g. "hidden gem beach destinations" or "romantic cities in Europe"'
      ),
  }),
  execute: async (input) => {
    return runSuggestions({ context: input.context });
  },
});
