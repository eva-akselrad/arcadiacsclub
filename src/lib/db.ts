import type { APIContext } from 'astro';

type EnvContext = APIContext | { locals: App.Locals };

export function getEnv(context: EnvContext): Env {
  const runtime = context.locals.runtime;
  if (!runtime?.env) {
    throw new Error('Cloudflare runtime is not available');
  }
  return runtime.env as Env;
}

export async function listEvents(
  db: D1Database,
  from?: string,
  to?: string,
): Promise<EventRow[]> {
  let query = 'SELECT * FROM events';
  const params: string[] = [];

  if (from && to) {
    query += ' WHERE start_at >= ? AND start_at <= ?';
    params.push(from, to);
  } else if (from) {
    query += ' WHERE start_at >= ?';
    params.push(from);
  } else if (to) {
    query += ' WHERE start_at <= ?';
    params.push(to);
  }

  query += ' ORDER BY start_at ASC';

  const result = await db
    .prepare(query)
    .bind(...params)
    .all<EventRow>();

  return result.results ?? [];
}

export async function getEvent(
  db: D1Database,
  id: number,
): Promise<EventRow | null> {
  return (
    (await db.prepare('SELECT * FROM events WHERE id = ?').bind(id).first<EventRow>()) ??
    null
  );
}

export async function createEvent(db: D1Database, input: EventInput): Promise<EventRow> {
  const result = await db
    .prepare(
      `INSERT INTO events (title, description, location, start_at, end_at, all_day, category, recurrence_rule)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING *`,
    )
    .bind(
      input.title,
      input.description ?? null,
      input.location ?? null,
      input.start_at,
      input.end_at,
      input.all_day ? 1 : 0,
      input.category ?? null,
      input.recurrence_rule ?? null,
    )
    .first<EventRow>();

  if (!result) {
    throw new Error('Failed to create event');
  }

  return result;
}

export async function updateEvent(
  db: D1Database,
  id: number,
  input: EventInput,
): Promise<EventRow | null> {
  await db
    .prepare(
      `UPDATE events SET
        title = ?, description = ?, location = ?, start_at = ?, end_at = ?,
        all_day = ?, category = ?, recurrence_rule = ?, updated_at = datetime('now')
       WHERE id = ?`,
    )
    .bind(
      input.title,
      input.description ?? null,
      input.location ?? null,
      input.start_at,
      input.end_at,
      input.all_day ? 1 : 0,
      input.category ?? null,
      input.recurrence_rule ?? null,
      id,
    )
    .run();

  return getEvent(db, id);
}

export async function deleteEvent(db: D1Database, id: number): Promise<boolean> {
  const result = await db.prepare('DELETE FROM events WHERE id = ?').bind(id).run();
  return (result.meta.changes ?? 0) > 0;
}

export function rowToJson(row: EventRow) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    location: row.location,
    startAt: row.start_at,
    endAt: row.end_at,
    allDay: row.all_day === 1,
    category: row.category,
    recurrenceRule: row.recurrence_rule,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
