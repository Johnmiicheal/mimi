import { NextResponse } from 'next/server';
import { callCivic, extractText } from '@/lib/civic/client';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface Activity {
  name: string;
  description: string;
  duration: number;
  startTime?: string;
  category: string;
  location: { name: string };
  price: number;
  bookingRequired?: boolean;
}

interface DaySchedule {
  day: number;
  date: string;
  theme?: string;
  activities: Activity[];
}

interface ExportRequest {
  schedule: DaySchedule[];
  tripName: string;
  destination: string;
  startDate?: string;
  travelers?: number;
  currency?: { from: string; to: string; rate: number };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ExportRequest;
    const { schedule, tripName, destination, startDate, travelers, currency } = body;

    if (!schedule?.length) {
      return NextResponse.json({ error: 'No itinerary to export' }, { status: 400 });
    }

    // Build a tabular representation for the spreadsheet
    const rows = schedule.flatMap((day) =>
      day.activities.map((a) => ({
        day: day.day,
        date: day.date,
        theme: day.theme ?? '',
        time: a.startTime ?? '',
        activity: a.name,
        duration: a.duration,
        location: a.location.name,
        priceUSD: a.price,
        priceLocal: currency ? Math.round(a.price * currency.rate) : a.price,
        localCurrency: currency?.to ?? 'USD',
        booking: a.bookingRequired ? 'Yes' : 'No',
        description: a.description,
      })),
    );

    const totalUSD = rows.reduce((sum, r) => sum + r.priceUSD, 0);
    const totalLocal = currency ? Math.round(totalUSD * currency.rate) : totalUSD;

    const tableDescription = rows
      .map(
        (r) =>
          `Day ${r.day} | ${r.time} | ${r.activity} | ${r.duration} min | ${r.location} | $${r.priceUSD} | ${r.localCurrency} ${r.priceLocal} | Booking: ${r.booking} | ${r.description}`,
      )
      .join('\n');

    const localCurrencyName = currency?.to ?? 'USD';
    const prompt = `Create a Google Spreadsheet titled "${tripName} — Budget & Itinerary" with two sheets: "Itinerary" and "Budget Summary".

**Sheet 1: "Itinerary"**
Create a table with these columns:
- Day
- Date
- Theme
- Time
- Activity
- Duration (min)
- Location
- Price (USD)
- Price (${localCurrencyName})
- Booking Required
- Description

Data rows:
${tableDescription}

Add a TOTAL row at the bottom: Total USD = $${totalUSD}, Total ${localCurrencyName} = ${totalLocal}

**Sheet 2: "Budget Summary"**
Create a summary with:
- Trip: ${tripName}
- Destination: ${destination}
${startDate ? `- Start Date: ${startDate}` : ''}
${travelers ? `- Travelers: ${travelers}` : ''}
- Total per person: $${totalUSD} (${localCurrencyName} ${totalLocal})
${travelers ? `- Total for group: $${totalUSD * travelers} (${localCurrencyName} ${totalLocal * travelers})` : ''}
${currency ? `- Exchange rate: 1 ${currency.from} = ${currency.rate} ${currency.to}` : ''}
- Day-by-day cost breakdown (sum prices per day)

After creating the spreadsheet, provide the Google Sheets link.`;

    const response = await callCivic(prompt);
    const text = extractText(response);

    // Try to extract the sheet URL from the response
    const urlMatch = text.match(/https:\/\/docs\.google\.com\/spreadsheets\/d\/[^\s)>\]]+/);

    return NextResponse.json({
      success: true,
      message: text,
      sheetUrl: urlMatch?.[0] ?? null,
      totals: {
        usd: totalUSD,
        local: totalLocal,
        localCurrency: localCurrencyName,
      },
    });
  } catch (error) {
    console.error('[Export Sheets] Error:', error);
    return NextResponse.json(
      { error: 'Failed to export to Google Sheets' },
      { status: 500 },
    );
  }
}
