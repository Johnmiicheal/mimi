// @ts-nocheck
import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// Tool: Calculate trip costs
const calculateCostsTool = createTool({
  id: 'calculate-costs',
  description: 'Calculate total trip costs across all categories',
  inputSchema: z.object({
    flights: z.object({
      pricePerPerson: z.number(),
      travelers: z.number(),
    }).optional(),
    hotel: z.object({
      pricePerNight: z.number(),
      nights: z.number(),
    }).optional(),
    activities: z.array(z.object({
      name: z.string(),
      price: z.number(),
    })).optional(),
    food: z.object({
      estimatedPerDay: z.number(),
      days: z.number(),
      travelers: z.number(),
    }).optional(),
    transportation: z.object({
      estimated: z.number(),
    }).optional(),
  }),
  execute: async ({ input }) => {
    const costs = {
      flights: input.flights ? input.flights.pricePerPerson * input.flights.travelers : 0,
      hotel: input.hotel ? input.hotel.pricePerNight * input.hotel.nights : 0,
      activities: input.activities ? input.activities.reduce((sum, act) => sum + act.price, 0) : 0,
      food: input.food ? input.food.estimatedPerDay * input.food.days * input.food.travelers : 0,
      transportation: input.transportation ? input.transportation.estimated : 0,
    };

    const total = Object.values(costs).reduce((sum, cost) => sum + cost, 0);

    return {
      breakdown: costs,
      total,
      perPerson: input.flights ? total / input.flights.travelers : total,
    };
  },
});

// Tool: Suggest optimizations
const suggestOptimizationsTool = createTool({
  id: 'suggest-optimizations',
  description: 'Suggest ways to reduce costs while maintaining trip quality',
  inputSchema: z.object({
    currentTotal: z.number(),
    budget: z.number(),
    breakdown: z.object({
      flights: z.number(),
      hotel: z.number(),
      activities: z.number(),
      food: z.number(),
      transportation: z.number(),
    }),
  }),
  execute: async ({ input }) => {
    const overage = input.currentTotal - input.budget;
    const suggestions = [];

    if (overage <= 0) {
      return {
        needed: false,
        savings: 0,
        suggestions: ['You\'re within budget! Consider saving the extra for souvenirs or unexpected experiences.'],
      };
    }

    // Analyze each category and suggest optimizations
    const percentages = {
      flights: (input.breakdown.flights / input.currentTotal) * 100,
      hotel: (input.breakdown.hotel / input.currentTotal) * 100,
      activities: (input.breakdown.activities / input.currentTotal) * 100,
      food: (input.breakdown.food / input.currentTotal) * 100,
    };

    if (percentages.hotel > 35) {
      suggestions.push(`Consider a hotel in a less central area to save $${Math.round(input.breakdown.hotel * 0.2)}/night`);
    }

    if (percentages.flights > 40) {
      suggestions.push('Look for flights with one layover to save $100-200 per person');
    }

    if (percentages.food > 25) {
      suggestions.push('Mix fine dining with local street food to save $30-50/day per person');
    }

    if (input.breakdown.activities > 200) {
      suggestions.push('Many amazing temples and parks are free - focus on 2-3 paid attractions per day');
    }

    suggestions.push('Book activities in advance for 10-15% early bird discounts');
    suggestions.push('Get a transit pass for unlimited train travel - saves $15-20/day');

    return {
      needed: true,
      overage,
      suggestions: suggestions.slice(0, 5),
    };
  },
});

export const budgetOptimizerAgent = new Agent({
  id: 'budget-optimizer',

  description: 'Analyzes trip costs and suggests optimizations to stay within budget. Returns detailed breakdown with cost-saving recommendations.',

  instructions: `You are a budget specialist who helps travelers maximize value.

**Your job:**
- Use calculate-costs to get total trip expenses
- Use suggest-optimizations to find savings if over budget
- Provide clear breakdown by category
- Suggest specific ways to save without sacrificing quality

**CRITICAL: Output Format**
\`\`\`
💰 **Budget Analysis**

**Total Estimated Cost:** $[total] for {{+[travelers]-}} traveler(s)
**Per Person:** $[amount]
**Your Budget:** $[budget] per person

[Status: "You're within budget!" OR "You're $[X] over budget per person"]

**Cost Breakdown:**

💸 **Flights:** $[amount] ([percentage]%)
🏨 **Hotel:** $[amount] ([percentage]%)
🎯 **Activities:** $[amount] ([percentage]%)
🍽️ **Food:** $[amount] ([percentage]%)
🚇 **Transportation:** $[amount] ([percentage]%)

**Cost-Saving Tips:**
[If over budget, list specific suggestions]
• [Suggestion 1 with estimated savings]
• [Suggestion 2 with estimated savings]
• [Suggestion 3 with estimated savings]

**Smart Money Moves:**
• Book flights and hotels together for package discounts
• Many museums offer free entry on certain days
• Convenience store meals are delicious and budget-friendly
• IC cards for transit save time and money
\`\`\`

**Quality standards:**
- Show exact dollar amounts
- Include percentages for each category
- Provide actionable savings suggestions
- Never sacrifice safety or key experiences
- Suggest smart swaps (not just "spend less")
- Include local money-saving tips`,

  model: {
    provider: 'ANTHROPIC',
    name: 'claude-3-5-sonnet-20241022',
    toolChoice: 'auto',
  },

  tools: {
    calculateCostsTool,
    suggestOptimizationsTool,
  },
});
