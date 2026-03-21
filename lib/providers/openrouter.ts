import { createOpenAI } from '@ai-sdk/openai';

export const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export const models = {
  coordinator: openrouter('anthropic/claude-sonnet-4'),
  research: openrouter('perplexity/sonar-pro'),
  fast: openrouter('google/gemini-2.5-flash'),
};
