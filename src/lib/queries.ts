import { createClient } from "@/lib/supabase/server";

export type Role = "admin" | "coach";

export type OrgContext = {
  userId: string;
  userName: string;
  userEmail: string;
  orgId: string;
  orgName: string;
  orgCode: string;
  role: Role;
  myLevelIds: string[];
  favoriteTeamIds: string[];
};

export type TeamLite = { id: string; name: string; sort_order: number; playerCount: number };
export type LevelWithTeams = { id: string; name: string; sort_order: number; teams: TeamLite[] };

// Resolve the signed-in user's org membership + profile. Returns null if not
// signed in or not a member of any org.
export async function getOrgContext(): Promise<OrgContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from("org_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (!membership) return null;

  const [{ data: org }, { data: profile }, { data: levelCoaches }, { data: favorites }] =
    await Promise.all([
      supabase.from("organizations").select("name, code").eq("id", membership.org_id).maybeSingle(),
      supabase.from("profiles").select("full_name, email").eq("id", user.id).maybeSingle(),
      supabase.from("level_coaches").select("level_id").eq("user_id", user.id),
      supabase.from("team_favorites").select("team_id").eq("user_id", user.id),
    ]);

  return {
    userId: user.id,
    userName: profile?.full_name || "",
    userEmail: profile?.email || user.email || "",
    orgId: membership.org_id,
    orgName: org?.name || "",
    orgCode: org?.code || "",
    role: membership.role as Role,
    myLevelIds: (levelCoaches || []).map((r) => r.level_id),
    favoriteTeamIds: (favorites || []).map((r) => r.team_id),
  };
}

export async function getLevelsWithTeams(orgId: string): Promise<LevelWithTeams[]> {
  const supabase = await createClient();
  const { data: levels } = await supabase
    .from("levels")
    .select("id, name, sort_order")
    .eq("org_id", orgId)
    .order("sort_order");
  if (!levels || levels.length === 0) return [];

  const levelIds = levels.map((l) => l.id);
  const { data: teams } = await supabase
    .from("teams")
    .select("id, name, sort_order, level_id, players(count)")
    .in("level_id", levelIds)
    .order("sort_order");

  return levels.map((lv) => ({
    id: lv.id,
    name: lv.name,
    sort_order: lv.sort_order,
    teams: (teams || [])
      .filter((t) => t.level_id === lv.id)
      .map((t) => ({
        id: t.id,
        name: t.name,
        sort_order: t.sort_order,
        // players(count) comes back as [{ count: N }]
        playerCount: Array.isArray(t.players) ? (t.players[0]?.count ?? 0) : 0,
      })),
  }));
}

export type Coach = { id: string; name: string; email: string; levelIds: string[] };

export async function getCoaches(orgId: string): Promise<Coach[]> {
  const supabase = await createClient();
  const { data: members } = await supabase
    .from("org_members")
    .select("user_id, role, profiles(full_name, email)")
    .eq("org_id", orgId);
  if (!members) return [];

  const userIds = members.map((m) => m.user_id);
  const { data: levelCoaches } = await supabase
    .from("level_coaches")
    .select("user_id, level_id")
    .in("user_id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);

  return members.map((m) => {
    const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
    return {
      id: m.user_id,
      name: profile?.full_name || "",
      email: profile?.email || "",
      levelIds: (levelCoaches || []).filter((lc) => lc.user_id === m.user_id).map((lc) => lc.level_id),
    };
  });
}

// Verify the signed-in user can access a team; returns team + level + org names.
export async function getTeamHeader(teamId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("teams")
    .select("id, name, level_id, levels(id, name, org_id, organizations(name))")
    .eq("id", teamId)
    .maybeSingle();
  if (!data) return null;
  const level = Array.isArray(data.levels) ? data.levels[0] : data.levels;
  const org = level && (Array.isArray(level.organizations) ? level.organizations[0] : level.organizations);
  return {
    teamId: data.id,
    teamName: data.name,
    levelId: level?.id ?? "",
    levelName: level?.name ?? "",
    orgId: level?.org_id ?? "",
    orgName: org?.name ?? "",
  };
}
