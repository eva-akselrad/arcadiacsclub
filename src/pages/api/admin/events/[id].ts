import type { APIRoute } from 'astro';
import { requireAccess } from '../../../../lib/access';
import { deleteEvent, getEnv, rowToJson, updateEvent } from '../../../../lib/db';
import { validateEventInput } from '../../../../lib/validation';

export const prerender = false;

async function parseBody(context: Parameters<APIRoute>[0]) {
  try {
    return await context.request.json();
  } catch {
    return null;
  }
}

export const PUT: APIRoute = async (context) => {
  const env = getEnv(context);
  const auth = await requireAccess(context.request, env);
  if (auth instanceof Response) return auth;

  const id = Number(context.params.id);
  if (!Number.isFinite(id)) {
    return new Response(JSON.stringify({ error: 'Invalid event id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await parseBody(context);
  const validated = validateEventInput(body);
  if (!validated.ok) {
    return new Response(JSON.stringify({ error: validated.error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const event = await updateEvent(env.DB, id, validated.data);
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

export const DELETE: APIRoute = async (context) => {
  const env = getEnv(context);
  const auth = await requireAccess(context.request, env);
  if (auth instanceof Response) return auth;

  const id = Number(context.params.id);
  if (!Number.isFinite(id)) {
    return new Response(JSON.stringify({ error: 'Invalid event id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const deleted = await deleteEvent(env.DB, id);
  if (!deleted) {
    return new Response(JSON.stringify({ error: 'Event not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
