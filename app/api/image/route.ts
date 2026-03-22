import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const PEXELS_KEY = process.env.PEXELS_API_KEY;

// Simple in-memory cache to avoid hitting Pexels repeatedly for the same query
const cache = new Map<string, string>();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Missing ?q= parameter' }, { status: 400 });
  }

  // Return cached URL if available
  if (cache.has(query)) {
    return NextResponse.redirect(cache.get(query)!);
  }

  if (!PEXELS_KEY) {
    // Fallback: redirect to a placeholder
    return NextResponse.redirect(
      `https://via.placeholder.com/800x500/1a1a2e/ffffff?text=${encodeURIComponent(query)}`
    );
  }

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
      { headers: { Authorization: PEXELS_KEY } },
    );

    if (!res.ok) {
      return NextResponse.redirect(
        `https://via.placeholder.com/800x500/1a1a2e/ffffff?text=${encodeURIComponent(query)}`
      );
    }

    const data = await res.json();
    const photos = data.photos ?? [];

    if (photos.length === 0) {
      return NextResponse.redirect(
        `https://via.placeholder.com/800x500/1a1a2e/ffffff?text=${encodeURIComponent(query)}`
      );
    }

    // Pick a random photo from the top results for variety
    const photo = photos[Math.floor(Math.random() * photos.length)];
    const imageUrl = photo.src?.large2x ?? photo.src?.large ?? photo.src?.original;

    // Cache it
    cache.set(query, imageUrl);

    return NextResponse.redirect(imageUrl);
  } catch {
    return NextResponse.redirect(
      `https://via.placeholder.com/800x500/1a1a2e/ffffff?text=${encodeURIComponent(query)}`
    );
  }
}
