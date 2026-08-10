-- Account-less "bookkeeper" access: a coach generates a private, level-scoped
-- link (bearer token). Anyone with the link can keep scorebooks for that
-- level's teams — no login. All access goes through SECURITY DEFINER RPCs that
-- validate the token, so the anon key alone can't touch anything else.

create table bookkeeper_links (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  level_id uuid not null references levels(id) on delete cascade,
  token text not null unique,
  label text not null default '',
  active boolean not null default true,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index bookkeeper_links_level_idx on bookkeeper_links(level_id);
alter table bookkeeper_links enable row level security;

-- Coaches with access to the level (and org admins) manage its links.
create policy "bk_links_manage" on bookkeeper_links for all
  using (has_level_access(level_id)) with check (has_level_access(level_id));

-- ── Coach-side: create a link (generates a strong token, checks authorization) ──
create or replace function public.create_bookkeeper_link(p_level_id uuid, p_label text default '')
returns bookkeeper_links language plpgsql security definer set search_path = public as $$
declare
  lvl levels;
  new_link bookkeeper_links;
begin
  select * into lvl from levels where id = p_level_id;
  if lvl.id is null then raise exception 'Level not found'; end if;
  if not has_level_access(p_level_id) then raise exception 'Not authorized for this level'; end if;

  -- Token = two UUIDs' hex (64 chars, ~244 bits). gen_random_uuid() is in
  -- Postgres core, so this avoids depending on pgcrypto's schema location.
  insert into bookkeeper_links (org_id, level_id, token, label, created_by)
  values (
    lvl.org_id, p_level_id,
    replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
    coalesce(p_label, ''), auth.uid()
  )
  returning * into new_link;
  return new_link;
end;
$$;
grant execute on function public.create_bookkeeper_link(uuid, text) to authenticated;

-- ── Bookkeeper-side (anon), all gated by a valid, active token ──

create or replace function public.bk_context(p_token text)
returns jsonb language plpgsql security definer set search_path = public stable as $$
declare
  lnk bookkeeper_links;
  lvl levels;
  org organizations;
  teams_json jsonb;
begin
  select * into lnk from bookkeeper_links where token = p_token and active;
  if lnk.id is null then return null; end if;
  select * into lvl from levels where id = lnk.level_id;
  select * into org from organizations where id = lnk.org_id;
  select coalesce(jsonb_agg(jsonb_build_object('id', t.id, 'name', t.name) order by t.sort_order, t.name), '[]')
    into teams_json from teams t where t.level_id = lnk.level_id;
  return jsonb_build_object('levelName', lvl.name, 'orgName', org.name, 'teams', teams_json);
end;
$$;
grant execute on function public.bk_context(text) to anon, authenticated;

create or replace function public.bk_games(p_token text)
returns jsonb language plpgsql security definer set search_path = public stable as $$
declare
  lnk bookkeeper_links;
  games_json jsonb;
begin
  select * into lnk from bookkeeper_links where token = p_token and active;
  if lnk.id is null then return '[]'::jsonb; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
      'id', g.id, 'teamId', g.team_id, 'teamName', t.name,
      'opponent', g.opponent, 'homeAway', g.home_away, 'gameDate', g.game_date
    ) order by g.game_date), '[]')
    into games_json
    from games g join teams t on t.id = g.team_id
    where t.level_id = lnk.level_id;
  return games_json;
end;
$$;
grant execute on function public.bk_games(text) to anon, authenticated;

create or replace function public.bk_roster(p_token text, p_team_id uuid)
returns jsonb language plpgsql security definer set search_path = public stable as $$
declare
  lnk bookkeeper_links;
  ok boolean;
  roster_json jsonb;
begin
  select * into lnk from bookkeeper_links where token = p_token and active;
  if lnk.id is null then return '[]'::jsonb; end if;
  select exists (select 1 from teams where id = p_team_id and level_id = lnk.level_id) into ok;
  if not ok then return '[]'::jsonb; end if;
  select coalesce(jsonb_agg(jsonb_build_object('num', p.jersey_num, 'name', p.name, 'lib', p.is_libero) order by p.sort_order), '[]')
    into roster_json from players p where p.team_id = p_team_id;
  return roster_json;
end;
$$;
grant execute on function public.bk_roster(text, uuid) to anon, authenticated;

create or replace function public.bk_save_scorebook(
  p_token text, p_team_id uuid, p_game_id uuid, p_home text, p_away text, p_format int, p_sets jsonb
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  lnk bookkeeper_links;
  ok boolean;
  book_id uuid;
  s jsonb;
  n int := 1;
begin
  select * into lnk from bookkeeper_links where token = p_token and active;
  if lnk.id is null then raise exception 'Invalid or revoked link'; end if;
  select exists (select 1 from teams where id = p_team_id and level_id = lnk.level_id) into ok;
  if not ok then raise exception 'Team not in this level'; end if;

  insert into scorebooks (team_id, game_id, home_team, away_team, format, created_by)
  values (p_team_id, p_game_id, coalesce(p_home, ''), coalesce(p_away, ''), coalesce(p_format, 3), null)
  returning id into book_id;

  for s in select * from jsonb_array_elements(coalesce(p_sets, '[]'::jsonb)) loop
    insert into scorebook_sets (
      scorebook_id, set_number, home_score, away_score,
      home_line, away_line, home_libero, away_libero,
      home_grid, away_grid, home_circled, away_circled,
      point_log, sub_log, timeout_log
    ) values (
      book_id,
      coalesce((s->>'setNumber')::int, n),
      coalesce((s->>'homeScore')::int, 0),
      coalesce((s->>'awayScore')::int, 0),
      coalesce(s->'homeLine', '["","","","","",""]'::jsonb),
      coalesce(s->'awayLine', '["","","","","",""]'::jsonb),
      coalesce(s->>'homeLibero', ''),
      coalesce(s->>'awayLibero', ''),
      coalesce(s->'homeGrid', '[[],[],[],[],[],[]]'::jsonb),
      coalesce(s->'awayGrid', '[[],[],[],[],[],[]]'::jsonb),
      coalesce(s->'homeCircled', '[[],[],[],[],[],[]]'::jsonb),
      coalesce(s->'awayCircled', '[[],[],[],[],[],[]]'::jsonb),
      coalesce(s->'pointLog', '[]'::jsonb),
      coalesce(s->'subLog', '[]'::jsonb),
      coalesce(s->'timeoutLog', '[]'::jsonb)
    );
    n := n + 1;
  end loop;

  return book_id;
end;
$$;
grant execute on function public.bk_save_scorebook(text, uuid, uuid, text, text, int, jsonb) to anon, authenticated;
