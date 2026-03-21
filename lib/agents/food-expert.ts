// @ts-nocheck
import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// Tool: Search restaurants
const searchRestaurantsTool = createTool({
  id: 'search-restaurants',
  description: 'Find restaurants matching cuisine preferences and dietary restrictions',
  inputSchema: z.object({
    destination: z.string().describe('City or area'),
    cuisines: z.array(z.string()).optional().describe('Preferred cuisines'),
    dietaryRestrictions: z.array(z.string()).optional().describe('Dietary restrictions (vegetarian, vegan, gluten-free, halal, kosher)'),
    priceLevel: z.enum(['budget', 'moderate', 'upscale', 'fine-dining']).optional(),
    nearLocation: z.object({
      lat: z.number(),
      lng: z.number(),
      name: z.string(),
    }).optional().describe('Search near this location'),
  }),
  execute: async ({ input }) => {
    // Mock restaurant data (in production, call Google Places/Yelp API)
    const mockRestaurants = [
      {
        id: 'REST001',
        name: 'Sushi Dai',
        cuisine: 'Japanese Sushi',
        description: 'Famous sushi restaurant in Tsukiji known for incredibly fresh fish and traditional preparation',
        rating: 4.8,
        reviews: 2341,
        priceLevel: 2,
        location: { name: 'Tsukiji, Chuo', distance: '0.2 km from Tsukiji Market' },
        hours: '5:00 AM - 1:00 PM',
        dietaryOptions: ['gluten-free'],
        specialties: ['Omakase Set', 'Tuna Nigiri', 'Sea Urchin'],
        bookingUrl: 'https://example.com/sushi-dai',
      },
      {
        id: 'REST002',
        name: 'Afuri Ramen',
        cuisine: 'Japanese Ramen',
        description: 'Modern ramen shop famous for yuzu-infused broth and creative toppings',
        rating: 4.6,
        reviews: 1823,
        priceLevel: 1,
        location: { name: 'Harajuku, Shibuya', distance: '0.5 km from Meiji Shrine' },
        hours: '11:00 AM - 11:00 PM',
        dietaryOptions: ['vegetarian'],
        specialties: ['Yuzu Shio Ramen', 'Tsukemen', 'Vegan Ramen'],
      },
      {
        id: 'REST003',
        name: 'Narisawa',
        cuisine: 'Japanese Fine Dining',
        description: 'Two Michelin-starred restaurant pioneering innovative satoyama cuisine',
        rating: 4.9,
        reviews: 567,
        priceLevel: 4,
        location: { name: 'Minato, Tokyo', distance: '1.2 km from Tokyo Tower' },
        hours: '12:00 PM - 1:00 PM, 6:00 PM - 8:00 PM',
        dietaryOptions: ['vegetarian', 'vegan', 'gluten-free'],
        specialties: ['Tasting Menu', 'Seasonal Ingredients', 'Edible Landscapes'],
        bookingUrl: 'https://example.com/narisawa',
      },
      {
        id: 'REST004',
        name: 'Ain Soph Journey',
        cuisine: 'Vegan Japanese',
        description: 'Stylish vegan restaurant serving creative plant-based Japanese cuisine',
        rating: 4.7,
        reviews: 892,
        priceLevel: 2,
        location: { name: 'Shinjuku, Tokyo', distance: '0.3 km from Shinjuku Station' },
        hours: '11:30 AM - 10:00 PM',
        dietaryOptions: ['vegan', 'vegetarian', 'gluten-free'],
        specialties: ['Vegan Pancakes', 'Plant-based Burger', 'Tofu Steak'],
      },
      {
        id: 'REST005',
        name: 'Gonpachi Nishi-Azabu',
        cuisine: 'Japanese Izakaya',
        description: 'Traditional izakaya that inspired Kill Bill restaurant scene',
        rating: 4.5,
        reviews: 3421,
        priceLevel: 2,
        location: { name: 'Nishi-Azabu, Minato', distance: '2.1 km from Shibuya' },
        hours: '11:30 AM - 3:30 AM',
        dietaryOptions: ['vegetarian', 'gluten-free'],
        specialties: ['Yakitori', 'Tempura', 'Sake Selection'],
        bookingUrl: 'https://example.com/gonpachi',
      },
    ];

    let filtered = mockRestaurants;

    // Filter by dietary restrictions
    if (input.dietaryRestrictions && input.dietaryRestrictions.length > 0) {
      filtered = filtered.filter(r =>
        input.dietaryRestrictions!.some(diet => r.dietaryOptions?.includes(diet))
      );
    }

    // Filter by price level
    if (input.priceLevel) {
      const priceLevelMap = { 'budget': 1, 'moderate': 2, 'upscale': 3, 'fine-dining': 4 };
      const maxPrice = priceLevelMap[input.priceLevel];
      filtered = filtered.filter(r => r.priceLevel <= maxPrice);
    }

    return {
      restaurants: filtered,
      totalFound: filtered.length,
      filters: {
        dietaryRestrictions: input.dietaryRestrictions,
        priceLevel: input.priceLevel,
      },
    };
  },
});

export const foodExpertAgent = new Agent({
  id: 'food-expert',

  description: 'Recommends restaurants matching dietary needs and cuisine preferences. Returns curated dining options with ratings and booking information.',

  instructions: `You are a food specialist who finds amazing dining experiences.

**Your job:**
- Use search-restaurants tool to find restaurants
- Match dietary restrictions and preferences
- Include variety (casual to fine dining)
- Suggest restaurants near planned activities

**CRITICAL: Output Format**
\`\`\`
🍽️ **Restaurant Recommendations**

I've curated {{+[restaurants]-}} fantastic dining options in [destination]:

[Brief intro about food scene and variety]

**Restaurants:**

**[Restaurant Name]** ⭐ [rating] ([price level])
📍 [Location] - [Distance info]
🍜 Cuisine: [Type]
⏰ Hours: [Hours]
🌱 Dietary: [Options]
⭐ Must-try: [Specialties]
[Brief description and why it's great]

[Continue for each restaurant...]

**Dining Strategy:**
[Tips about when to visit, booking requirements, local food customs]

**Dietary Notes:**
[If dietary restrictions, explain how these restaurants accommodate them]
\`\`\`

**Quality standards:**
- Show 4-6 restaurants with variety
- Include mix of price levels
- Note dietary accommodations clearly
- Include must-try dishes
- Mention booking requirements
- Suggest best times to visit
- Include local food culture tips`,

  model: {
    provider: 'ANTHROPIC',
    name: 'claude-3-5-sonnet-20241022',
    toolChoice: 'auto',
  },

  tools: {
    searchRestaurantsTool,
  },
});
