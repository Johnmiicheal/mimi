// @ts-nocheck
import { Agent } from '@mastra/core/agent';
import { createScorer } from '@mastra/core/evals';
import { flightScoutAgent } from './flight-scout';
import { hotelHunterAgent } from './hotel-hunter';
import { activityFinderAgent } from './activity-finder';
import { foodExpertAgent } from './food-expert';
import { budgetOptimizerAgent } from './budget-optimizer';

// Task completion scorer - validates if plan is complete
const planCompletenessScorer = createScorer({
  id: 'plan-complete',
  name: 'Travel Plan Completeness',
}).generateScore(async (context) => {
  const output = (context.run.output || '').toString();

  // Check for all required components
  const hasFlights = /flight|✈️|airline/i.test(output);
  const hasHotel = /hotel|🏨|accommodation/i.test(output);
  const hasActivities = /activit|🗓️|itinerary/i.test(output);
  const hasBudget = /budget|💰|\$\d+/i.test(output);

  const components = [hasFlights, hasHotel, hasActivities, hasBudget];
  const completionRate = components.filter(Boolean).length / components.length;

  return completionRate;
});

export const travelCoordinatorAgent = new Agent({
  id: 'travel-coordinator',

  instructions: `You are a travel planning coordinator who orchestrates specialized agents to create perfect trips.

**Your role:**
- Coordinate with specialized agents (Flight Scout, Hotel Hunter, Activity Finder, Food Expert, Budget Optimizer)
- Make smart delegation decisions based on user needs
- Synthesize results into a cohesive travel plan
- Use inline UI syntax to make plans interactive
- Keep everything within budget

**Available Agents:**
- **flight-scout**: Searches flights, compares options by price/duration/layovers
- **hotel-hunter**: Finds hotels optimally located near activities
- **activity-finder**: Discovers activities, creates daily schedules
- **food-expert**: Recommends restaurants matching dietary needs
- **budget-optimizer**: Calculates costs, suggests optimizations

**Delegation Strategy:**
1. Start with **activity-finder** to establish what user will do (activities determine hotel location)
2. Then delegate to **hotel-hunter** (now knows where activities are)
3. Then delegate to **flight-scout** (timing is clear)
4. Then delegate to **food-expert** (for dining recommendations)
5. Finally **budget-optimizer** (to ensure within budget)

**CRITICAL: Use inline UI syntax**
- {{+[travelers]-}} for number steppers
- {{+[$budget]-}} for price steppers
- {{::date-picker[departure]}} for date pickers
- {{::country[destination]}} for country pickers

**Output Format:**
\`\`\`
# ✨ Your Perfect [Destination] Adventure

I've coordinated with my specialist team to create an amazing {{+[nights]-}} night trip to {{::country[destination]}} for {{+[travelers]-}} travelers!

**Budget:** {{+[$budget]-}} per person

[Present each agent's results in organized sections:]

## ✈️ Flights
[Flight Scout's recommendations]

## 🏨 Hotel
[Hotel Hunter's recommendations]

## 🗓️ Your Itinerary
[Activity Finder's daily schedule]

## 🍽️ Where to Eat
[Food Expert's restaurant picks]

## 💰 Budget Summary
[Budget Optimizer's breakdown]

**Ready to book?** Everything above is interactive - click any {{+[control]-}} to adjust!
\`\`\`

**Quality Standards:**
- Delegate to appropriate agents (don't try to answer everything yourself)
- Wait for agent results before proceeding
- Synthesize results into coherent narrative
- Ensure budget compliance
- Be enthusiastic but concise`,

  model: {
    provider: 'ANTHROPIC',
    name: 'claude-3-5-sonnet-20241022',
    toolChoice: 'auto',
  },

  // Register all specialist agents
  agents: {
    flightScoutAgent,
    hotelHunterAgent,
    activityFinderAgent,
    foodExpertAgent,
    budgetOptimizerAgent,
  },

  // Default options for delegation
  defaultOptions: {
    maxSteps: 15, // Allow enough steps for multi-agent coordination

    // Delegation hooks
    delegation: {
      // Before delegating to a subagent
      onDelegationStart: async (context) => {
        console.log(`[Coordinator] → Delegating to ${context.primitiveId}`);
        console.log(`[Coordinator] Iteration ${context.iteration}`);

        // Prevent infinite loops - max 2 calls per agent
        const agentCallCounts = new Map<string, number>();
        const currentCount = agentCallCounts.get(context.primitiveId) || 0;
        agentCallCounts.set(context.primitiveId, currentCount + 1);

        if (currentCount >= 2) {
          return {
            proceed: false,
            rejectionReason: `Agent ${context.primitiveId} has been called too many times. Synthesize current findings.`,
          };
        }

        // Add context to delegation
        const modifiedPrompt = `${context.prompt}\n\nIMPORTANT: Return results in the specified format with inline UI syntax.`;

        return {
          proceed: true,
          modifiedPrompt,
          modifiedMaxSteps: 5, // Each subagent gets max 5 steps
        };
      },

      // After delegation completes
      onDelegationComplete: async (context) => {
        console.log(`[Coordinator] ✓ Completed: ${context.primitiveId}`);

        if (context.error) {
          console.error(`[Coordinator] Error from ${context.primitiveId}:`, context.error);
          return {
            feedback: `The ${context.primitiveId} encountered an error. Please provide a simplified response with available information.`,
          };
        }

        return {};
      },

      // Filter messages to reduce context size
      messageFilter: ({ messages }) => {
        // Keep only last 20 messages to save tokens
        return messages.slice(-20);
      },
    },

    // Monitor iteration progress
    onIterationComplete: async (context) => {
      console.log(`[Coordinator] Iteration ${context.iteration}/${context.maxIterations}`);
      console.log(`[Coordinator] Finish reason: ${context.finishReason}`);

      // Check if we have all required components
      const hasFlights = /flight|✈️/i.test(context.text);
      const hasHotel = /hotel|🏨/i.test(context.text);
      const hasActivities = /activit|🗓️/i.test(context.text);

      if (!hasFlights || !hasHotel || !hasActivities) {
        const missing = [];
        if (!hasFlights) missing.push('flights');
        if (!hasHotel) missing.push('hotel');
        if (!hasActivities) missing.push('activities');

        console.log(`[Coordinator] Missing components: ${missing.join(', ')}`);

        return {
          continue: true,
          feedback: `Plan incomplete. Still need: ${missing.join(', ')}. Delegate to appropriate agents.`,
        };
      }

      // Plan looks complete
      return { continue: context.finishReason !== 'stop' };
    },

    // Task completion validation
    isTaskComplete: {
      scorers: [planCompletenessScorer],
      strategy: 'all',
      onComplete: async (result) => {
        console.log('[Coordinator] Completion check:', {
          complete: result.complete,
          scores: result.scores,
        });
      },
    },
  },
});
