# ☁️ Turn on cloud accounts + leaderboard + dashboard

This is **optional**. Without it, SurgeryQuest runs in local mode (on-device
profiles). With it, you get passwordless accounts, cross-device progress, a
**cohort leaderboard**, and the **educator dashboard** (`dashboard.html`).

It uses **Supabase** (free tier) — hosted database + auth, called straight from
the browser. No server to run.

---

## 1. Create the project (2 min)
1. Go to **https://supabase.com** → **New project** (free tier is fine).
2. When it's ready: **Project Settings → API**. Copy two things:
   - **Project URL** (e.g. `https://abcdefgh.supabase.co`)
   - **anon public** key (a long `eyJ...` string — *not* the `service_role` secret)

## 2. Paste the keys
Open **`cloud.js`** and fill in the top block:
```js
window.SUPABASE_CONFIG = {
  url: "https://abcdefgh.supabase.co",
  anonKey: "eyJhbGciOi...",
};
```
(The anon key is safe in the browser — the SQL below locks down writes.)

## 3. Create the table (one paste)
In Supabase → **SQL Editor → New query**, paste this and **Run**:

```sql
create table if not exists public.players (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  display_name text,
  cohort      text,
  save        jsonb,
  xp          int4 default 0,
  stars       int4 default 0,
  cases_done  int4 default 0,
  badges      int4 default 0,
  updated_at  timestamptz default now()
);

alter table public.players enable row level security;

-- Anyone may READ the leaderboard (display names + game stats only; synthetic).
create policy "players readable" on public.players
  for select using (true);

-- A signed-in user may write ONLY their own row.
create policy "write own row" on public.players
  for insert with check (auth.uid() = id);
create policy "update own row" on public.players
  for update using (auth.uid() = id) with check (auth.uid() = id);
```

> Want the leaderboard private to signed-in users only? Change the read policy to
> `for select using (auth.role() = 'authenticated')` — but then `dashboard.html`
> needs a signed-in teacher.

## 4. Allow your site to sign people in
Supabase → **Authentication → URL Configuration** → add your site URL(s) under
**Redirect URLs** (and Site URL), e.g.
`https://absurdlyman-prog.github.io/Abdurr/` and your Netlify URL.
Email magic-link sign-in works out of the box on the free tier.

## 5. Deploy
Commit the edited `cloud.js` (or just re-run your deploy). Done:
- In the game, **🏆 Players** now shows a **Cloud sync** panel — sign in by email,
  set a **cohort code**, and your progress syncs + appears on the cohort leaderboard.
- Share the **cohort code** with a group; the teacher opens **`dashboard.html`**,
  types the code, and sees everyone's progress.

---

### Notes
- **Privacy:** only display name + game stats are stored. It's synthetic training
  data — but treat cohort codes like a shareable class password.
- **Cost:** the free tier comfortably covers a residency program's worth of use.
- This is a clean MVP. Next steps if you grow it: Google sign-in, per-rubric-domain
  analytics in the dashboard, and teacher-owned cohorts with invite codes.
