"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function sb() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  return { supabase, user };
}

export type SaveMatchInput = {
  teamId: string;
  gameId: string | null;
  matchDate: string;
  homeTeamName: string;
  awayTeamName: string;
  sets: { setNumber: number; homeScore: number; awayScore: number }[];
  // Flattened stat events: one entry per tap.
  events: { playerId: string; statKey: string }[];
};

// Persist a completed match: the match row, its sets, and every stat event.
export async function saveMatch(input: SaveMatchInput): Promise<string> {
  const { supabase, user } = await sb();

  const { data: match, error: matchErr } = await supabase
    .from("matches")
    .insert({
      team_id: input.teamId,
      game_id: input.gameId,
      match_date: input.matchDate,
      home_team_name: input.homeTeamName,
      away_team_name: input.awayTeamName,
      status: "completed",
      created_by: user.id,
    })
    .select("id")
    .single();
  if (matchErr) throw new Error(matchErr.message);

  const matchId = match.id as string;

  if (input.sets.length > 0) {
    const { error: setsErr } = await supabase.from("match_sets").insert(
      input.sets.map((s) => ({
        match_id: matchId,
        set_number: s.setNumber,
        home_score: s.homeScore,
        away_score: s.awayScore,
      }))
    );
    if (setsErr) throw new Error(setsErr.message);
  }

  if (input.events.length > 0) {
    // Chunk inserts to stay well under any payload limits on long matches.
    const chunkSize = 500;
    for (let i = 0; i < input.events.length; i += chunkSize) {
      const chunk = input.events.slice(i, i + chunkSize).map((e) => ({
        match_id: matchId,
        player_id: e.playerId,
        stat_key: e.statKey,
      }));
      const { error: evErr } = await supabase.from("match_stat_events").insert(chunk);
      if (evErr) throw new Error(evErr.message);
    }
  }

  revalidatePath(`/app/team/${input.teamId}`);
  revalidatePath(`/app/team/${input.teamId}/season`);
  return matchId;
}
