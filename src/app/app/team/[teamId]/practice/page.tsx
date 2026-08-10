import { notFound, redirect } from "next/navigation";
import { getOrgContext, getTeamHeader } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { PracticeClient, type Drill, type PracticeSummary } from "./PracticeClient";

export default async function PracticePage({ params }: PageProps<"/app/team/[teamId]/practice">) {
  const { teamId } = await params;
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");

  const header = await getTeamHeader(teamId);
  if (!header) notFound();

  const supabase = await createClient();
  const [{ data: drills }, { data: practices }, { data: items }] = await Promise.all([
    supabase
      .from("drills")
      .select("id, name, category, duration_min, description, focus, video_url, is_default")
      .eq("org_id", ctx.orgId)
      .order("name"),
    supabase
      .from("practices")
      .select("id, title, practice_date, duration_min, notes")
      .eq("team_id", teamId)
      .order("practice_date", { ascending: false }),
    supabase
      .from("practice_items")
      .select("id, practice_id, parent_item_id, type, drill_id, name, duration_min, group_index, sort_order")
      .in(
        "practice_id",
        // subquery-ish: fetch items for this team's practices
        (
          await supabase.from("practices").select("id").eq("team_id", teamId)
        ).data?.map((p) => p.id) ?? ["00000000-0000-0000-0000-000000000000"]
      ),
  ]);

  const practiceSummaries: PracticeSummary[] = (practices || []).map((p) => {
    const myItems = (items || [])
      .filter((it) => it.practice_id === p.id)
      .sort((a, b) => a.sort_order - b.sort_order);
    const topItems = myItems.filter((it) => !it.parent_item_id);
    return {
      id: p.id,
      title: p.title,
      practiceDate: p.practice_date,
      durationMin: p.duration_min,
      notes: p.notes,
      itemCount: topItems.length,
      items: myItems.map((it) => ({
        id: it.id,
        parentId: it.parent_item_id,
        type: it.type,
        drillId: it.drill_id,
        name: it.name,
        durationMin: it.duration_min,
        groupIndex: it.group_index,
        sortOrder: it.sort_order,
      })),
    };
  });

  return (
    <PracticeClient
      teamId={teamId}
      orgId={ctx.orgId}
      drills={(drills || []) as Drill[]}
      practices={practiceSummaries}
    />
  );
}
