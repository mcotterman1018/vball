"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";
import { ScorebookClient } from "@/app/app/team/[teamId]/scorebook/ScorebookClient";
import type { ScorebookSavePayload } from "@/app/app/team/[teamId]/scorebook/types";

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
  const [games, setGames] = useState<BkGame[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [picked, setPicked] = useState<Picked | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.rpc("bk_games", { p_token: token });
      setGames((data as BkGame[]) || []);
      setLoadingGames(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startBook(team: { id: string; name: string }, game: BkGame | null) {
    setStarting(true);
    const { data } = await supabase.rpc("bk_roster", { p_token: token, p_team_id: team.id });
    const roster = ((data as RosterEntry[]) || []).map((r) => ({ num: r.num, name: r.name, lib: r.lib }));
    const teamFull = [context.orgName, team.name].filter(Boolean).join(" ");
    const homeName = game ? (game.homeAway === "Home" ? teamFull : game.opponent) : teamFull;
    const awayName = game ? (game.homeAway === "Home" ? game.opponent : teamFull) : "Away";
    setPicked({ teamId: team.id, teamName: team.name, gameId: game?.id ?? null, homeName, awayName, roster });
    setStarting(false);
  }

  async function saveBook(payload: ScorebookSavePayload) {
    if (!picked) return;
    const { error } = await supabase.rpc("bk_save_scorebook", {
      p_token: token,
      p_team_id: picked.teamId,
      p_game_id: picked.gameId,
      p_home: payload.homeTeam,
      p_away: payload.awayTeam,
      p_format: payload.format,
      p_sets: payload.sets,
    });
    if (error) throw new Error(error.message);
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
