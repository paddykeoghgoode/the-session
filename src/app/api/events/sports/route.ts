import { NextResponse } from 'next/server';
import { getUpcomingSportsEvents } from '@/lib/sports-events';

export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    const events = await getUpcomingSportsEvents();

    return NextResponse.json({
      events,
      fetchedAt: new Date().toISOString(),
      count: events.length,
    });
  } catch {
    return NextResponse.json(
      { events: [], fetchedAt: new Date().toISOString(), count: 0 },
      { status: 200 }
    );
  }
}
