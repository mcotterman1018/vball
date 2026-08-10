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

export type ScorebookSetInput = {
  setNumber: number;
  homeScore: number;
  awayScore: number;
  homeLine: string[];
  awayLine: string[];
  homeLibero: string;
  awayLibero: string;
  homeGrid: (number | string)[][];
  awayGrid: (number | string)[][];
  homeCircled: number[][];
  awayCircled: number[][];
  pointLog: unknown[];
  subLog: unknown[];
  timeoutLog: unknown[];
};

export async function saveScorebook(input: {
  teamId: string;
  gameId: string | null;
  homeTeam: string;
  awayTeam: string;
  format: number;
  sets: ScorebookSetInput[];
}): Promise<string> {
  const { supabase, user } = await sb();

  const { data: book, error } = await supabase
    .from("scorebooks")
    .insert({
      team_id: input.teamId,
      game_id: input.gameId,
      home_team: input.homeTeam,
      away_team: input.awayTeam,
      format: input.format,
      created_by: user.id,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const bookId = book.id as string;

  if (input.sets.length > 0) {
    const { error: setsErr } = await supabase.from("scorebook_sets").insert(
      input.sets.map((s) => ({
        scorebook_id: bookId,
        set_number: s.setNumber,
        home_score: s.homeScore,
        away_score: s.awayScore,
        home_line: s.homeLine,
        away_line: s.awayLine,
        home_libero: s.homeLibero,
        away_libero: s.awayLibero,
        home_grid: s.homeGrid,
        away_grid: s.awayGrid,
        home_circled: s.homeCircled,
        away_circled: s.awayCircled,
        point_log: s.pointLog,
        sub_log: s.subLog,
        timeout_log: s.timeoutLog,
      }))
    );
    if (setsErr) throw new Error(setsErr.message);
  }

  revalidatePath(`/app/team/${input.teamId}`);
  return bookId;
}
