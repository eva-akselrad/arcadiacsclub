const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactTopic = 'general' | 'web-support';

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  topic: ContactTopic;
  website?: string;
  turnstileToken?: string;
}

export function validateContactPayload(body: unknown):
  | { ok: true; data: ContactPayload }
  | { ok: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid request body' };
  }

  const record = body as Record<string, unknown>;
  const name = String(record.name ?? '').trim();
  const email = String(record.email ?? '').trim();
  const subject = String(record.subject ?? '').trim();
  const message = String(record.message ?? '').trim();
  const website = record.website ? String(record.website).trim() : '';
  const turnstileToken = record.turnstileToken
    ? String(record.turnstileToken).trim()
    : '';
  const topicRaw = String(record.topic ?? 'general').trim();
  const topic: ContactTopic =
    topicRaw === 'web-support' ? 'web-support' : 'general';

  if (website) {
    return { ok: false, error: 'Spam detected' };
  }

  if (!name || name.length > 100) {
    return { ok: false, error: 'Name is required (max 100 characters)' };
  }
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return { ok: false, error: 'Valid email is required' };
  }
  if (!subject || subject.length > 200) {
    return { ok: false, error: 'Subject is required (max 200 characters)' };
  }
  if (!message || message.length > 5000) {
    return { ok: false, error: 'Message is required (max 5000 characters)' };
  }

  return {
    ok: true,
    data: { name, email, subject, message, topic, website, turnstileToken },
  };
}

export async function verifyTurnstile(
  token: string,
  secret: string,
  ip: string,
): Promise<boolean> {
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  if (ip && ip !== 'unknown') {
    form.append('remoteip', ip);
  }

  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    { method: 'POST', body: form },
  );

  if (!response.ok) return false;
  const data = (await response.json()) as { success?: boolean };
  return data.success === true;
}

export function validateEventInput(body: unknown):
  | { ok: true; data: EventInput }
  | { ok: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid request body' };
  }

  const record = body as Record<string, unknown>;
  const title = String(record.title ?? '').trim();
  const description = record.description
    ? String(record.description).trim()
    : null;
  const location = record.location ? String(record.location).trim() : null;
  const start_at = String(record.start_at ?? record.startAt ?? '').trim();
  const end_at = String(record.end_at ?? record.endAt ?? '').trim();
  const all_day = Boolean(record.all_day ?? record.allDay);
  const category = record.category ? String(record.category).trim() : null;
  const recurrence_rule = record.recurrence_rule
    ? String(record.recurrence_rule).trim()
    : null;

  if (!title || title.length > 200) {
    return { ok: false, error: 'Title is required (max 200 characters)' };
  }
  if (!start_at || Number.isNaN(Date.parse(start_at))) {
    return { ok: false, error: 'Valid start date is required' };
  }
  if (!end_at || Number.isNaN(Date.parse(end_at))) {
    return { ok: false, error: 'Valid end date is required' };
  }
  if (new Date(end_at) < new Date(start_at)) {
    return { ok: false, error: 'End date must be after start date' };
  }

  return {
    ok: true,
    data: {
      title,
      description,
      location,
      start_at: new Date(start_at).toISOString(),
      end_at: new Date(end_at).toISOString(),
      all_day,
      category,
      recurrence_rule,
    },
  };
}
