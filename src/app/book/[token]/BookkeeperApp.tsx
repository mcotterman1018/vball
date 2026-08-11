"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";
import { ScorebookClient } from "@/app/app/team/[teamId]/scorebook/ScorebookClient";
import type { ScorebookSavePayload } from "@/app/app/team/[teamId]/scorebook/types";
import {
  gamesKey,
  rosterKey,
  readLocal,
  writeLocal,
  readOutbox,
  queueBook,
  removeFromOutbox,
} from "@/lib/offline";

export type BkContext = {
  levelName: string;
  orgName: string;
  teams: { id: string; name: string }[];
};

type BkGame = {
  id: string;
  teamId: string;
  teamName: string;
  opponent: string;
  homeAway: "Home" | "Away";
  gameDate: string;
};

type RosterEntry = { num: number; name: string; lib: boolean };

type Picked = {
  teamId: string;
  teamName: string;
  gameId: string | null;
  homeName: string;
  awayName: string;
  roster: RosterEntry[];
};

export function BookkeeperApp({ token, context }: { token: string; context: BkContext }) {
  const supabase = createClient();
  const [games, setGames] = useState<BkGame[]>(() => readLocal<BkGame[]>(gamesKey(token)) ?? []);
  const [loadingGames, setLoadingGames] = useState(true);
  const [picked, setPicked] = useState<Picked | null>(null);
  const [starting, setStarting] = useState(false);
  const [pending, setPending] = useState(0);
  const [online, setOnline] = useState(true);

  // Upload any books that were finished while offline.
  const flushOutbox = useCallback(async () => {
    const queued = readOutbox().filter((b) => b.token === token);
    for (const book of queued) {
      const { error } = await supabase.rpc("bk_save_scorebook", {
        p_token: book.token,
        p_team_id: book.teamId,
        p_game_id: book.gameId,
        p_home: book.homeTeam,
        p_away: book.awayTeam,
        p_format: book.format,
        p_sets: book.sets,
      });
      if (error) break; // still offline or rejected — try again later
      removeFromOutbox(book.id);
    }
    setPending(readOutbox().filter((b) => b.token === token).length);
  }, [supabase, token]);

  useEffect(() => {
    setPending(readOutbox().filter((b) => b.token === token).length);
    setOnline(navigator.onLine);

    const goOnline = () => {
      setOnline(true);
      flushOutbox();
    };
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    (async () => {
      // Pull the schedule and every roster so they're on the device before the
      // gym. Falls back to whatever was cached last time when there's no signal.
      try {
        const { data, error } = await supabase.rpc("bk_games", { p_token: token });
        if (!error && data) {
          setGames(data as BkGame[]);
          writeLocal(gamesKey(token), data);
        }
      } catch {
        // Offline — the cached schedule loaded with initial state.
      }
      setLoadingGames(false);

      try {
        for (const team of context.teams) {
          const res = await supabase.rpc("bk_roster", { p_token: token, p_team_id: team.id });
          if (!res.error && res.data) writeLocal(rosterKey(token, team.id), res.data);
        }
        await flushOutbox();
      } catch {
        // Offline — cached rosters stay as they are.
      }
    })();

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startBook(team: { id: string; name: string }, game: BkGame | null) {
    setStarting(true);
    let roster: RosterEntry[] | null = null;
    try {
      const { data, error } = await supabase.rpc("bk_roster", { p_token: token, p_team_id: team.id });
      if (!error && data) roster = data as RosterEntry[];
    } catch {
      // Offline — fall through to the cached roster.
    }
    if (roster) writeLocal(rosterKey(token, team.id), roster);
    else roster = readLocal<RosterEntry[]>(rosterKey(token, team.id)) ?? [];

    const teamFull = [context.orgName, team.name].filter(Boolean).join(" ");
    const homeName = game ? (game.homeAway === "Home" ? teamFull : game.opponent) : teamFull;
    const awayName = game ? (game.homeAway === "Home" ? game.opponent : teamFull) : "Away";
    setPicked({
      teamId: team.id,
      teamName: team.name,
      gameId: game?.id ?? null,
      homeName,
      awayName,
      roster: roster.map((r) => ({ num: r.num, name: r.name, lib: r.lib })),
    });
    setStarting(false);
  }

  async function saveBook(payload: ScorebookSavePayload) {
    if (!picked) return;
    const args = {
      p_token: token,
      p_team_id: picked.teamId,
      p_game_id: picked.gameId,
      p_home: payload.homeTeam,
      p_away: payload.awayTeam,
      p_format: payload.format,
      p_sets: payload.sets,
    };
    try {
      const { error } = await supabase.rpc("bk_save_scorebook", args);
      if (error) throw new Error(error.message);
      return;
    } catch {
      // No connection (or the request failed): keep the book on this device and
      // upload it automatically once we're back online. Never lose a book.
      queueBook({
        token,
        teamId: picked.teamId,
        gameId: picked.gameId,
        homeTeam: payload.homeTeam,
        awayTeam: payload.awayTeam,
        format: payload.format,
        sets: payload.sets,
      });
      setPending(readOutbox().filter((b) => b.token === token).length);
    }
  }

  if (picked) {
    return (
      <ScorebookClient
        storageKey={`courtiq:bkbook:${token}:${picked.teamId}:${picked.gameId ?? "adhoc"}`}
        initialHome={picked.homeName}
        initialAway={picked.awayName}
        roster={picked.roster}
        saveBook={saveBook}
        onExit={() => setPicked(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-bg font-display">
      <div className="bg-navy px-6 py-4">
        <div className="text-[11px] font-bold text-white/35 uppercase font-label tracking-[0.12em] mb-0.5">
          {context.orgName} · {context.levelName}
        </div>
        <div className="text-[26px] font-extrabold text-white tracking-[-0.03em]">Keep a Scorebook</div>
      </div>

      <div className="px-6 py-6 max-w-[640px] mx-auto">
        {!online && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-yellow-bg border border-yellow-border text-[13px] text-yellow font-semibold">
            Offline — you can still keep the book. It saves on this device and uploads when
            you&apos;re back online.
          </div>
        )}
        {pending > 0 && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-accent-bg border border-accent-border flex items-center justify-between gap-3">
            <div className="text-[13px] text-accent font-semibold">
              {pending} book{pending !== 1 ? "s" : ""} waiting to upload
            </div>
            <button
              onClick={flushOutbox}
              className="text-[12px] font-bold text-white bg-accent border-none rounded-lg px-3 py-1.5 cursor-pointer"
            >
              Upload now
            </button>
          </div>
        )}
        <div className="text-[13px] text-text-sec mb-5 leading-relaxed">
          Pick a game to keep the book for, or start a blank book for one of your teams.
        </div>

        {context.teams.length === 0 && (
          <div className="text-sm text-text-ter text-center py-10">
            No teams have been set up in this level yet.
          </div>
        )}

        {context.teams.map((team) => {
          const teamGames = games.filter((g) => g.teamId === team.id);
          return (
            <div key={team.id} className="mb-6">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-8 h-8 rounded-lg bg-navy-bg flex items-center justify-center">
                  <Icon n="users" size={16} color="var(--color-navy)" />
                </div>
                <div className="text-[17px] font-extrabold text-text">{team.name}</div>
              </div>

              {loadingGames ? (
                <div className="text-xs text-text-ter px-1 py-2">Loading games…</div>
              ) : (
                <>
                  {teamGames.map((g) => (
                    <button
                      key={g.id}
                      disabled={starting}
                      onClick={() => startBook(team, g)}
                      className="w-full text-left bg-surface rounded-[10px] mb-1.5 shadow-card-sm px-3.5 py-3 flex items-center justify-between cursor-pointer hover:shadow-card transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <Pill
                          label={g.homeAway}
                          color={g.homeAway === "Home" ? "var(--color-navy)" : "var(--color-text-sec)"}
                          bg={g.homeAway === "Home" ? "var(--color-navy-bg)" : "var(--color-bg-alt)"}
                        />
                        <div>
                          <div className="text-[13px] font-semibold">vs {g.opponent}</div>
                          <div className="text-[11px] text-text-ter">{g.gameDate || "TBD"}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-navy">
                        Keep book <Icon n="chevronRight" size={14} color="var(--color-navy)" sw={2} />
                      </div>
                    </button>
                  ))}
                </>
              )}

              <button
                disabled={starting}
                onClick={() => startBook(team, null)}
                className="mt-1 text-[12px] font-semibold text-accent bg-transparent border border-dashed border-accent-border rounded-lg px-3 py-2 cursor-pointer w-full"
              >
                + Blank book for {team.name}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
