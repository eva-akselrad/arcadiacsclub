/// <reference path="../.astro/types.d.ts" />

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {
    runtime: Runtime;
  }
}

interface Env {
  DB: D1Database;
  EMAIL: SendEmail;
  ASSETS: Fetcher;
  POLICY_AUD?: string;
  ACCESS_TEAM_DOMAIN?: string;
  TURNSTILE_SECRET_KEY?: string;
  TURNSTILE_SITE_KEY?: string;
  CONTACT_TO_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
  WEB_SUPPORT_TO_EMAIL?: string;
}

interface SendEmail {
  send(message: {
    to: string | { email: string; name?: string };
    from: { email: string; name?: string };
    subject: string;
    html?: string;
    text?: string;
    replyTo?: { email: string; name?: string };
  }): Promise<{ messageId?: string }>;
}

interface EventRow {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  start_at: string;
  end_at: string;
  all_day: number;
  category: string | null;
  recurrence_rule: string | null;
  created_at: string;
  updated_at: string;
}

interface EventInput {
  title: string;
  description?: string | null;
  location?: string | null;
  start_at: string;
  end_at: string;
  all_day?: boolean;
  category?: string | null;
  recurrence_rule?: string | null;
}
