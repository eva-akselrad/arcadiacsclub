import type { APIRoute } from 'astro';
import { getEnv, getEvent } from '../../../lib/db';
import { singleEventToIcs } from '../../../lib/ics';

export const prerender = false;

export const GET: APIRoute = async (context) => {
  const id = Number(context.params.id);
  if (!Number.isFinite(id)) {
    return new Response('Invalid event id', { status: 400 });
  }

  const env = getEnv(context);
  const event = await getEvent(env.DB, id);

  if (!event) {
    return new Response('Event not found', { status: 404 });
  }

  return new Response(singleEventToIcs(event), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="event-${id}.ics"`,
    },
  });
};
