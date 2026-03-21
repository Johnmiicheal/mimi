import { createOpenAI } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';

export const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export const models = {
  agent: process.env.ANTHROPIC_API_KEY
    ? anthropic('claude-sonnet-4-20250514')
    : openrouter('openai/gpt-4o-mini'),
  coordinator: openrouter('anthropic/claude-sonnet-4'),
  research: openrouter('perplexity/sonar-pro'),
  fast: openrouter('openai/gpt-4o-mini'),
};
