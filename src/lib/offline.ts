// Device-local storage for the bookkeeper flow, so a book can be kept with no
// connection: reference data (teams/games/rosters) is cached on the way in, and
// finished books queue in an outbox until they can be uploaded.

import type { ScorebookSetInput } from "@/app/app/team/[teamId]/scorebook/types";

const OUTBOX_KEY = "courtiq:outbox";

export const gamesKey = (token: string) => `courtiq:bk:games:${token}`;
export const rosterKey = (token: string, teamId: string) => `courtiq:bk:roster:${token}:${teamId}`;

export function readLocal<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeLocal(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked; caching is best-effort.
  }
}

export type PendingBook = {
  id: string;
  token: string;
  teamId: string;
  gameId: string | null;
  homeTeam: string;
  awayTeam: string;
  format: number;
  sets: ScorebookSetInput[];
  queuedAt: number;
};

export function readOutbox(): PendingBook[] {
  return readLocal<PendingBook[]>(OUTBOX_KEY) ?? [];
}

export function queueBook(book: Omit<PendingBook, "id" | "queuedAt">): void {
  const outbox = readOutbox();
  outbox.push({
    ...book,
    id: `bk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    queuedAt: Date.now(),
  });
  writeLocal(OUTBOX_KEY, outbox);
}

export function removeFromOutbox(id: string): void {
  writeLocal(
    OUTBOX_KEY,
    readOutbox().filter((b) => b.id !== id)
  );
}
