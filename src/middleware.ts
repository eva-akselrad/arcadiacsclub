import { defineMiddleware } from 'astro:middleware';

const LEGACY_REDIRECTS: Record<string, string> = {
  '/pages/officers.html': '/officers',
  '/pages/signup.html': '/signup',
  '/pages/events.html': '/calendar',
  '/pages/calendar.html': '/calendar',
  '/index.html': '/',
  '/events': '/calendar',
};

const SECURITY_HEADERS: Record<string, string> = {
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data:",
    "frame-src https://docs.google.com https://forms.gle https://challenges.cloudflare.com",
    "connect-src 'self' https://challenges.cloudflare.com",
  ].join('; '),
};

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  const redirectTo = LEGACY_REDIRECTS[pathname];
  if (redirectTo) {
    return context.redirect(redirectTo, 301);
  }

  const response = await next();

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  return response;
});
