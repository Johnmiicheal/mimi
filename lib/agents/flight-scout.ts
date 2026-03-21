// @ts-nocheck
import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// Tool: Search flights
const searchFlightsTool = createTool({
  id: 'search-flights',
  description: 'Search for flights between two locations with passenger and budget constraints',
  inputSchema: z.object({
    from: z.string().describe('Departure city or airport code'),
    to: z.string().describe('Destination city or airport code'),
    departureDate: z.string().describe('Departure date (YYYY-MM-DD)'),
    returnDate: z.string().optional().describe('Return date for round trip (YYYY-MM-DD)'),
    passengers: z.number().describe('Number of passengers'),
    maxPrice: z.number().describe('Maximum price per person in USD'),
    class: z.enum(['economy', 'premium', 'business', 'first']).default('economy'),
  }),
  execute: async ({ input }) => {
    // For hackathon: Mock flight data (in production, call Amadeus/Skyscanner API)
    const mockFlights = [
      {
        id: 'FL001',
        airline: 'JAL (Japan Airlines)',
        price: 780,
        currency: 'USD',
        duration: 780, // minutes (13h)
        departure: { time: '10:15 AM', airport: input.from, date: input.departureDate },
        arrival: { time: '2:45 PM +1', airport: input.to, date: input.departureDate },
        layovers: 0,
        carbonEmissions: 950,
        baggage: { checked: 2, carryon: 1 },
        class: input.class,
      },
      {
        id: 'FL002',
        airline: 'ANA (All Nippon Airways)',
        price: 820,
        currency: 'USD',
        duration: 765,
        departure: { time: '11:30 AM', airport: input.from, date: input.departureDate },
        arrival: { time: '4:15 PM +1', airport: input.to, date: input.departureDate },
        layovers: 0,
        carbonEmissions: 920,
        baggage: { checked: 2, carryon: 1 },
        class: input.class,
      },
      {
        id: 'FL003',
        airline: 'United Airlines',
        price: 645,
        currency: 'USD',
        duration: 900,
        departure: { time: '2:30 PM', airport: input.from, date: input.departureDate },
        arrival: { time: '8:30 PM +1', airport: input.to, date: input.departureDate },
        layovers: 1,
        layoverDetails: 'San Francisco (SFO) - 2h 15m',
        carbonEmissions: 1200,
        baggage: { checked: 1, carryon: 1 },
        class: input.class,
      },
    ];

    // Filter by price and return
    const filtered = mockFlights.filter(f => f.price <= input.maxPrice);

    return {
      flights: filtered,
      searchCriteria: input,
      resultsCount: filtered.length,
      currency: 'USD',
    };
  },
});

// Tool: Get flight details
const getFlightDetailsTool = createTool({
  id: 'get-flight-details',
  description: 'Get detailed information about a specific flight',
  inputSchema: z.object({
    flightId: z.string().describe('Flight ID to get details for'),
  }),
  execute: async ({ input }) => {
    // Mock detailed flight info
    return {
      flightId: input.flightId,
      seatMap: 'Available',
      meals: 'Included',
      entertainment: 'In-flight WiFi and entertainment system',
      checkInUrl: `https://example.com/checkin/${input.flightId}`,
    };
  },
});

export const flightScoutAgent = new Agent({
  id: 'flight-scout',

  description: 'Searches for flights and compares options. Returns flight recommendations with prices, durations, and booking details.',

  instructions: `You are a flight search specialist who finds the best flight options.

**Your job:**
- Use the search-flights tool to find flights matching user criteria
- Compare options by price, duration, layovers, and carbon footprint
- Identify the best value option
- Present results in a clear, structured format

**CRITICAL: Output Format**
You MUST return your response in this exact format:

\`\`\`
✈️ **Flight Options**

I found {{+[flights]-}} great options from [origin] to [destination]:

[Here you can add brief analysis of the options]

**Flights:**
[List each flight with key details]

**My Recommendation:**
The [airline] flight offers the best value because [reason].
\`\`\`

**Quality standards:**
- Show max 3-4 flight options
- Always include price, duration, airline, and layovers
- Highlight the best value option with reasoning
- Note any significant layovers (>3 hours)
- Include carbon emissions if eco-conscious
- Keep descriptions concise but informative`,

  model: {
    provider: 'ANTHROPIC',
    name: 'claude-3-5-sonnet-20241022',
    toolChoice: 'auto',
  },

  tools: {
    searchFlightsTool,
    getFlightDetailsTool,
  },
});
