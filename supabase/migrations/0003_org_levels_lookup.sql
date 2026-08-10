-- Lets a signed-in user (not yet a member) see an org's levels by invite
-- code, so the "join org" screen can offer a level picker before joining.
create or replace function public.get_org_levels_by_code(org_code text)
returns table(id uuid, name text)
language sql security definer set search_path = public stable as $$
  select l.id, l.name
  from levels l
  join organizations o on o.id = l.org_id
  where o.code = upper(org_code)
  order by l.sort_order;
$$;
grant execute on function public.get_org_levels_by_code(text) to authenticated;
