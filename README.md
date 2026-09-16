# Discord Incident Counter

A small Next.js service and Discord application that tracks how many whole days
a Discord server has gone without a recorded incident.

Authorized Discord users can record incidents with `/incident`. The service
stores every incident in Turso, derives the current streak from the latest
incident timestamp, exposes a dashboard, generates shareable OG images, and
posts a daily counter image through Vercel Cron.

## What It Does

- Records incidents with an optional reason.
- Restricts `/incident` to configured Discord user IDs.
- Calculates the current streak instead of storing a separate day counter.
- Keeps an incident history with author, username, reason, and timestamp.
- Provides `/days` and `/stats` read-only slash commands.
- Serves a live dashboard at `/`.
- Generates a dynamic counter image at `/api/og`.
- Posts the daily counter image to a configured Discord channel.
- Uses Discord HTTP interactions, so no long-running Discord Gateway process is required.

## Stack

- Next.js 15 and React 19
- TypeScript with strict checking
- Turso/libSQL and Drizzle ORM
- Discord Interactions API and Discord REST API
- Vercel Cron
- `next/og` for generated images
- Tailwind CSS v4

## Requirements

- Node.js 20 or newer
- npm or pnpm
- A Discord application and bot
- A Discord server where the bot is installed
- A Turso database
- A Vercel account for deployment and scheduled posts

## Project Layout

```text
src/
  app/
    api/
      interactions/route.ts          Discord interactions endpoint
      og/route.tsx                    Dynamic OG image endpoint
      cron/post-daily-counter/route.ts
                                      Vercel Cron endpoint
    layout.tsx                        Metadata and root layout
    page.tsx                          Public dashboard
  db/
    client.ts                         Lazy Turso client
    schema.ts                         Drizzle schema
  lib/
    auth/index.ts                     Authorized-user checks
    counter/service.ts                Streak and incident logic
    discord/                          Discord verification, commands, and REST calls
    og/fonts.ts                       OG image font loading
    env.ts                            Environment validation
  scripts/
    register-commands.ts              Discord slash-command registration
    seed.ts                            Database initialization
drizzle/                              Generated database migrations
vercel.json                           Vercel Cron schedule
```

## Quick Start

### 1. Install dependencies

Use the package manager selected by your team. The repository currently
contains an npm lockfile:

```bash
npm install
```

### 2. Create the environment file

```bash
cp .env.example .env
```

Fill in every required value before running the app or database scripts.

### 3. Create the Turso database

Install and authenticate with the Turso CLI, then create a database:

```bash
curl -sSfL https://get.tur.so/install.sh | bash
turso auth login
turso db create incidents-counter
turso db show incidents-counter --url
turso db tokens create incidents-counter
```

Put the returned URL and token in `.env` as `TURSO_DATABASE_URL` and
`TURSO_AUTH_TOKEN`.

### 4. Apply the schema

```bash
npm run db:migrate
npm run db:seed
```

The seed command initializes the counter state to the current time by default.
To start with a historical date instead:

```bash
SEED_LAST_INCIDENT_AT=2026-08-01T00:00:00Z npm run db:seed
```

Do not rerun the seed command against a live database unless you intentionally
want to change the current counter start time.

### 5. Register Discord commands

```bash
npm run register
```

This registers `/incident`, `/days`, and `/stats` as global application
commands. Discord can take up to an hour to propagate global commands.

### 6. Start the development server

```bash
npm run dev
```

The dashboard is available at `http://localhost:3000`.

## Discord Setup

Create an application in the [Discord Developer Portal](https://discord.com/developers/applications).

1. Create a bot under the **Bot** section and copy its token.
2. Copy the application/client ID from **OAuth2**.
3. Copy the public key from **General Information**.
4. Invite the bot with the `bot` and `applications.commands` scopes.
5. Grant it permission to send messages and attach files in the target channel.
6. Enable Developer Mode in Discord.
7. Copy the target channel ID into `DISCORD_CHANNEL_ID`.
8. Copy the Discord user IDs allowed to run `/incident` into
   `AUTHORIZED_USER_IDS`.
9. After deployment, set the Discord **Interactions Endpoint URL** to:
   `https://your-domain.example/api/interactions`.

Discord verifies the endpoint with a signed request. The application rejects
requests without a valid Ed25519 signature.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `DISCORD_APPLICATION_ID` | Yes | Discord application/client ID. |
| `DISCORD_PUBLIC_KEY` | Yes | Discord application public key used to verify interactions. |
| `DISCORD_BOT_TOKEN` | Yes | Bot token used for Discord REST requests. Keep it secret. |
| `DISCORD_CHANNEL_ID` | Yes | Channel receiving incident recap and daily counter messages. |
| `TURSO_DATABASE_URL` | Yes | Turso/libSQL database URL. |
| `TURSO_AUTH_TOKEN` | Yes | Turso authentication token. Keep it secret. |
| `AUTHORIZED_USER_IDS` | Yes in practice | Comma-separated Discord user IDs allowed to run `/incident`. |
| `CRON_SECRET` | Yes | Secret used to authenticate the cron endpoint. |
| `APP_URL` | Yes in production | Public application URL used to build OG image links. |
| `SEED_LAST_INCIDENT_AT` | No | ISO timestamp used only by the seed script. |

Generate a cron secret with:

```bash
openssl rand -base64 32
```

Never commit `.env`, `.env.local`, bot tokens, database tokens, or cron
secrets. They are excluded by `.gitignore`.

## Deployment on Vercel

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Add all production environment variables in the Vercel project settings.
4. Set `APP_URL` to the final public HTTPS URL.
5. Deploy the application.
6. Apply the database migration from a trusted local environment:

   ```bash
   npm run db:migrate
   ```

7. Seed the database once if it has no counter state:

   ```bash
   npm run db:seed
   ```

8. Set the Discord Interactions Endpoint URL to the deployed
   `/api/interactions` route.
9. Confirm the bot can send messages and upload files in the configured channel.

The `vercel.json` configuration schedules
`/api/cron/post-daily-counter` at `12:00 UTC` every day. Vercel sends the
configured `CRON_SECRET` as a bearer token when invoking the cron route.

## Commands

| Command | Who can use it | Description |
| --- | --- | --- |
| `/incident [reason]` | Authorized users | Records an incident and resets the streak. |
| `/days` | Any user who can use the bot | Shows the current streak and last incident date. |
| `/stats` | Any user who can use the bot | Shows the streak, total incidents, latest incident, author, and reason. |

The dashboard displays the current streak, total incidents, latest reset, and
recent incident history. Dates shown in the dashboard and command responses use
the `Europe/Rome` display timezone. Streak calculation is based on whole UTC
calendar days.

## API Routes

### `POST /api/interactions`

Receives Discord Ping and application-command interactions. Requests must have
valid Discord signature headers.

### `GET /api/cron/post-daily-counter`

Posts the current counter image to `DISCORD_CHANNEL_ID`. Requests must include:

```http
Authorization: Bearer YOUR_CRON_SECRET
```

### `GET /api/og`

Generates a 1200x630 PNG image. Example:

```text
/api/og?days=127&lastIncidentDate=2026-08-01&reason=Example
```

## Development Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Create a production build. |
| `npm run start` | Start the production build. |
| `npm run lint` | Run ESLint. |
| `npm run typecheck` | Run TypeScript checks. |
| `npm run db:generate` | Generate a Drizzle migration from schema changes. |
| `npm run db:migrate` | Apply migrations to Turso. |
| `npm run db:push` | Push the schema directly to Turso. Use carefully. |
| `npm run db:seed` | Initialize or update the counter state. |
| `npm run register` | Register the Discord slash commands. |

Before opening a pull request, run:

```bash
npm run typecheck
npm run lint
npm run build
git diff --check
```

## Troubleshooting

### Discord does not accept the interactions endpoint

- Confirm the URL ends in `/api/interactions`.
- Confirm `DISCORD_PUBLIC_KEY` matches the application.
- Confirm the deployment is publicly reachable over HTTPS.
- Check the Vercel function logs for signature or environment errors.

### Commands are missing

- Run `npm run register` again.
- Confirm `DISCORD_APPLICATION_ID` and `DISCORD_BOT_TOKEN` belong to the same application.
- Remember that global command propagation can be delayed.

### The daily post fails

- Confirm `CRON_SECRET` is set in Vercel.
- Confirm `DISCORD_CHANNEL_ID` is correct.
- Confirm the bot can send messages and attach files in that channel.
- Confirm Turso credentials are valid.
- Check the Vercel cron and function logs.

### The dashboard shows a database error

- Confirm `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set.
- Apply the migration with `npm run db:migrate`.
- Run `npm run db:seed` once if `counter_state` has not been initialized.

## Current Operational Notes

- This application is designed around one configured Discord channel and one
  configured database per deployment.
- The public dashboard exposes recent incident usernames and reasons. Review
  that policy before making the dashboard public.
- Database migrations and command registration are manual deployment steps.
- The project does not currently include an automated test suite or CI workflow.

## License

MIT
