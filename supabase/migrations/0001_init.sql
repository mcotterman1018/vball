-- CourtIQ initial schema
-- Organization -> Level -> Team -> Roster hierarchy, schedule, live stats tracker,
-- season stats, Glover's scorebook, practice planner.

create extension if not exists pgcrypto;

-- ────────────────────────────────────────────────────────────────
-- Identity & org structure
-- ────────────────────────────────────────────────────────────────

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  created_at timestamptz not null default now()
);

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table org_members (
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('admin', 'coach')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);
create index org_members_user_idx on org_members(user_id);

create table levels (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index levels_org_idx on levels(org_id);

create table level_coaches (
  level_id uuid not null references levels(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (level_id, user_id)
);
create index level_coaches_user_idx on level_coaches(user_id);

create table teams (
  id uuid primary key default gen_random_uuid(),
  level_id uuid not null references levels(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index teams_level_idx on teams(level_id);

create table team_favorites (
  user_id uuid not null references profiles(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, team_id)
);

-- ────────────────────────────────────────────────────────────────
-- Roster
-- ────────────────────────────────────────────────────────────────

create table players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  jersey_num integer not null,
  name text not null default '',
  position text not null default '',
  is_libero boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index players_team_idx on players(team_id);

-- ────────────────────────────────────────────────────────────────
-- Schedule
-- ────────────────────────────────────────────────────────────────

create table games (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  opponent text not null,
  home_away text not null check (home_away in ('Home', 'Away')),
  game_date date not null,
  created_at timestamptz not null default now()
);
create index games_team_idx on games(team_id);

-- ────────────────────────────────────────────────────────────────
-- Live stats tracker -> saved matches
-- ────────────────────────────────────────────────────────────────

create table matches (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  game_id uuid references games(id) on delete set null,
  match_date date not null default current_date,
  home_team_name text not null default '',
  away_team_name text not null default '',
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index matches_team_idx on matches(team_id);
create index matches_game_idx on matches(game_id);

create table match_sets (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  set_number smallint not null,
  home_score smallint not null default 0,
  away_score smallint not null default 0,
  unique (match_id, set_number)
);
create index match_sets_match_idx on match_sets(match_id);

-- One row per stat tap. Match/season totals are GROUP BY queries over this table.
create table match_stat_events (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  stat_key text not null,
  created_at timestamptz not null default now()
);
create index match_stat_events_match_idx on match_stat_events(match_id);
create index match_stat_events_player_idx on match_stat_events(player_id);

-- Org-wide custom stat types, in addition to the built-in NFHS set.
create table custom_stat_defs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  key text not null,
  label text not null,
  short_label text not null,
  color text not null default '#2E2440',
  category text not null default 'Custom',
  created_at timestamptz not null default now(),
  unique (org_id, key)
);
create index custom_stat_defs_org_idx on custom_stat_defs(org_id);

-- ────────────────────────────────────────────────────────────────
-- Glover's scorebook (paper-scorebook digitization)
-- ────────────────────────────────────────────────────────────────

create table scorebooks (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  game_id uuid references games(id) on delete set null,
  home_team text not null default '',
  away_team text not null default '',
  format smallint not null default 3 check (format in (3, 5)),
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index scorebooks_team_idx on scorebooks(team_id);
create index scorebooks_game_idx on scorebooks(game_id);

create table scorebook_sets (
  id uuid primary key default gen_random_uuid(),
  scorebook_id uuid not null references scorebooks(id) on delete cascade,
  set_number smallint not null,
  home_score smallint not null default 0,
  away_score smallint not null default 0,
  home_line jsonb not null default '["","","","","",""]'::jsonb,
  away_line jsonb not null default '["","","","","",""]'::jsonb,
  home_libero text not null default '',
  away_libero text not null default '',
  home_grid jsonb not null default '[[],[],[],[],[],[]]'::jsonb,
  away_grid jsonb not null default '[[],[],[],[],[],[]]'::jsonb,
  home_circled jsonb not null default '[[],[],[],[],[],[]]'::jsonb,
  away_circled jsonb not null default '[[],[],[],[],[],[]]'::jsonb,
  point_log jsonb not null default '[]'::jsonb,
  sub_log jsonb not null default '[]'::jsonb,
  timeout_log jsonb not null default '[]'::jsonb,
  unique (scorebook_id, set_number)
);
create index scorebook_sets_scorebook_idx on scorebook_sets(scorebook_id);

-- ────────────────────────────────────────────────────────────────
-- Practice planner
-- ────────────────────────────────────────────────────────────────

create table drills (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  category text not null default 'Warmup',
  duration_min integer not null default 10,
  description text not null default '',
  focus text not null default '',
  notes text not null default '',
  video_url text not null default '',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index drills_org_idx on drills(org_id);

create table practices (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  title text not null default '',
  practice_date date,
  duration_min integer not null default 90,
  notes text not null default '',
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index practices_team_idx on practices(team_id);

-- type='block'/'parallel' items can nest drill items via parent_item_id.
-- group_index distinguishes group A (0) vs group B (1) within a parallel block.
create table practice_items (
  id uuid primary key default gen_random_uuid(),
  practice_id uuid not null references practices(id) on delete cascade,
  parent_item_id uuid references practice_items(id) on delete cascade,
  type text not null check (type in ('drill', 'block', 'header', 'parallel')),
  drill_id uuid references drills(id) on delete set null,
  name text not null default '',
  duration_min integer,
  group_index smallint,
  sort_order integer not null default 0
);
create index practice_items_practice_idx on practice_items(practice_id);
create index practice_items_parent_idx on practice_items(parent_item_id);
