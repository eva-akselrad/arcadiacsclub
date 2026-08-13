import type { APIRoute } from 'astro';
import { getEnv } from '../../lib/db';
import { checkRateLimit, getClientIp } from '../../lib/rate-limit';
import { validateContactPayload, verifyTurnstile } from '../../lib/validation';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const env = getEnv(context);
  const ip = getClientIp(context.request);
  const rate = checkRateLimit(`contact:${ip}`, 5, 60 * 60 * 1000);

  if (!rate.ok) {
    return new Response(JSON.stringify({ error: 'Too many requests. Try again later.' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(rate.retryAfter),
      },
    });
  }

  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const validated = validateContactPayload(body);
  if (!validated.ok) {
    return new Response(JSON.stringify({ error: validated.error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data } = validated;
  const secret = env.TURNSTILE_SECRET_KEY;

  if (secret) {
    if (!data.turnstileToken) {
      return new Response(JSON.stringify({ error: 'Captcha verification required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const captchaOk = await verifyTurnstile(data.turnstileToken, secret, ip);
    if (!captchaOk) {
      return new Response(JSON.stringify({ error: 'Captcha verification failed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } else if (!import.meta.env.DEV) {
    return new Response(JSON.stringify({ error: 'Contact form not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const toEmail =
    data.topic === 'web-support'
      ? (env.WEB_SUPPORT_TO_EMAIL ?? 'admin@arcadiacs.club')
      : (env.CONTACT_TO_EMAIL ?? 'contact@arcadiacs.club');
  const fromEmail = env.CONTACT_FROM_EMAIL ?? 'noreply@arcadiacs.club';
  const topicLabel = data.topic === 'web-support' ? 'Website support' : 'General';

  const text = [
    `Topic: ${topicLabel}`,
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Subject: ${data.subject}`,
    '',
    data.message,
  ].join('\n');

  const html = `
    <p><strong>Topic:</strong> ${escapeHtml(topicLabel)}</p>
    <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
    <p><strong>Subject:</strong> ${escapeHtml(data.subject)}</p>
    <hr />
    <p>${escapeHtml(data.message).replace(/\n/g, '<br>')}</p>
  `;

  try {
    await env.EMAIL.send({
      to: toEmail,
      from: { email: fromEmail, name: 'Arcadia CS Club Website' },
      replyTo: { email: data.email, name: data.name },
      subject: `[${topicLabel}] ${data.subject}`,
      text,
      html,
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to send message' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
