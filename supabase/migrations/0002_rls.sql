-- Row Level Security: org-scoped access, restricted to a coach's assigned
-- levels (admins see everything in their org).

alter table profiles enable row level security;
alter table organizations enable row level security;
alter table org_members enable row level security;
alter table levels enable row level security;
alter table level_coaches enable row level security;
alter table teams enable row level security;
alter table team_favorites enable row level security;
alter table players enable row level security;
alter table games enable row level security;
alter table matches enable row level security;
alter table match_sets enable row level security;
alter table match_stat_events enable row level security;
alter table custom_stat_defs enable row level security;
alter table scorebooks enable row level security;
alter table scorebook_sets enable row level security;
alter table drills enable row level security;
alter table practices enable row level security;
alter table practice_items enable row level security;

-- ────────────────────────────────────────────────────────────────
-- Helper functions (security definer: owned by postgres, bypasses RLS
-- internally so policies don't recurse on themselves).
-- ────────────────────────────────────────────────────────────────

create or replace function public.is_org_member(target_org_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from org_members
    where org_id = target_org_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_org_admin(target_org_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from org_members
    where org_id = target_org_id and user_id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.has_level_access(target_level_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select
    exists (
      select 1 from level_coaches
      where level_id = target_level_id and user_id = auth.uid()
    )
    or exists (
      select 1 from levels l
      where l.id = target_level_id and is_org_admin(l.org_id)
    );
$$;

create or replace function public.has_team_access(target_team_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select has_level_access(level_id) from teams where id = target_team_id;
$$;

create or replace function public.has_match_access(target_match_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select has_team_access(team_id) from matches where id = target_match_id;
$$;

create or replace function public.has_scorebook_access(target_scorebook_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select has_team_access(team_id) from scorebooks where id = target_scorebook_id;
$$;

create or replace function public.has_practice_access(target_practice_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select has_team_access(team_id) from practices where id = target_practice_id;
$$;

-- ────────────────────────────────────────────────────────────────
-- profiles
-- ────────────────────────────────────────────────────────────────

create policy "profiles_select_self_or_org_peer" on profiles for select
  using (
    id = auth.uid()
    or exists (
      select 1 from org_members m1
      join org_members m2 on m1.org_id = m2.org_id
      where m1.user_id = auth.uid() and m2.user_id = profiles.id
    )
  );

create policy "profiles_update_self" on profiles for update
  using (id = auth.uid());

-- ────────────────────────────────────────────────────────────────
-- organizations (name + join code are intentionally shareable/lookup-able)
-- ────────────────────────────────────────────────────────────────

create policy "organizations_select_any_authenticated" on organizations for select
  to authenticated using (true);

create policy "organizations_update_admin" on organizations for update
  using (is_org_admin(id));

-- inserts happen through create_organization(); no direct client insert policy.

-- ────────────────────────────────────────────────────────────────
-- org_members
-- ────────────────────────────────────────────────────────────────

create policy "org_members_select_peers" on org_members for select
  using (is_org_member(org_id));

create policy "org_members_update_admin" on org_members for update
  using (is_org_admin(org_id));

create policy "org_members_delete_admin_or_self" on org_members for delete
  using (is_org_admin(org_id) or user_id = auth.uid());

-- inserts happen through create_organization()/join_organization().

-- ────────────────────────────────────────────────────────────────
-- levels / level_coaches / teams / team_favorites
-- ────────────────────────────────────────────────────────────────

create policy "levels_select_members" on levels for select
  using (is_org_member(org_id));

create policy "levels_write_admin" on levels for all
  using (is_org_admin(org_id)) with check (is_org_admin(org_id));

create policy "level_coaches_select_members" on level_coaches for select
  using (exists (select 1 from levels l where l.id = level_id and is_org_member(l.org_id)));

create policy "level_coaches_write_admin" on level_coaches for all
  using (exists (select 1 from levels l where l.id = level_id and is_org_admin(l.org_id)))
  with check (exists (select 1 from levels l where l.id = level_id and is_org_admin(l.org_id)));

create policy "teams_select_accessible" on teams for select
  using (has_level_access(level_id));

create policy "teams_write_admin" on teams for all
  using (exists (select 1 from levels l where l.id = level_id and is_org_admin(l.org_id)))
  with check (exists (select 1 from levels l where l.id = level_id and is_org_admin(l.org_id)));

create policy "team_favorites_own" on team_favorites for all
  using (user_id = auth.uid() and has_team_access(team_id))
  with check (user_id = auth.uid() and has_team_access(team_id));

-- ────────────────────────────────────────────────────────────────
-- players / games
-- ────────────────────────────────────────────────────────────────

create policy "players_all_accessible" on players for all
  using (has_team_access(team_id)) with check (has_team_access(team_id));

create policy "games_all_accessible" on games for all
  using (has_team_access(team_id)) with check (has_team_access(team_id));

-- ────────────────────────────────────────────────────────────────
-- matches / match_sets / match_stat_events
-- ────────────────────────────────────────────────────────────────

create policy "matches_all_accessible" on matches for all
  using (has_team_access(team_id)) with check (has_team_access(team_id));

create policy "match_sets_all_accessible" on match_sets for all
  using (has_match_access(match_id)) with check (has_match_access(match_id));

create policy "match_stat_events_all_accessible" on match_stat_events for all
  using (has_match_access(match_id)) with check (has_match_access(match_id));

-- ────────────────────────────────────────────────────────────────
-- custom_stat_defs / drills (org-wide)
-- ────────────────────────────────────────────────────────────────

create policy "custom_stat_defs_all_members" on custom_stat_defs for all
  using (is_org_member(org_id)) with check (is_org_member(org_id));

create policy "drills_all_members" on drills for all
  using (is_org_member(org_id)) with check (is_org_member(org_id));

-- ────────────────────────────────────────────────────────────────
-- scorebooks / scorebook_sets
-- ────────────────────────────────────────────────────────────────

create policy "scorebooks_all_accessible" on scorebooks for all
  using (has_team_access(team_id)) with check (has_team_access(team_id));

create policy "scorebook_sets_all_accessible" on scorebook_sets for all
  using (has_scorebook_access(scorebook_id)) with check (has_scorebook_access(scorebook_id));

-- ────────────────────────────────────────────────────────────────
-- practices / practice_items
-- ────────────────────────────────────────────────────────────────

create policy "practices_all_accessible" on practices for all
  using (has_team_access(team_id)) with check (has_team_access(team_id));

create policy "practice_items_all_accessible" on practice_items for all
  using (has_practice_access(practice_id)) with check (has_practice_access(practice_id));

-- ────────────────────────────────────────────────────────────────
-- New-user profile provisioning
-- ────────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ────────────────────────────────────────────────────────────────
-- Org create/join RPCs (atomically create/join + membership row)
-- ────────────────────────────────────────────────────────────────

create or replace function public.create_organization(org_name text, org_code text)
returns organizations language plpgsql security definer set search_path = public as $$
declare
  new_org organizations;
begin
  insert into organizations (name, code, created_by)
  values (org_name, upper(org_code), auth.uid())
  returning * into new_org;

  insert into org_members (org_id, user_id, role)
  values (new_org.id, auth.uid(), 'admin');

  insert into drills (org_id, name, category, duration_min, description, focus, is_default)
  values
    (new_org.id, 'Pepper', 'Warmup', 10, 'Partners pass-set-hit in sequence', 'Ball control', true),
    (new_org.id, 'Butterfly Passing', 'Passing', 12, 'Continuous serve receive with rotation', 'Serve receive', true),
    (new_org.id, 'Queen of the Court', 'Game Play', 15, 'Winners stay, losers rotate off', 'Competitive play', true),
    (new_org.id, 'Serving Lines', 'Serving', 10, 'Targets on court, players serve to zones 1-5', 'Serve accuracy', true),
    (new_org.id, 'Block-Hit-Cover', 'Blocking', 12, '3-person blocking drill with transition to attack', 'Block footwork', true),
    (new_org.id, 'Triangle Setting', 'Setting', 10, 'Setter works triangle: outside-middle-right side', 'Set accuracy', true),
    (new_org.id, 'Dig & Dive', 'Defense', 10, 'Coach-driven balls, players dig and recover', 'Defensive technique', true),
    (new_org.id, '6v6 Wash Drill', 'Game Play', 20, '3-rally wash: serve receive, free ball, down ball', 'Transition', true),
    (new_org.id, 'Hitting Lines', 'Attacking', 12, 'Setters feed hitters from left, middle, right', 'Approach & swing', true),
    (new_org.id, 'Serve Receive to Attack', 'Passing', 15, 'Full pass-set-hit sequence off live serve', 'First ball sideout', true),
    (new_org.id, 'Shuttle Footwork', 'Warmup', 8, 'Lateral shuffle, crossover, sprint patterns', 'Footwork', true),
    (new_org.id, 'Free Ball Transition', 'Game Play', 12, 'Coach sends free ball, team runs full offense', 'Offensive system', true),
    (new_org.id, 'Jousting Drill', 'Blocking', 8, 'Partners at net press ball simultaneously', 'Net play', true),
    (new_org.id, 'Pass & Move', 'Passing', 10, 'Pass then immediately move to next position', 'Movement after contact', true),
    (new_org.id, 'Team Serve & Receive', 'Serving', 15, 'Full team serve receive with scoring system', 'Pressure serving', true);

  return new_org;
end;
$$;
grant execute on function public.create_organization(text, text) to authenticated;

create or replace function public.join_organization(org_code text, join_level_id uuid default null)
returns organizations language plpgsql security definer set search_path = public as $$
declare
  target_org organizations;
begin
  select * into target_org from organizations where code = upper(org_code);
  if target_org.id is null then
    raise exception 'Organization not found';
  end if;

  insert into org_members (org_id, user_id, role)
  values (target_org.id, auth.uid(), 'coach')
  on conflict (org_id, user_id) do nothing;

  if join_level_id is not null then
    insert into level_coaches (level_id, user_id)
    values (join_level_id, auth.uid())
    on conflict do nothing;
  end if;

  return target_org;
end;
$$;
grant execute on function public.join_organization(text, uuid) to authenticated;
