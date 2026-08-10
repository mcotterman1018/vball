import { notFound, redirect } from "next/navigation";
import { getOrgContext, getTeamHeader } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { TeamHubClient } from "./TeamHubClient";

export default async function TeamPage({ params }: PageProps<"/app/team/[teamId]">) {
  const { teamId } = await params;
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");

  const header = await getTeamHeader(teamId);
  if (!header) notFound();

  const supabase = await createClient();
  const [{ data: players }, { data: games }, { data: matches }, { data: books }] = await Promise.all([
    supabase
      .from("players")
      .select("id, jersey_num, name, position, is_libero")
      .eq("team_id", teamId)
      .order("sort_order"),
    supabase
      .from("games")
      .select("id, opponent, home_away, game_date")
      .eq("team_id", teamId)
      .order("game_date"),
    supabase
      .from("matches")
      .select("id, match_date, home_team_name, away_team_name, status, match_sets(set_number, home_score, away_score)")
      .eq("team_id", teamId)
      .eq("status", "completed")
      .order("match_date", { ascending: false })
      .limit(5),
    supabase
      .from("scorebooks")
      .select("id, home_team, away_team, created_at, scorebook_sets(set_number, home_score, away_score)")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // Sibling teams in the same level (for importing their schedules).
  const { data: siblingRows } = await supabase
    .from("teams")
    .select("id, name, games(id, opponent, home_away, game_date)")
    .eq("level_id", header.levelId)
    .neq("id", teamId)
    .order("sort_order");

  const siblingTeams = (siblingRows || []).map((t) => ({
    id: t.id,
    name: t.name,
    games: [...((t.games as { id: string; opponent: string; home_away: "Home" | "Away"; game_date: string }[]) || [])].sort(
      (a, b) => (a.game_date || "").localeCompare(b.game_date || "")
    ),
  }));

  return (
    <TeamHubClient
      header={header}
      userName={ctx.userName}
      players={players || []}
      games={games || []}
      matches={(matches || []) as never[]}
      scorebooks={(books || []) as never[]}
      siblingTeams={siblingTeams}
    />
  );
}
