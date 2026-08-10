import { redirect } from "next/navigation";
import { getOrgContext, getLevelsWithTeams, getCoaches } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { TeamHomeClient, type BookkeeperLink } from "./TeamHomeClient";

export default async function AppHome() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");

  const supabase = await createClient();
  const [levels, coaches, { data: links }] = await Promise.all([
    getLevelsWithTeams(ctx.orgId),
    ctx.role === "admin" ? getCoaches(ctx.orgId) : Promise.resolve([]),
    supabase
      .from("bookkeeper_links")
      .select("id, level_id, token, label, active")
      .eq("org_id", ctx.orgId)
      .eq("active", true),
  ]);

  return (
    <TeamHomeClient
      ctx={ctx}
      levels={levels}
      coaches={coaches}
      bookkeeperLinks={(links || []) as BookkeeperLink[]}
    />
  );
}
