import { notFound, redirect } from "next/navigation";
import { getOrgContext, getTeamHeader } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { ScorebookReview, type SavedSet } from "./ScorebookReview";

export default async function ScorebookReviewPage({
  params,
}: {
  params: Promise<{ teamId: string; bookId: string }>;
}) {
  const { teamId, bookId } = await params;
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");

  const header = await getTeamHeader(teamId);
  if (!header) notFound();

  const supabase = await createClient();
  const { data: book } = await supabase
    .from("scorebooks")
    .select(
      "id, team_id, home_team, away_team, format, created_at, scorebook_sets(set_number, home_score, away_score, home_line, away_line, home_libero, away_libero, home_grid, away_grid, home_circled, away_circled, sub_log, timeout_log)"
    )
    .eq("id", bookId)
    .eq("team_id", teamId)
    .maybeSingle();

  if (!book) notFound();

  const sets = ((book.scorebook_sets as SavedSet[]) || []).sort(
    (a, b) => a.set_number - b.set_number
  );

  return (
    <ScorebookReview
      teamId={teamId}
      homeTeam={book.home_team}
      awayTeam={book.away_team}
      createdAt={book.created_at}
      sets={sets}
    />
  );
}
