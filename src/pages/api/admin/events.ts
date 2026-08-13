import type { APIRoute } from 'astro';
import { requireAccess } from '../../../lib/access';
import { createEvent, getEnv, rowToJson } from '../../../lib/db';
import { validateEventInput } from '../../../lib/validation';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const env = getEnv(context);
  const auth = await requireAccess(context.request, env);
  if (auth instanceof Response) return auth;

  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const validated = validateEventInput(body);
  if (!validated.ok) {
    return new Response(JSON.stringify({ error: validated.error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const event = await createEvent(env.DB, validated.data);
    return new Response(JSON.stringify({ event: rowToJson(event) }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to create event' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
