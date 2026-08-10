import { notFound, redirect } from "next/navigation";
import { getOrgContext, getTeamHeader } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { SeasonStatsClient, type MatchSummary, type PlayerRow } from "./SeasonStatsClient";
import type { StatCounts } from "@/lib/stats";

export default async function SeasonPage({ params }: PageProps<"/app/team/[teamId]/season">) {
  const { teamId } = await params;
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");

  const header = await getTeamHeader(teamId);
  if (!header) notFound();

  const supabase = await createClient();

  const [{ data: players }, { data: matches }] = await Promise.all([
    supabase
      .from("players")
      .select("id, jersey_num, name, position, is_libero")
      .eq("team_id", teamId)
      .order("sort_order"),
    supabase
      .from("matches")
      .select("id, match_date, home_team_name, away_team_name, match_sets(set_number, home_score, away_score)")
      .eq("team_id", teamId)
      .eq("status", "completed")
      .order("match_date"),
  ]);

  const matchIds = (matches || []).map((m) => m.id);

  // Pull all events for the team's matches, then aggregate in memory.
  const { data: events } = matchIds.length
    ? await supabase
        .from("match_stat_events")
        .select("match_id, player_id, stat_key")
        .in("match_id", matchIds)
    : { data: [] };

  // events[matchId][playerId][statKey] = count
  const byMatch: Record<string, Record<string, StatCounts>> = {};
  for (const ev of events || []) {
    (byMatch[ev.match_id] ??= {});
    (byMatch[ev.match_id][ev.player_id] ??= {});
    byMatch[ev.match_id][ev.player_id][ev.stat_key] =
      (byMatch[ev.match_id][ev.player_id][ev.stat_key] || 0) + 1;
  }

  const matchSummaries: MatchSummary[] = (matches || []).map((m) => {
    const sets = [...(m.match_sets || [])].sort((a, b) => a.set_number - b.set_number);
    const homeWins = sets.filter((s) => s.home_score > s.away_score).length;
    const awayWins = sets.filter((s) => s.away_score > s.home_score).length;
    // Aggregate all this team's players for the match total row.
    const teamTotal: StatCounts = {};
    const perPlayer = byMatch[m.id] || {};
    for (const pid of Object.keys(perPlayer)) {
      for (const k of Object.keys(perPlayer[pid])) {
        teamTotal[k] = (teamTotal[k] || 0) + perPlayer[pid][k];
      }
    }
    return {
      id: m.id,
      date: m.match_date,
      homeTeam: m.home_team_name,
      awayTeam: m.away_team_name,
      setCount: sets.length,
      won: homeWins > awayWins,
      scoreline: sets.map((s) => `${s.home_score}-${s.away_score}`).join(", "),
      teamTotal,
    };
  });

  const playerRows: PlayerRow[] = (players || []).map((p) => {
    const perMatch: { matchId: string; counts: StatCounts }[] = [];
    for (const m of matches || []) {
      const c = byMatch[m.id]?.[p.id];
      if (c && Object.keys(c).length) perMatch.push({ matchId: m.id, counts: c });
    }
    const total: StatCounts = {};
    for (const pm of perMatch) {
      for (const k of Object.keys(pm.counts)) total[k] = (total[k] || 0) + pm.counts[k];
    }
    return {
      id: p.id,
      jersey: p.jersey_num,
      name: p.name,
      position: p.position,
      isLibero: p.is_libero,
      gamesPlayed: perMatch.length,
      total,
      perMatch,
    };
  });

  const totalSets = matchSummaries.reduce((n, m) => n + m.setCount, 0);

  return (
    <SeasonStatsClient
      teamId={teamId}
      teamName={header.teamName}
      matches={matchSummaries}
      players={playerRows}
      totalSets={totalSets}
    />
  );
}
