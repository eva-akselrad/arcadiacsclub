import type { APIRoute } from 'astro';
import { getEnv, listEvents, rowToJson } from '../../lib/db';

export const prerender = false;

export const GET: APIRoute = async (context) => {
  const env = getEnv(context);
  const from = context.url.searchParams.get('from') ?? undefined;
  const to = context.url.searchParams.get('to') ?? undefined;

  try {
    const events = await listEvents(env.DB, from, to);
    return new Response(JSON.stringify({ events: events.map(rowToJson) }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to load events' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
