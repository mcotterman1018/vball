"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  return { supabase, user };
}

export async function addLevel(orgId: string, name: string) {
  const { supabase } = await requireUser();
  const { data: existing } = await supabase.from("levels").select("sort_order").eq("org_id", orgId);
  const nextOrder = Math.max(0, ...(existing || []).map((l) => l.sort_order + 1));
  const { error } = await supabase
    .from("levels")
    .insert({ org_id: orgId, name, sort_order: nextOrder });
  if (error) throw new Error(error.message);
  revalidatePath("/app");
}

export async function addTeam(levelId: string, name: string) {
  const { supabase } = await requireUser();
  const { data: existing } = await supabase.from("teams").select("sort_order").eq("level_id", levelId);
  const nextOrder = Math.max(0, ...(existing || []).map((t) => t.sort_order + 1));
  const { error } = await supabase
    .from("teams")
    .insert({ level_id: levelId, name, sort_order: nextOrder });
  if (error) throw new Error(error.message);
  revalidatePath("/app");
}

export async function toggleFavorite(teamId: string, currentlyFav: boolean) {
  const { supabase, user } = await requireUser();
  if (currentlyFav) {
    await supabase.from("team_favorites").delete().eq("user_id", user.id).eq("team_id", teamId);
  } else {
    await supabase.from("team_favorites").insert({ user_id: user.id, team_id: teamId });
  }
  revalidatePath("/app");
}

export async function toggleCoachLevel(coachId: string, levelId: string, assigned: boolean) {
  const { supabase } = await requireUser();
  if (assigned) {
    await supabase.from("level_coaches").delete().eq("user_id", coachId).eq("level_id", levelId);
  } else {
    await supabase.from("level_coaches").insert({ user_id: coachId, level_id: levelId });
  }
  revalidatePath("/app");
}

export async function signOut() {
  const { supabase } = await requireUser();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}

// ── Bookkeeper links (account-less, level-scoped scorebook access) ──

export async function createBookkeeperLink(levelId: string, label: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("create_bookkeeper_link", {
    p_level_id: levelId,
    p_label: label || "",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/app");
}

export async function revokeBookkeeperLink(linkId: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("bookkeeper_links").update({ active: false }).eq("id", linkId);
  if (error) throw new Error(error.message);
  revalidatePath("/app");
}
