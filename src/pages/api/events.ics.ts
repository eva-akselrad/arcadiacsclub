import type { APIRoute } from 'astro';
import { getEnv, listEvents } from '../../lib/db';
import { eventsToIcs } from '../../lib/ics';

export const prerender = false;

export const GET: APIRoute = async (context) => {
  const env = getEnv(context);
  const from = context.url.searchParams.get('from') ?? undefined;
  const to = context.url.searchParams.get('to') ?? undefined;

  try {
    const events = await listEvents(env.DB, from, to);
    const ics = eventsToIcs(events);

    return new Response(ics, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="arcadiacs-club.ics"',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch {
    return new Response('Failed to generate calendar', { status: 500 });
  }
};
