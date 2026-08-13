# Arcadia University CS Club Website

Official website for the Arcadia University Computer Science Club, hosted at [arcadiacs.club](https://arcadiacs.club).

Built with [Astro](https://astro.build) and deployed to [Cloudflare Workers](https://developers.cloudflare.com/workers/).

## Features

- Public pages: home, sign up, calendar, officers, contact
- Custom calendar UI backed by Cloudflare D1
- Admin event manager at `/admin` (protected by Cloudflare Access)
- Contact form with Cloudflare Email Sending and Turnstile
- Accessibility and security headers baked in

## Development

### Prerequisites

- Node.js 22+
- npm
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (included as dev dependency)

### Setup

```bash
npm install
cp .env.example .dev.vars
# Edit .dev.vars with your secrets (see below)
```

### Local database

```bash
npm run db:migrate:local
```

### Run dev server

```bash
npm run dev
```

For full Worker bindings (D1, email) locally:

```bash
npm run build
npm run preview
```

## Deploy

```bash
# Create remote D1 database (first time only)
npx wrangler d1 create arcadiacs-events
# Update database_id in wrangler.jsonc with the returned ID

# Apply migrations to production
npm run db:migrate

# Set secrets
npx wrangler secret put POLICY_AUD
npx wrangler secret put TURNSTILE_SECRET_KEY

# Deploy
npm run deploy
```

## Environment variables

| Variable | Where | Description |
|---|---|---|
| `POLICY_AUD` | Secret | Cloudflare Access application audience tag |
| `ACCESS_TEAM_DOMAIN` | `wrangler.jsonc` vars | Your team domain (e.g. `yourteam.cloudflareaccess.com`) |
| `TURNSTILE_SECRET_KEY` | Secret | Turnstile secret key (set via `wrangler secret put`) |
| `TURNSTILE_SITE_KEY` | vars | Turnstile site key (public, in `wrangler.jsonc`) |
| `CONTACT_TO_EMAIL` | vars | General contact inbox (default: `contact@arcadiacs.club`) |
| `WEB_SUPPORT_TO_EMAIL` | vars | Website support inbox (default: `admin@arcadiacs.club`) |
| `CONTACT_FROM_EMAIL` | vars | Sender address (default: `noreply@arcadiacs.club`) |

Enable email sending:

```bash
npx wrangler email sending enable arcadiacs.club
```

Turnstile is configured on the contact form. For local preview, copy `.env.example` to `.dev.vars` and add your `TURNSTILE_SECRET_KEY` (get it with `npx wrangler turnstile widget get <sitekey>`).

## Cloudflare Access (admin)

Protect these paths in Zero Trust → Access → Applications:

- `arcadiacs.club/admin`
- `arcadiacs.club/admin/*`
- `arcadiacs.club/api/admin/*`

**Allowed emails:**

- `eakselrad@arcadia.edu`
- `evaakselrad@gmail.com`

Copy the application **AUD** tag into the `POLICY_AUD` secret.

### Local admin development

Create a [service token](https://developers.cloudflare.com/cloudflare-one/access-controls/service-credentials/service-tokens/) and add a Service Auth policy to the Access application. Then:

```bash
export CLOUDFLARE_ACCESS_CLIENT_ID=...
export CLOUDFLARE_ACCESS_CLIENT_SECRET=...
npm run preview
```

## Content updates

### Officers

Edit YAML files in `src/content/officers/`. Each file needs `name`, `role`, and optional `email`, `bio`, `image`, `comingSoon`, `order`.

### Site config

Edit `src/content/site/config.yaml` for meeting info, Google Form URL, and social links.

### Events

Use the admin UI at `/admin` (after Access login) or run SQL via Wrangler:

```bash
npx wrangler d1 execute arcadiacs-events --local --command "SELECT * FROM events"
```

## Project structure

```
src/
  components/     # Nav, Footer, Calendar, EventForm, OfficerCard
  content/        # Officers + site config (YAML)
  layouts/        # Shared page layout
  lib/            # D1, Access JWT, ICS, validation
  pages/          # Routes + API endpoints
  styles/         # Global CSS
migrations/       # D1 SQL migrations
public/           # Static assets (images, favicon)
```

## License

See [LICENSE](LICENSE).
