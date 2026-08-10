# CourtIQ

Volleyball coaching platform: organization → level → team hierarchy, roster
management, live NFHS stat tracking, season stats, Glover's digital scorebook,
schedule, and a practice planner. Built with Next.js (App Router) + Supabase +
Tailwind, deployable on Vercel.

## Local development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local` (copy `.env.local.example`) with your Supabase project
   URL and anon/publishable key:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-or-publishable-key>
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000.

## Database setup

Run the SQL migrations in `supabase/migrations/` **in order**, in the Supabase
Dashboard → SQL Editor:

1. `0001_init.sql` — tables
2. `0002_rls.sql` — row-level security, triggers, and the create/join-org RPCs
   (also seeds the default drill library for each new org)
3. `0003_org_levels_lookup.sql` — level lookup used by the join-org screen

### Auth setting

For a small private program, turn **off** email confirmation so signups work
instantly: Supabase Dashboard → Authentication → Sign In / Providers → Email →
disable "Confirm email" → Save. (Leave it on only if you set up an SMTP email
provider.)

## Deploying to Vercel

1. Push this repo to GitHub (or GitLab/Bitbucket).
2. In Vercel, "Add New… → Project" and import the repo. Vercel auto-detects
   Next.js.
3. Add two Environment Variables (same values as `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. After the first deploy, in Supabase Dashboard → Authentication → URL
   Configuration, add your Vercel domain to the allowed redirect URLs.

## Architecture notes

- **Live stats** are captured in client state during a match (fast, offline-safe
  via `localStorage`) and written to `matches` / `match_sets` /
  `match_stat_events` on "End & save match". Season/match totals are `GROUP BY`
  aggregations over the event log — no denormalized totals to keep in sync.
- **Glover's scorebook** rotation grids, circled sideouts, sub logs, and timeout
  logs are stored as JSONB per set — a faithful digitization of the paper book,
  read/written as whole pages.
- **RLS** scopes every table to the user's organization, restricting coaches to
  their assigned levels (admins see the whole org).
