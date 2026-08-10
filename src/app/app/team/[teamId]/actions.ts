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

function rev(teamId: string) {
  revalidatePath(`/app/team/${teamId}`);
}

export async function addPlayer(teamId: string) {
  const { supabase } = await sb();
  const { data: players } = await supabase
    .from("players")
    .select("jersey_num, sort_order")
    .eq("team_id", teamId);
  const maxNum = Math.max(0, ...(players || []).map((p) => p.jersey_num || 0));
  const nextOrder = Math.max(0, ...(players || []).map((p) => p.sort_order + 1));
  const { data, error } = await supabase
    .from("players")
    .insert({ team_id: teamId, jersey_num: maxNum + 1, name: "", position: "", sort_order: nextOrder })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  rev(teamId);
  return data.id as string;
}

export async function updatePlayer(
  teamId: string,
  playerId: string,
  patch: { jersey_num?: number; name?: string; position?: string; is_libero?: boolean }
) {
  const { supabase } = await sb();
  const { error } = await supabase.from("players").update(patch).eq("id", playerId);
  if (error) throw new Error(error.message);
  rev(teamId);
}

// Libero is exclusive per team, matching the prototype's setLib behavior.
export async function setLibero(teamId: string, playerId: string, makeLibero: boolean) {
  const { supabase } = await sb();
  if (makeLibero) {
    await supabase.from("players").update({ is_libero: false }).eq("team_id", teamId);
    await supabase.from("players").update({ is_libero: true }).eq("id", playerId);
  } else {
    await supabase.from("players").update({ is_libero: false }).eq("id", playerId);
  }
  rev(teamId);
}

export async function removePlayer(teamId: string, playerId: string) {
  const { supabase } = await sb();
  const { error } = await supabase.from("players").delete().eq("id", playerId);
  if (error) throw new Error(error.message);
  rev(teamId);
}

export async function addGame(
  teamId: string,
  opponent: string,
  homeAway: "Home" | "Away",
  gameDate: string
) {
  const { supabase } = await sb();
  const { error } = await supabase.from("games").insert({
    team_id: teamId,
    opponent,
    home_away: homeAway,
    game_date: gameDate || new Date().toISOString().slice(0, 10),
  });
  if (error) throw new Error(error.message);
  rev(teamId);
}

export async function removeGame(teamId: string, gameId: string) {
  const { supabase } = await sb();
  await supabase.from("games").delete().eq("id", gameId);
  rev(teamId);
}
