import { notFound, redirect } from "next/navigation";
import { getOrgContext, getTeamHeader } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { ScorebookClient } from "./ScorebookClient";

export default async function ScorebookPage({
  params,
  searchParams,
}: PageProps<"/app/team/[teamId]/scorebook">) {
  const { teamId } = await params;
  const { gameId } = await searchParams;
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");

  const header = await getTeamHeader(teamId);
  if (!header) notFound();

  const supabase = await createClient();
  const { data: players } = await supabase
    .from("players")
    .select("jersey_num, name, is_libero")
    .eq("team_id", teamId)
    .order("sort_order");

  type Game = { id: string; opponent: string; home_away: "Home" | "Away" };
  let game: Game | null = null;
  const gameIdStr = typeof gameId === "string" ? gameId : null;
  if (gameIdStr) {
    const { data } = await supabase
      .from("games")
      .select("id, opponent, home_away")
      .eq("id", gameIdStr)
      .maybeSingle();
    game = (data as Game | null) ?? null;
  }

  const teamFullName = [header.orgName, header.teamName].filter(Boolean).join(" ");
  const homeName = game ? (game.home_away === "Home" ? teamFullName : game.opponent) : teamFullName;
  const awayName = game ? (game.home_away === "Home" ? game.opponent : teamFullName) : "Away";

  return (
    <ScorebookClient
      teamId={teamId}
      gameId={game?.id ?? null}
      initialHome={homeName}
      initialAway={awayName}
      roster={(players || []).map((p) => ({ num: p.jersey_num, name: p.name, lib: p.is_libero }))}
    />
  );
}
