import { redirect } from "next/navigation";
import { getOrgContext, getLevelsWithTeams, getCoaches } from "@/lib/queries";
import { TeamHomeClient } from "./TeamHomeClient";

export default async function AppHome() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");

  const [levels, coaches] = await Promise.all([
    getLevelsWithTeams(ctx.orgId),
    ctx.role === "admin" ? getCoaches(ctx.orgId) : Promise.resolve([]),
  ]);

  return <TeamHomeClient ctx={ctx} levels={levels} coaches={coaches} />;
}
