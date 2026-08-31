# Days Without Discord Incidents

A production-ready Discord bot and web service that tracks how many days a
server has gone without an incident.

It posts a dynamically generated counter image to a Discord channel every day,
and lets authorized users reset the counter with a slash command while keeping a
full reset history.

## Features

- **Dynamic counter** — the number of days is always calculated on the fly from
  the last incident timestamp (never stored directly).
- **Daily automatic post** — a Vercel Cron Job posts `🟢 N days without Discord
  incidents` with an OG image to a configured channel.
- **Dynamic OG image** — dark, dashboard-style image with a large number,
  title, and last incident date.
- **Slash commands** — `/incident`, `/days`, `/stats`.
- **Authorization** — only whitelisted user IDs can reset the counter.
- **Full reset history** — every reset is stored with user, username, reason,
  and timestamp.

## Stack

- Next.js (App Router, TypeScript, strict mode)
- Vercel (deployment + Cron Jobs)
- Discord Interactions API (HTTP endpoint, no persistent Gateway connection)
- Turso (libSQL) database
- Drizzle ORM (with generated migrations)
- `next/og` for dynamic images

## Project structure

```
src/
  app/
    api/
      interactions/route.ts       # Discord interactions endpoint
      og/route.tsx                # Dynamic OG image endpoint
      cron/post-daily-counter/route.ts  # Daily cron endpoint
    layout.tsx
    page.tsx
  db/
    client.ts                     # Lazy Turso client
    schema.ts                     # Drizzle schema
  lib/
    auth/index.ts                 # Authorized user check
    counter/service.ts            # Streak/reset/stats logic
    discord/
      commands.ts                 # Slash command definitions
      handleInteraction.ts        # Command routing/handling
      rest.ts                     # Discord REST client
      send.ts                     # Channel message sender
      verify.ts                   # Ed25519 signature verification
    env.ts                        # Zod environment validation
    logging.ts
  scripts/
    register-commands.ts          # Slash command registration
    seed.ts                       # Database seed
drizzle/                          # Generated migrations
```

## Prerequisites

- Node.js 20+ (LTS recommended)
- A [Discord application](https://discord.com/developers/applications)
- A [Turso](https://turso.tech) database
- A [Vercel](https://vercel.com) account

---

## 1. Discord setup

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
   and create a **New Application**.
2. Go to **Bot**, create a bot user, and copy the **Token**.
3. Under **OAuth2 → General**, copy the **Client ID** (this is
   `DISCORD_APPLICATION_ID`).
4. Under **General Information**, copy the **Public Key**
   (`DISCORD_PUBLIC_KEY`).
5. Invite the bot to your server using the OAuth2 URL generator with the
   `applications.commands` and `bot` scopes (and the *Send Messages*,
   *Embed Links* bot permissions).
6. Enable Developer Mode in Discord, then right-click your target channel and
   copy its **Channel ID** (`DISCORD_CHANNEL_ID`).
7. Copy your own Discord **User ID** for `AUTHORIZED_USER_IDS`.
8. In **Installation**, set the **Interactions Endpoint URL** to:
   `https://<your-vercel-domain>/api/interactions`. Discord must successfully
   verify the endpoint before interactions work.

## 2. Turso setup

1. Install the Turso CLI and log in:

   ```bash
   curl -sSfL https://get.turso.tech/install.sh | bash
   turso auth login
   ```

2. Create a database:

   ```bash
   turso db create incidents-counter
   ```

3. Get the database URL and an auth token:

   ```bash
   turso db show incidents-counter --url
   turso db tokens create incidents-counter
   ```

   The URL looks like `libsql://incidents-counter-<org>.turso.io`.

## 3. Environment variables

Copy the example and fill in every value:

```bash
cp .env.example .env
```

| Variable                  | Description                                            |
| ------------------------- | ------------------------------------------------------ |
| `DISCORD_APPLICATION_ID`  | Discord application/client ID                          |
| `DISCORD_PUBLIC_KEY`      | Discord application public key                         |
| `DISCORD_BOT_TOKEN`       | Discord bot token                                      |
| `DISCORD_CHANNEL_ID`      | Channel ID for daily counter posts                     |
| `TURSO_DATABASE_URL`      | Turso libSQL URL (`libsql://...`)                      |
| `TURSO_AUTH_TOKEN`        | Turso auth token                                       |
| `AUTHORIZED_USER_IDS`     | Comma-separated user IDs allowed to run `/incident`    |
| `CRON_SECRET`             | Secret protecting the cron endpoint                    |
| `APP_URL`                 | Public base URL of the app (for OG image links)        |
| `SEED_LAST_INCIDENT_AT`   | *(optional)* backdate the initial incident when seeding |

Generate a strong `CRON_SECRET`:

```bash
openssl rand -base64 32
```

## 4. Install and set up the database

```bash
npm install

# Apply migrations to the Turso database
npm run db:migrate

# Seed the initial counter state (sets last incident to now by default)
npm run db:seed
```

To backdate the initial incident (so the counter starts above zero):

```bash
SEED_LAST_INCIDENT_AT=2026-08-01T00:00:00Z npm run db:seed
```

## 5. Register slash commands

```bash
npm run register
```

This registers `/incident`, `/days`, and `/stats` globally. Global commands can
take up to an hour to propagate; use the command in your server and it should
appear shortly (or restart the Discord client).

## 6. Local development

```bash
npm run dev
```

- The app runs at `http://localhost:3000`.
- Test the OG image at
  `http://localhost:3000/api/og?days=127&lastIncidentDate=2026-08-01`.
- The interactions endpoint requires requests signed by Discord, so it is
  easiest to test slash commands against the deployed app. For local testing,
  you can use a tool like [`cloudflared`](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/install-and-setup/tunnel-guide/local/)
  to expose a public HTTPS URL and point the Interactions Endpoint URL at it.
- Trigger the daily post manually with the `CRON_SECRET`:

  ```bash
  curl -H "Authorization: Bearer $CRON_SECRET" \
    http://localhost:3000/api/cron/post-daily-counter
  ```

## 7. Vercel deployment

1. Push the repository to GitHub and import it into Vercel.
2. Add all environment variables under **Settings → Environment Variables**.
3. Set `APP_URL` to your deployment URL (e.g. `https://incidents-counter.vercel.app`).
4. Deploy.

The `vercel.json` file defines a Cron Job that runs `/api/cron/post-daily-counter`
daily at 12:00 UTC. Vercel automatically sends the `CRON_SECRET` as an
`Authorization: Bearer` header on cron requests, which the endpoint verifies.

## Slash commands

| Command                | Description                                             |
| ---------------------- | ------------------------------------------------------- |
| `/incident [reason]`   | Record an incident and reset the counter (authorized)   |
| `/days`                | Show current streak and last incident date              |
| `/stats`               | Show streak, total incidents, most recent, and author   |

### Example responses

```
/days
Current streak: 42 days
Last incident: 2026-08-01
```

```
/stats
Current streak: 42 days
Total incidents: 7
Most recent incident: 2026-08-01
Last reset author: jane
```

## Scripts

| Script            | Description                                  |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Start the development server                  |
| `npm run build`   | Create a production build                     |
| `npm run start`   | Start the production server                   |
| `npm run lint`    | Run ESLint                                   |
| `npm run typecheck` | Run TypeScript type checking                |
| `npm run db:generate` | Generate a new migration from the schema   |
| `npm run db:migrate` | Apply migrations to Turso                  |
| `npm run db:push` | Push the schema directly to Turso             |
| `npm run db:seed` | Seed the initial counter state                |
| `npm run register` | Register slash commands with Discord         |

## License

MIT
