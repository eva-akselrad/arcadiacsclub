import type { APIRoute } from 'astro';
import { getEnv, getEvent, rowToJson } from '../../../lib/db';

export const prerender = false;

export const GET: APIRoute = async (context) => {
  const id = Number(context.params.id);
  if (!Number.isFinite(id)) {
    return new Response(JSON.stringify({ error: 'Invalid event id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const env = getEnv(context);
  const event = await getEvent(env.DB, id);

  if (!event) {
    return new Response(JSON.stringify({ error: 'Event not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ event: rowToJson(event) }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
