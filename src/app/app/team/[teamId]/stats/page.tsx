import { notFound, redirect } from "next/navigation";
import { getOrgContext, getTeamHeader } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { StatsTrackerClient } from "./StatsTrackerClient";

export default async function StatsPage({
  params,
  searchParams,
}: PageProps<"/app/team/[teamId]/stats">) {
  const { teamId } = await params;
  const { gameId } = await searchParams;
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");

  const header = await getTeamHeader(teamId);
  if (!header) notFound();

  const supabase = await createClient();
  const { data: players } = await supabase
    .from("players")
    .select("id, jersey_num, name, position, is_libero")
    .eq("team_id", teamId)
    .order("sort_order");

  // Resolve opponent / home-away from the linked game, if any.
  type Game = { id: string; opponent: string; home_away: "Home" | "Away"; game_date: string };
  let game: Game | null = null;
  const gameIdStr = typeof gameId === "string" ? gameId : null;
  if (gameIdStr) {
    const { data } = await supabase
      .from("games")
      .select("id, opponent, home_away, game_date")
      .eq("id", gameIdStr)
      .maybeSingle();
    game = (data as Game | null) ?? null;
  }

  const teamFullName = [header.orgName, header.teamName].filter(Boolean).join(" ");
  const homeName = game ? (game.home_away === "Home" ? teamFullName : game.opponent) : teamFullName;
  const awayName = game ? (game.home_away === "Home" ? game.opponent : teamFullName) : "Opponent";

  return (
    <StatsTrackerClient
      teamId={teamId}
      teamName={header.teamName}
      players={players || []}
      gameId={game?.id ?? null}
      matchDate={game?.game_date ?? new Date().toISOString().slice(0, 10)}
      initialHomeName={homeName}
      initialAwayName={awayName}
    />
  );
}
