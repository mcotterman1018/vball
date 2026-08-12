"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export type SavedSet = {
  set_number: number;
  home_score: number;
  away_score: number;
  home_line: string[];
  away_line: string[];
  home_libero: string;
  away_libero: string;
  home_grid: (number | string)[][];
  away_grid: (number | string)[][];
  home_circled: number[][];
  away_circled: number[][];
  sub_log: { team: "home" | "away"; out: string; playerIn: string; homeScore: number; awayScore: number }[];
  timeout_log: { team: "home" | "away"; homeScore: number; awayScore: number }[];
};

const ROMAN = ["I", "II", "III", "IV", "V", "VI"];

export function ScorebookReview({
  teamId,
  homeTeam,
  awayTeam,
  createdAt,
  sets,
}: {
  teamId: string;
  homeTeam: string;
  awayTeam: string;
  createdAt: string;
  sets: SavedSet[];
}) {
  const [active, setActive] = useState(0);
  const set = sets[active];

  const homeSetsWon = sets.filter((s) => s.home_score > s.away_score).length;
  const awaySetsWon = sets.filter((s) => s.away_score > s.home_score).length;

  // Reconstruct who played each rotation slot from the starting lineup plus the
  // subs recorded for this set, so the review shows the same chain the live
  // book did.
  function playersFor(s: SavedSet, team: "home" | "away"): string[][] {
    const line = [...(team === "home" ? s.home_line : s.away_line)];
    const chains = line.map((n) => [n]);
    // The stored line is the END-of-set lineup, so walk the subs backwards to
    // recover the starting numbers, then forwards to build each chain.
    const subs = (s.sub_log || []).filter((x) => x.team === team);
    const startLine = [...line];
    for (let i = subs.length - 1; i >= 0; i--) {
      const idx = startLine.indexOf(String(subs[i].playerIn));
      if (idx >= 0) startLine[idx] = String(subs[i].out);
    }
    const rebuilt = startLine.map((n) => [n]);
    const cur = [...startLine];
    for (const sub of subs) {
      const idx = cur.indexOf(String(sub.out));
      if (idx === -1) continue;
      cur[idx] = String(sub.playerIn);
      rebuilt[idx].push(String(sub.playerIn));
    }
    return rebuilt.length ? rebuilt : chains;
  }

  const TeamBook = ({ team }: { team: "home" | "away" }) => {
    const isHome = team === "home";
    const name = isHome ? homeTeam : awayTeam;
    const color = isHome ? "var(--color-navy)" : "var(--color-red)";
    const colorLight = isHome ? "var(--color-navy-bg)" : "var(--color-red-bg)";
    const grid = isHome ? set.home_grid : set.away_grid;
    const circled = isHome ? set.home_circled : set.away_circled;
    const score = isHome ? set.home_score : set.away_score;
    const lib = isHome ? set.home_libero : set.away_libero;
    const chains = playersFor(set, team);
    const subCount = (set.sub_log || []).filter((x) => x.team === team).length;
    const timeouts = (set.timeout_log || []).filter((x) => x.team === team);
    const cols = Math.max(12, ...(grid || []).map((r) => r.length + 1));

    return (
      <div className="flex-1 min-w-0 bg-surface rounded-[14px] overflow-hidden shadow-card-sm">
        <div className="h-[3px]" style={{ background: color }} />
        <div className="flex items-center justify-between px-3 py-1.5 bg-bg border-b border-border gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[13px] font-extrabold text-text truncate">{name}</span>
            <span className="text-[24px] font-extrabold leading-none" style={{ color }}>
              {score}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-text-sec flex-shrink-0">
            {lib && <span className="text-libero font-bold">LIB #{lib}</span>}
            <span>
              T/O {timeouts.length}/2
              {timeouts.length > 0 && ` (${timeouts.map((t) => `${isHome ? t.homeScore : t.awayScore}-${isHome ? t.awayScore : t.homeScore}`).join(", ")})`}
            </span>
          </div>
        </div>
        <div className="flex overflow-hidden">
          <div className="flex-shrink-0 border-r border-border bg-bg">
            <div className="h-[18px]" />
            {[0, 1, 2, 3, 4, 5].map((r) => (
              <div
                key={r}
                className="w-[22px] h-10 flex items-center justify-center text-[10px] font-extrabold border-b border-border text-text-ter"
              >
                {ROMAN[r]}
              </div>
            ))}
          </div>
          <div className="flex-shrink-0 w-[130px]" style={{ borderRight: "2px solid var(--color-navy-border)" }}>
            <div className="h-[18px] flex items-center justify-center text-[8px] font-bold text-text-ter border-b border-border uppercase font-label tracking-[0.08em]">
              Players
            </div>
            {[0, 1, 2, 3, 4, 5].map((ri) => {
              const chain = chains[ri] || [];
              const cur = chain[chain.length - 1];
              return (
                <div
                  key={ri}
                  className="flex items-center h-10 border-b border-border px-1 overflow-x-auto whitespace-nowrap"
                >
                  {chain.map((p, pi) => (
                    <span key={pi} className="inline-flex items-center">
                      {pi > 0 && <span className="text-[8px] text-border-light mx-0.5">/</span>}
                      {p === cur ? (
                        <span className="min-w-[34px] h-8 px-2 rounded-lg text-[15px] font-extrabold border border-border bg-bg-alt text-text flex items-center justify-center">
                          {p}
                        </span>
                      ) : (
                        <span
                          className="text-[11px] font-bold px-0.5 text-text-sec"
                          style={{
                            textDecoration: "line-through",
                            textDecorationColor: "var(--color-red)",
                            textDecorationThickness: "1.5px",
                          }}
                        >
                          {p}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>
          <div className="flex-1 overflow-x-auto" style={{ borderRight: "2px solid var(--color-navy-border)" }}>
            <div className="flex border-b border-border h-[18px] bg-bg">
              {Array.from({ length: cols }, (_, i) => (
                <div
                  key={i}
                  className="w-[30px] flex-shrink-0 flex items-center justify-center text-[8px] text-text font-bold border-r border-border"
                >
                  {i + 1}
                </div>
              ))}
            </div>
            {[0, 1, 2, 3, 4, 5].map((ri) => {
              const rd = (grid && grid[ri]) || [];
              const rc = (circled && circled[ri]) || [];
              return (
                <div key={ri} className="flex h-10 border-b border-border">
                  {Array.from({ length: cols }, (_, ci) => {
                    const v = rd[ci];
                    const has = v !== undefined;
                    const cir = rc.includes(ci);
                    const isSub = v === "S";
                    return (
                      <div
                        key={ci}
                        className="w-[30px] flex-shrink-0 h-10 flex items-center justify-center border-r border-border"
                      >
                        {has && isSub && (
                          <div className="w-5 h-5 rounded-[5px] flex items-center justify-center text-[9px] font-extrabold text-libero bg-libero-bg">
                            S
                          </div>
                        )}
                        {has && !isSub && (
                          <div
                            className="w-5 h-5 flex items-center justify-center text-[11px] font-extrabold"
                            style={{
                              borderRadius: cir ? 99 : 4,
                              border: cir ? `2px solid ${color}` : "none",
                              color: cir ? color : "var(--color-text)",
                              background: cir ? colorLight : "transparent",
                            }}
                          >
                            {v}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex items-center border-t border-border px-2.5 py-1 bg-bg">
          <span className="text-[9px] font-bold text-text-ter mr-1.5 uppercase font-label tracking-[0.06em]">
            Subs
          </span>
          <span className="text-[10px] font-extrabold text-navy">{subCount}/18</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-bg font-display">
      <div className="bg-navy px-5 py-2.5 flex items-center justify-between flex-shrink-0 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/app/team/${teamId}`}
            className="flex items-center gap-1.5 bg-white/[0.08] text-white/60 text-xs font-semibold px-3.5 py-2 rounded-lg flex-shrink-0"
          >
            <Icon n="arrowLeft" size={14} color="rgba(255,255,255,0.6)" sw={2} /> Back
          </Link>
          <div className="min-w-0">
            <div className="text-[10px] text-white/30 font-semibold uppercase font-label tracking-[0.1em]">
              Scorebook · {new Date(createdAt).toLocaleDateString()}
            </div>
            <div className="text-base font-extrabold text-white truncate">
              {homeTeam} <span className="text-white/40">vs</span> {awayTeam}
            </div>
          </div>
        </div>
        <div className="text-[22px] font-extrabold text-white flex-shrink-0">
          {homeSetsWon} <span className="text-white/25 text-sm">—</span> {awaySetsWon}
        </div>
      </div>

      {sets.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-text-ter">
          This book has no sets recorded.
        </div>
      ) : (
        <>
          <div className="flex gap-1.5 px-5 py-2 bg-surface border-b border-border flex-shrink-0 overflow-x-auto">
            {sets.map((s, i) => (
              <button
                key={s.set_number}
                onClick={() => setActive(i)}
                className="px-4 py-2 text-xs font-bold rounded-lg cursor-pointer border flex-shrink-0"
                style={{
                  background: i === active ? "var(--color-navy)" : "var(--color-bg)",
                  color: i === active ? "#FFF" : "var(--color-text-sec)",
                  borderColor: i === active ? "var(--color-navy)" : "var(--color-border)",
                }}
              >
                Set {s.set_number}
                <span className="ml-2 opacity-70">
                  {s.home_score}–{s.away_score}
                </span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto px-2.5 py-1.5">
            <div className="flex flex-col lg:flex-row lg:items-start gap-1.5 lg:gap-2.5">
              <TeamBook team="home" />
              <TeamBook team="away" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
