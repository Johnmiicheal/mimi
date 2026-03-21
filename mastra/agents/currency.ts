import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import { models } from '@/lib/providers/openrouter';
import type { CurrencyData } from '@/components/agent-ui/CurrencyCard';

const currencySchema = z.object({
  from: z.string().describe('Source currency code e.g. "USD"'),
  to: z.string().describe('Destination currency code e.g. "JPY"'),
  rate: z.number().describe('Exchange rate: 1 unit of "from" equals this many units of "to"'),
  trend: z.enum(['up', 'down', 'stable']).describe('30-day trend of the destination currency vs USD'),
  trendPct: z.number().describe('Percentage change over last 30 days, e.g. 2.4'),
  quickConversions: z
    .array(z.object({ usd: z.number(), local: z.number() }))
    .length(4)
    .describe('4 common conversion pairs, e.g. [{usd:10,local:...},{usd:50,...},...]'),
});

export const currencyAgent = new Agent({
  id: 'currency-agent',
  name: 'Currency Agent',
  description: 'Handles local currency and exchange-rate research by calling the getCurrency tool and returning the currency card data.',
  instructions: `You are a currency specialist inside a multi-agent travel planner.

When the trip is international or uses a non-home currency, call the \`getCurrency\` tool.
Do not duplicate the conversion table in text because the UI already renders the card.
After the tool finishes, respond with one short sentence at most.`,
  model: models.fast,
  tools: () => ({
    getCurrency: getCurrencyTool,
  }),
});

export async function runCurrency(params: { destination: string; baseCurrency?: string }): Promise<CurrencyData> {
  const base = params.baseCurrency ?? 'USD';
  const result = await generateText({
    model: models.fast,
    output: Output.object({ schema: currencySchema }),
    prompt: `Provide current exchange rate information for a traveller going to ${params.destination} with ${base}.

Return:
- from: "${base}"
- to: the local currency code used in ${params.destination}
- rate: current approximate exchange rate (1 ${base} = X local)
- trend: whether the local currency has been going "up", "down", or "stable" vs USD over the past 30 days
- trendPct: approximate % change over last 30 days
- quickConversions: 4 useful pairs — [{usd:10},{usd:50},{usd:100},{usd:500}] each with the local equivalent

Use realistic, current market rates.`,
  });
  return result.output as CurrencyData;
}

export const getCurrencyTool = createTool({
  id: 'getCurrency',
  description: 'Get live exchange rates for a destination. Call when the destination has a non-USD currency.',
  inputSchema: z.object({
    destination: z.string().describe('The travel destination city or country'),
    baseCurrency: z.string().optional().describe("The traveller's home currency (default USD)"),
  }),
  execute: async (input) => {
    return runCurrency({ destination: input.destination, baseCurrency: input.baseCurrency });
  },
});
