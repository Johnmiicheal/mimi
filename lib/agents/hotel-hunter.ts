// @ts-nocheck
import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// Tool: Search hotels
const searchHotelsTool = createTool({
  id: 'search-hotels',
  description: 'Search for hotels near activity locations within budget',
  inputSchema: z.object({
    destination: z.string().describe('City or area to search'),
    checkIn: z.string().describe('Check-in date (YYYY-MM-DD)'),
    checkOut: z.string().describe('Check-out date (YYYY-MM-DD)'),
    guests: z.number().describe('Number of guests'),
    maxPricePerNight: z.number().describe('Maximum price per night in USD'),
    activityLocations: z.array(z.object({
      lat: z.number(),
      lng: z.number(),
      name: z.string(),
    })).optional().describe('Activity locations to optimize hotel placement'),
  }),
  execute: async ({ input }) => {
    // Mock hotel data (in production, call Booking.com/Hotels.com API)
    const mockHotels = [
      {
        id: 'HTL001',
        name: 'Shibuya Granbell Hotel',
        rating: 4.7,
        reviews: 892,
        price: 180,
        currency: 'USD',
        location: { name: 'Shibuya, Tokyo', lat: 35.6586, lng: 139.7016 },
        distanceToCenter: '0.8 km',
        amenities: ['wifi', 'breakfast', 'gym', 'restaurant'],
        photos: [],
        description: 'Modern boutique hotel in the heart of Shibuya with rooftop bar',
        cancellation: 'Free cancellation until 24h before check-in',
      },
      {
        id: 'HTL002',
        name: 'Hotel Gracery Shinjuku',
        rating: 4.5,
        reviews: 1203,
        price: 165,
        currency: 'USD',
        location: { name: 'Shinjuku, Tokyo', lat: 35.6938, lng: 139.7006 },
        distanceToCenter: '1.2 km',
        amenities: ['wifi', 'restaurant', 'parking'],
        photos: [],
        description: 'Convenient location near Shinjuku Station with famous Godzilla view',
        cancellation: 'Free cancellation until 48h before check-in',
      },
      {
        id: 'HTL003',
        name: 'Asakusa View Hotel',
        rating: 4.6,
        reviews: 756,
        price: 150,
        currency: 'USD',
        location: { name: 'Asakusa, Tokyo', lat: 35.7120, lng: 139.7969 },
        distanceToCenter: '2.5 km',
        amenities: ['wifi', 'breakfast', 'spa', 'pool'],
        photos: [],
        description: 'Traditional hotel near Senso-ji Temple with stunning city views',
        cancellation: 'Free cancellation until 72h before check-in',
      },
      {
        id: 'HTL004',
        name: 'The Millennium Mitsui Garden Hotel',
        rating: 4.8,
        reviews: 1450,
        price: 220,
        currency: 'USD',
        location: { name: 'Ginza, Tokyo', lat: 35.6722, lng: 139.7647 },
        distanceToCenter: '0.5 km',
        amenities: ['wifi', 'breakfast', 'gym', 'spa', 'restaurant', 'parking'],
        photos: [],
        description: 'Luxury hotel in upscale Ginza district with premium amenities',
        cancellation: 'Free cancellation until 24h before check-in',
      },
    ];

    // Filter by price
    const filtered = mockHotels.filter(h => h.price <= input.maxPricePerNight);

    // Calculate distance to activity center if provided
    if (input.activityLocations && input.activityLocations.length > 0) {
      const centerLat = input.activityLocations.reduce((sum, loc) => sum + loc.lat, 0) / input.activityLocations.length;
      const centerLng = input.activityLocations.reduce((sum, loc) => sum + loc.lng, 0) / input.activityLocations.length;

      filtered.forEach(hotel => {
        const distance = calculateDistance(
          hotel.location.lat,
          hotel.location.lng,
          centerLat,
          centerLng
        );
        hotel.distanceToCenter = `${distance.toFixed(1)} km to activities`;
      });

      // Sort by proximity to activities
      filtered.sort((a, b) => {
        const distA = calculateDistance(a.location.lat, a.location.lng, centerLat, centerLng);
        const distB = calculateDistance(b.location.lat, b.location.lng, centerLat, centerLng);
        return distA - distB;
      });
    }

    return {
      hotels: filtered,
      searchCriteria: input,
      resultsCount: filtered.length,
    };
  },
});

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const hotelHunterAgent = new Agent({
  id: 'hotel-hunter',

  description: 'Finds hotels optimally located near planned activities. Returns hotel recommendations with pricing, amenities, and location analysis.',

  instructions: `You are a hotel specialist who finds the perfect accommodation.

**Your job:**
- Use search-hotels tool to find hotels
- Prioritize location near activities (if provided)
- Balance price, quality, and convenience
- Highlight the best value option

**CRITICAL: Output Format**
\`\`\`
🏨 **Hotel Recommendations**

I found {{+[hotels]-}} great options for your stay in [destination]:

[Brief analysis of hotel options and location strategy]

**Hotels:**

1. **[Hotel Name]** ⭐ [rating]
   - $[price]/night ([total] for [nights] nights)
   - [Location] - [distance to activities]
   - Amenities: [key amenities]
   - [Why it's a good choice]

2. [Next hotel...]

**My Recommendation:**
The [hotel name] offers the best value because [reason about location/price/amenities].

**Location Strategy:**
[Explain how this hotel minimizes travel to planned activities]
\`\`\`

**Quality standards:**
- Show max 3-4 hotels
- Include price per night AND total cost
- Highlight proximity to planned activities
- Note key amenities (wifi, breakfast, gym, etc.)
- Include cancellation policies
- Explain why the top pick is best`,

  model: {
    provider: 'ANTHROPIC',
    name: 'claude-3-5-sonnet-20241022',
    toolChoice: 'auto',
  },

  tools: {
    searchHotelsTool,
  },
});
