import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import { models } from '@/lib/providers/openrouter';
import type { WeatherData } from '@/components/agent-ui/WeatherCard';

const weatherSchema = z.object({
  destination: z.string(),
  unit: z.enum(['C', 'F']),
  days: z
    .array(
      z.object({
        date: z.string().describe('Short date label e.g. "Mar 25"'),
        label: z.string().describe('Day of week e.g. "Mon"'),
        icon: z.enum(['sun', 'cloud', 'rain', 'snow', 'storm', 'partly-cloudy']),
        high: z.number().describe('High temperature in the stated unit'),
        low: z.number().describe('Low temperature in the stated unit'),
        precipitation: z.number().describe('Precipitation chance 0-100'),
      })
    )
    .min(5)
    .max(7),
  packingTips: z.array(z.string()).max(3).describe('3 short weather-related packing tips'),
});

export const weatherAgent = new Agent({
  id: 'weather-agent',
  name: 'Weather Agent',
  description: 'Handles destination weather research by calling the getWeather tool and returning the weather card data.',
  instructions: `You are a travel weather specialist inside a multi-agent travel planner.

When a confirmed destination is available, always call the \`getWeather\` tool.
Do not rewrite the forecast as paragraphs because the UI already renders the card.
After the tool finishes, respond with one short sentence at most.`,
  model: models.fast,
  tools: () => ({
    getWeather: getWeatherTool,
  }),
});

export async function runWeather(params: {
  destination: string;
  dates?: { from: string; to: string };
}): Promise<WeatherData> {
  const dateCtx = params.dates ? ` around ${params.dates.from}` : ' for the upcoming week';
  const result = await generateText({
    model: models.fast,
    output: Output.object({ schema: weatherSchema }),
    prompt: `Provide a 5-7 day weather forecast for ${params.destination}${dateCtx}.

Return:
- destination: city/country name
- unit: "C" (use Celsius)
- days: 5-7 day forecast with date, label (Mon/Tue/etc), weather icon, high/low temps, precipitation %
- packingTips: 3 short, practical weather-related packing tips

Use realistic seasonal weather based on the location and time of year.`,
  });
  return result.output as WeatherData;
}

export const getWeatherTool = createTool({
  id: 'getWeather',
  description: 'Get weather forecast and climate info for a destination. Call whenever a real destination is mentioned.',
  inputSchema: z.object({
    destination: z.string().describe('The travel destination city or country'),
    dates: z.object({ from: z.string(), to: z.string() }).optional().describe('Travel dates if known'),
  }),
  execute: async (input) => {
    return runWeather({ destination: input.destination, dates: input.dates });
  },
});
