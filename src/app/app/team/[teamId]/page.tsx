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
  const [{ data: players }, { data: games }, { data: matches }] = await Promise.all([
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
  ]);

  return (
    <TeamHubClient
      header={header}
      userName={ctx.userName}
      players={players || []}
      games={games || []}
      matches={(matches || []) as never[]}
    />
  );
}
