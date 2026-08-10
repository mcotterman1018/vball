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

// ── Drill library (org-scoped) ──

export async function createDrill(
  orgId: string,
  teamId: string,
  data: {
    name: string;
    category: string;
    duration_min: number;
    description: string;
    focus: string;
    video_url?: string;
  }
) {
  const { supabase } = await sb();
  const { error } = await supabase.from("drills").insert({ org_id: orgId, ...data });
  if (error) throw new Error(error.message);
  revalidatePath(`/app/team/${teamId}/practice`);
}

export async function updateDrill(
  teamId: string,
  drillId: string,
  data: Partial<{
    name: string;
    category: string;
    duration_min: number;
    description: string;
    focus: string;
    video_url: string;
  }>
) {
  const { supabase } = await sb();
  const { error } = await supabase.from("drills").update(data).eq("id", drillId);
  if (error) throw new Error(error.message);
  revalidatePath(`/app/team/${teamId}/practice`);
}

export async function deleteDrill(teamId: string, drillId: string) {
  const { supabase } = await sb();
  await supabase.from("drills").delete().eq("id", drillId);
  revalidatePath(`/app/team/${teamId}/practice`);
}

// ── Practices ──

export type PlanItemInput = {
  type: "drill" | "block" | "header" | "parallel";
  drillId: string | null;
  name: string;
  durationMin: number | null;
  groupIndex: number | null;
  children?: PlanItemInput[];
};

export async function savePractice(
  teamId: string,
  practiceId: string | null,
  meta: { title: string; practiceDate: string | null; durationMin: number; notes: string },
  items: PlanItemInput[]
): Promise<string> {
  const { supabase, user } = await sb();

  let id = practiceId;
  if (id) {
    const { error } = await supabase
      .from("practices")
      .update({
        title: meta.title,
        practice_date: meta.practiceDate,
        duration_min: meta.durationMin,
        notes: meta.notes,
      })
      .eq("id", id);
    if (error) throw new Error(error.message);
    // Replace items wholesale (simplest correct approach for a small plan).
    await supabase.from("practice_items").delete().eq("practice_id", id);
  } else {
    const { data, error } = await supabase
      .from("practices")
      .insert({
        team_id: teamId,
        title: meta.title,
        practice_date: meta.practiceDate,
        duration_min: meta.durationMin,
        notes: meta.notes,
        created_by: user.id,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    id = data.id as string;
  }

  // Flatten items into rows, preserving order + parent links.
  let sort = 0;
  for (const item of items) {
    const { data: parent, error } = await supabase
      .from("practice_items")
      .insert({
        practice_id: id,
        parent_item_id: null,
        type: item.type,
        drill_id: item.drillId,
        name: item.name,
        duration_min: item.durationMin,
        group_index: item.groupIndex,
        sort_order: sort++,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    if (item.children && item.children.length) {
      let childSort = 0;
      for (const child of item.children) {
        const { error: cErr } = await supabase.from("practice_items").insert({
          practice_id: id,
          parent_item_id: parent.id,
          type: child.type,
          drill_id: child.drillId,
          name: child.name,
          duration_min: child.durationMin,
          group_index: child.groupIndex,
          sort_order: childSort++,
        });
        if (cErr) throw new Error(cErr.message);
      }
    }
  }

  revalidatePath(`/app/team/${teamId}/practice`);
  return id;
}

export async function deletePractice(teamId: string, practiceId: string) {
  const { supabase } = await sb();
  await supabase.from("practices").delete().eq("id", practiceId);
  revalidatePath(`/app/team/${teamId}/practice`);
}
