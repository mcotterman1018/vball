"use client";

import { useRouter } from "next/navigation";
import { ScorebookClient } from "./ScorebookClient";
import { saveScorebook } from "./actions";
import type { ScorebookSavePayload } from "./types";

type RosterEntry = { num: number; name: string; lib: boolean };

// Authenticated coach/team scorebook: saves via the server action and returns
// to the team hub on exit.
export function TeamScorebookClient({
  teamId,
  gameId,
  initialHome,
  initialAway,
  roster,
  rosterSide,
}: {
  teamId: string;
  gameId: string | null;
  initialHome: string;
  initialAway: string;
  roster: RosterEntry[];
  rosterSide: "home" | "away";
}) {
  const router = useRouter();

  async function saveBook(payload: ScorebookSavePayload) {
    await saveScorebook({ teamId, gameId, ...payload });
  }

  function onExit() {
    router.push(`/app/team/${teamId}`);
    router.refresh();
  }

  return (
    <ScorebookClient
      storageKey={`courtiq:book:${teamId}:${gameId ?? "adhoc"}`}
      initialHome={initialHome}
      initialAway={initialAway}
      roster={roster}
      rosterSide={rosterSide}
      saveBook={saveBook}
      onExit={onExit}
    />
  );
}
