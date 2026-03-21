import { streamText, convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { models } from '@/lib/providers/openrouter';
import { runSafetyAgent } from '@/lib/agents/safety-agent';
import { runCurrencyAgent } from '@/lib/agents/currency-agent';
import { runWeatherAgent } from '@/lib/agents/weather-agent';
import { runVisaAgent } from '@/lib/agents/visa-agent';
import { runEventsAgent } from '@/lib/agents/local-events-agent';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface TripParams {
  destination: string;
  dates?: { from: string; to: string };
  travelers?: number;
  budget?: number;
}

function extractTripParams(messages: { parts?: { type: string; text?: string }[]; content?: string; role?: string }[]): TripParams {
  const allText = messages
    .map(m => m.parts?.find(p => p.type === 'text')?.text ?? m.content ?? '')
    .join(' ')
    .toLowerCase();

  // Destination extraction — simple keyword scan
  const destPatterns = [
    /\bto\s+([A-Za-z\s]{3,20}?)(?:\s+for|\s+in|\s*,|\s*\.)/i,
    /\bvisit\s+([A-Za-z\s]{3,20}?)(?:\s+for|\s+in|\s*,|\s*\.)/i,
    /\bin\s+([A-Za-z\s]{3,20}?)(?:\s+for|\s+in|\s*,|\s*\.)/i,
  ];

  let destination = 'the destination';
  for (const pat of destPatterns) {
    const m = allText.match(pat);
    if (m?.[1]) {
      destination = m[1].trim();
      break;
    }
  }

  // Date extraction
  const dateMatch = allText.match(/(\w+ \d+(?:st|nd|rd|th)?)\s*(?:to|-)\s*(\w+ \d+(?:st|nd|rd|th)?)/i);
  const dates = dateMatch
    ? { from: dateMatch[1], to: dateMatch[2] }
    : undefined;

  // Travelers
  const travelersMatch = allText.match(/(\d+)\s*(?:people|person|travelers|travellers)/i);
  const travelers = travelersMatch ? parseInt(travelersMatch[1]) : undefined;

  // Budget
  const budgetMatch = allText.match(/\$(\d+(?:,\d{3})*)/);
  const budget = budgetMatch ? parseInt(budgetMatch[1].replace(',', '')) : undefined;

  return { destination, dates, travelers, budget };
}

const SYSTEM_PROMPT = `You are an enthusiastic travel planning coordinator who creates amazing, personalised trips. You respond with rich, well-formatted markdown and embed interactive inline UI controls directly inside your messages so the user can tweak their trip in real time.

---

## Inline UI Syntax Reference

Embed these controls directly in your prose — they render as interactive widgets:

| Control | Syntax | Example |
|---|---|---|
| Number stepper | \`{{+[id]-}}\` | \`{{+[travelers]-}}\` |
| Price stepper | \`{{+[$id]-}}\` | \`{{+[$budget]-}}\` |
| Date picker | \`{{::date-picker[id]}}\` | \`{{::date-picker[departure]}}\` |
| Country picker | \`{{::country[id]}}\` | \`{{::country[destination]}}\` |
| Toggle chip | \`{{[x] Label}}\` / \`{{[ ] Label}}\` | \`{{[x] Cultural sites}}\` |
| Slider | \`{{::slider[id|min:N|max:N]}}\` | \`{{::slider[nights|min:1|max:30]}}\` |
| Select | \`{{::select[id|opt1,opt2,opt3]}}\` | \`{{::select[pace|relaxed,moderate,packed]}}\` |
| Voting buttons | \`{{::vote[id|up:N|down:N]}}\` | \`{{::vote[activity1|up:3|down:1]}}\` |

---

## Response Guidelines

- **Always** use inline UI controls so users can adjust their preferences without typing
- Use **markdown formatting**: headers (##), bold (**text**), bullet lists, and horizontal rules
- Be warm, enthusiastic, and specific — mention real places, neighbourhoods, and experiences
- Group preferences logically: basics first (destination, dates, people, budget), then interests
- After collecting preferences, outline what you'll plan (flights, hotels, activities, food)

## Itinerary Format

When presenting a detailed day-by-day itinerary, use this exact format so it renders as an interactive Kanban board:

### Day 1: Arrival & First Impressions

- **Morning** – Activity description with specific place names
- **Afternoon** – Activity description with specific place names
- **Evening** – Activity description with restaurant/bar recommendations

### Day 2: Theme Title

- **Morning** – ...
- **Afternoon** – ...
- **Evening** – ...

(repeat for each day)

---

## Response Structure

When a user asks to plan a trip, follow this structure:

### 1. Acknowledge their request with excitement

### 2. Gather preferences with inline controls

## Let's plan your trip! ✈️

**Destination:** {{::country[destination]}}
**Departure date:** {{::date-picker[departure]}}
**Return date:** {{::date-picker[return]}}
**Travellers:** {{+[travelers]-}} people
**Budget per person:** {{+[$budget]-}}

---

### Trip pace
{{::select[pace|relaxed,moderate,packed]}}

### Interests (toggle what appeals to you)
{{[x] Culture & history}} {{[x] Food & dining}} {{[ ] Adventure sports}} {{[x] Nature & parks}} {{[ ] Nightlife}} {{[x] Shopping}} {{[ ] Art & museums}}

### 3. Confirm what you'll arrange next

---

Always embed controls inline with your text so the message feels conversational, not like a form.`;

export async function POST(req: Request) {
  const { messages } = await req.json();

  console.log('[API] Received request with messages:', messages.length);

  const params = extractTripParams(messages);
  const hasOpenRouter = !!process.env.OPENROUTER_API_KEY;
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      // Run all agents in parallel (only when we have OpenRouter key)
      const agentPromises: Promise<void>[] = [];

      if (hasOpenRouter) {
        agentPromises.push(
          runSafetyAgent(params)
            .then(data => writer.write({ type: 'data-agent-safety', data }))
            .catch(err => console.error('[Agent] safety error:', err))
        );

        agentPromises.push(
          runCurrencyAgent(params)
            .then(data => writer.write({ type: 'data-agent-currency', data }))
            .catch(err => console.error('[Agent] currency error:', err))
        );

        agentPromises.push(
          runWeatherAgent(params)
            .then(data => writer.write({ type: 'data-agent-weather', data }))
            .catch(err => console.error('[Agent] weather error:', err))
        );

        agentPromises.push(
          runVisaAgent(params)
            .then(data => writer.write({ type: 'data-agent-visa', data }))
            .catch(err => console.error('[Agent] visa error:', err))
        );

        agentPromises.push(
          runEventsAgent(params)
            .then(data => writer.write({ type: 'data-agent-events', data }))
            .catch(err => console.error('[Agent] events error:', err))
        );
      } else if (params.destination !== 'the destination') {
        // Weather works without any API key
        agentPromises.push(
          runWeatherAgent(params)
            .then(data => writer.write({ type: 'data-agent-weather', data }))
            .catch(err => console.error('[Agent] weather error:', err))
        );

        agentPromises.push(
          runCurrencyAgent(params)
            .then(data => writer.write({ type: 'data-agent-currency', data }))
            .catch(err => console.error('[Agent] currency error:', err))
        );
      }

      // Stream coordinator text
      const coordinatorModel = hasAnthropic
        ? anthropic('claude-sonnet-4-20250514')
        : hasOpenRouter
          ? models.coordinator
          : anthropic('claude-sonnet-4-20250514');

      const coreMessages = await convertToModelMessages(messages);

      const result = streamText({
        model: coordinatorModel,
        messages: coreMessages,
        system: SYSTEM_PROMPT,
      });

      writer.merge(result.toUIMessageStream());

      await Promise.all(agentPromises);
    },
    onError: (error) => {
      console.error('[API] Stream error:', error);
      return 'Sorry, I ran into an issue while planning your trip. Please try again.';
    },
  });

  return createUIMessageStreamResponse({ stream });
}
