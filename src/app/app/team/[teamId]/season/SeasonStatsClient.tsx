"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { calc, fmtPct, type StatCounts, type DerivedStats } from "@/lib/stats";

export type MatchSummary = {
  id: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  setCount: number;
  won: boolean;
  scoreline: string;
  teamTotal: StatCounts;
};

export type PlayerRow = {
  id: string;
  jersey: number;
  name: string;
  position: string;
  isLibero: boolean;
  gamesPlayed: number;
  total: StatCounts;
  perMatch: { matchId: string; counts: StatCounts }[];
};

const SCOLS: [string, keyof DerivedStats][] = [
  ["SA", "sa"], ["A", "a"], ["SE", "se"],
  ["ATT", "att"], ["K", "k"], ["E", "e"], ["PCT", "hp"],
  ["R", "r"], ["RE", "re"],
  ["BS", "bs"], ["BA", "ba"], ["BE", "be"],
  ["BHA", "bha"], ["AST", "ast"], ["BHE", "bhe"],
  ["D", "d"], ["DE", "de"],
];

function cellVal(s: DerivedStats, key: keyof DerivedStats, dec?: boolean): string {
  if (key === "hp") return fmtPct(s.hp, s.att > 0);
  const v = s[key];
  if (dec) return v ? v.toFixed(1) : "—";
  return v ? String(v) : "—";
}

export function SeasonStatsClient({
  teamId,
  teamName,
  matches,
  players,
  totalSets,
}: {
  teamId: string;
  teamName: string;
  matches: MatchSummary[];
  players: PlayerRow[];
  totalSets: number;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"team" | "players">("team");
  const [mode, setMode] = useState<"total" | "avg">("total");
  const [playerId, setPlayerId] = useState<string | null>(null);
  const gp = matches.length;
  const matchById = new Map(matches.map((m) => [m.id, m]));

  const Header = ({ title, sub, onBack }: { title: string; sub: string; onBack: () => void }) => (
    <div className="bg-navy px-6 py-3.5 flex items-center gap-3.5 flex-shrink-0">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 bg-white/10 border-none text-white/70 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer"
      >
        <Icon n="arrowLeft" size={13} color="rgba(255,255,255,0.7)" sw={2} /> Back
      </button>
      <div>
        <div className="text-[10px] text-white/30 font-bold uppercase font-label tracking-[0.12em]">{sub}</div>
        <div className="text-xl font-extrabold text-white tracking-[-0.02em]">{title}</div>
      </div>
    </div>
  );

  const Empty = () => (
    <div className="text-center px-10 py-16 bg-surface rounded-2xl shadow-card-sm">
      <div className="text-base font-bold mb-1.5 text-text">No games recorded yet</div>
      <div className="text-[13px] text-text-sec">Track a match with the Stats Tracker and it&apos;ll show up here.</div>
    </div>
  );

  const th = "px-1.5 py-2 text-[10px] font-bold text-text-sec text-center uppercase font-label tracking-[0.05em]";

  // ── Player detail view ──
  if (playerId !== null) {
    const p = players.find((r) => r.id === playerId)!;
    const season = calc(p.total);
    const pSets = p.perMatch.reduce((n, pm) => n + (matchById.get(pm.matchId)?.setCount || 0), 0);
    const tiles: [string, string | number, string][] = [
      ["Points", season.pts.toFixed(1), "var(--color-accent)"],
      ["Kills", season.k, "var(--color-green)"],
      ["Hit %", fmtPct(season.hp, season.att > 0), season.hp > 0.2 ? "var(--color-green)" : "var(--color-navy)"],
      ["Aces", season.a, "var(--color-green)"],
      ["Assists", season.ast, "var(--color-navy)"],
      ["Digs", season.d, "var(--color-gold)"],
    ];
    return (
      <div className="flex flex-col h-screen bg-bg font-display overflow-hidden">
        <Header
          title={`#${p.jersey} ${p.name}`}
          sub={`${p.position ? p.position + " · " : ""}${p.perMatch.length} games · ${pSets} sets`}
          onBack={() => setPlayerId(null)}
        />
        <div className="flex-1 overflow-auto px-6 py-[18px]">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2.5 mb-5">
            {tiles.map(([label, val, col]) => (
              <div key={label} className="bg-surface rounded-xl px-3.5 py-3 shadow-card-sm">
                <div className="text-[9px] font-bold text-text-ter uppercase font-label tracking-[0.08em] mb-1">
                  {label}
                </div>
                <div className="text-2xl font-extrabold tracking-[-0.02em]" style={{ color: col }}>
                  {val}
                </div>
              </div>
            ))}
          </div>
          {p.perMatch.length === 0 ? (
            <Empty />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs bg-surface rounded-xl overflow-hidden shadow-card-sm">
                <thead>
                  <tr className="border-b-2 border-navy">
                    <th className={`${th} !text-left`}>Game</th>
                    {SCOLS.map(([h]) => (
                      <th key={h} className={th}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {p.perMatch.map((pm, i) => {
                    const m = matchById.get(pm.matchId)!;
                    const s = calc(pm.counts);
                    return (
                      <tr key={i} className="border-b border-border-light">
                        <td className="px-1.5 py-2.5 whitespace-nowrap">
                          <div className="font-semibold text-xs">
                            {m.homeTeam} vs {m.awayTeam}
                          </div>
                          <div className="text-[10px] text-text-ter">{m.date}</div>
                        </td>
                        {SCOLS.map(([h, key]) => (
                          <td
                            key={h}
                            className="px-1.5 py-2.5 text-center"
                            style={{ color: (key === "hp" ? s.att > 0 : s[key] > 0) ? "var(--color-text)" : "var(--color-border-light)" }}
                          >
                            {cellVal(s, key)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                  <tr className="border-t-2 border-navy bg-navy-bg">
                    <td className="px-1.5 py-2.5 font-extrabold text-navy uppercase font-label text-[11px] tracking-[0.06em]">
                      Season Total
                    </td>
                    {SCOLS.map(([h, key]) => (
                      <td key={h} className="px-1.5 py-2.5 text-center font-extrabold text-navy">
                        {cellVal(season, key)}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-gold-bg">
                    <td className="px-1.5 py-2.5 font-extrabold text-gold uppercase font-label text-[11px] tracking-[0.06em]">
                      Per Game
                    </td>
                    {SCOLS.map(([h, key]) => (
                      <td key={h} className="px-1.5 py-2.5 text-center font-bold text-gold">
                        {key === "hp"
                          ? fmtPct(season.hp, season.att > 0)
                          : p.perMatch.length > 0 && season[key]
                          ? (season[key] / p.perMatch.length).toFixed(1)
                          : "—"}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Season totals across all matches (team view footer)
  const seasonTeamTotal: StatCounts = {};
  for (const m of matches) {
    for (const k of Object.keys(m.teamTotal)) seasonTeamTotal[k] = (seasonTeamTotal[k] || 0) + m.teamTotal[k];
  }
  const seasonDerived = calc(seasonTeamTotal);

  return (
    <div className="flex flex-col h-screen bg-bg font-display overflow-hidden">
      <Header
        title="Season Stats"
        sub={`${teamName} · ${gp} games · ${totalSets} sets`}
        onBack={() => router.push(`/app/team/${teamId}`)}
      />
      <div className="flex items-center justify-between px-6 pt-3.5 bg-surface border-b border-border">
        <div className="flex gap-0.5">
          {(
            [
              ["team", "By Game"],
              ["players", "By Player"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className="px-5 py-2.5 text-[13px] font-semibold rounded-t-lg border-none cursor-pointer"
              style={{
                background: tab === k ? "var(--color-bg)" : "transparent",
                color: tab === k ? "var(--color-navy)" : "var(--color-text-ter)",
                borderBottom: tab === k ? "2px solid var(--color-navy)" : "2px solid transparent",
              }}
            >
              {label}
            </button>
          ))}
        </div>
        {tab === "players" && (
          <div className="flex rounded-lg overflow-hidden border border-border mb-2">
            {(
              [
                ["total", "Totals"],
                ["avg", "Per Game"],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setMode(k)}
                className="px-3.5 py-1.5 text-[11px] font-bold border-none cursor-pointer"
                style={{
                  background: mode === k ? "var(--color-navy)" : "transparent",
                  color: mode === k ? "#FFF" : "var(--color-text-sec)",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto px-6 py-[18px]">
        {gp === 0 ? (
          <Empty />
        ) : tab === "team" ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs bg-surface rounded-xl overflow-hidden shadow-card-sm">
              <thead>
                <tr className="border-b-2 border-navy">
                  <th className={`${th} !text-left`}>Game</th>
                  <th className={th}>Result</th>
                  {SCOLS.map(([h]) => (
                    <th key={h} className={th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => {
                  const s = calc(m.teamTotal);
                  return (
                    <tr key={m.id} className="border-b border-border-light">
                      <td className="px-1.5 py-2.5 whitespace-nowrap">
                        <div className="font-semibold text-xs">
                          {m.homeTeam} vs {m.awayTeam}
                        </div>
                        <div className="text-[10px] text-text-ter">
                          {m.date} · {m.scoreline}
                        </div>
                      </td>
                      <td className="px-1.5 py-2.5 text-center">
                        <span
                          className="text-[11px] font-extrabold px-2 py-0.5 rounded-full"
                          style={{
                            background: m.won ? "var(--color-green-bg)" : "var(--color-red-bg)",
                            color: m.won ? "var(--color-green)" : "var(--color-red)",
                          }}
                        >
                          {m.won ? "W" : "L"}
                        </span>
                      </td>
                      {SCOLS.map(([h, key]) => (
                        <td
                          key={h}
                          className="px-1.5 py-2.5 text-center"
                          style={{ color: (key === "hp" ? s.att > 0 : s[key] > 0) ? "var(--color-text)" : "var(--color-border-light)" }}
                        >
                          {cellVal(s, key)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                <tr className="border-t-2 border-navy bg-navy-bg">
                  <td colSpan={2} className="px-1.5 py-2.5 font-extrabold text-navy uppercase font-label text-[11px] tracking-[0.06em]">
                    Season Total
                  </td>
                  {SCOLS.map(([h, key]) => (
                    <td key={h} className="px-1.5 py-2.5 text-center font-extrabold text-navy">
                      {cellVal(seasonDerived, key)}
                    </td>
                  ))}
                </tr>
                <tr className="bg-gold-bg">
                  <td colSpan={2} className="px-1.5 py-2.5 font-extrabold text-gold uppercase font-label text-[11px] tracking-[0.06em]">
                    Per Game Avg
                  </td>
                  {SCOLS.map(([h, key]) => (
                    <td key={h} className="px-1.5 py-2.5 text-center font-bold text-gold">
                      {key === "hp"
                        ? fmtPct(seasonDerived.hp, seasonDerived.att > 0)
                        : seasonDerived[key]
                        ? (seasonDerived[key] / gp).toFixed(1)
                        : "—"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs bg-surface rounded-xl overflow-hidden shadow-card-sm">
                <thead>
                  <tr className="border-b-2 border-navy">
                    <th className={`${th} !text-left`}>Player</th>
                    <th className={th}>GP</th>
                    {SCOLS.map(([h]) => (
                      <th key={h} className={th}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {players.map((p) => {
                    const s = calc(p.total);
                    const n = p.gamesPlayed;
                    return (
                      <tr
                        key={p.id}
                        onClick={() => setPlayerId(p.id)}
                        className="border-b border-border-light cursor-pointer hover:bg-bg-alt"
                      >
                        <td className="px-1.5 py-2.5 whitespace-nowrap">
                          <span
                            className="font-extrabold mr-1.5"
                            style={{ color: p.isLibero ? "var(--color-libero)" : "var(--color-navy)" }}
                          >
                            #{p.jersey}
                          </span>
                          <span className="font-medium">{p.name || "—"}</span>
                          {p.position && <span className="text-[10px] text-text-ter ml-1.5">{p.position}</span>}
                        </td>
                        <td className="px-1.5 py-2.5 text-center text-text-sec">{n || "—"}</td>
                        {SCOLS.map(([h, key]) => (
                          <td
                            key={h}
                            className="px-1.5 py-2.5 text-center"
                            style={{ color: (key === "hp" ? s.att > 0 : s[key] > 0) ? "var(--color-text)" : "var(--color-border-light)" }}
                          >
                            {key === "hp"
                              ? fmtPct(s.hp, s.att > 0)
                              : mode === "avg"
                              ? n > 0 && s[key]
                                ? (s[key] / n).toFixed(1)
                                : "—"
                              : s[key] || "—"}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="text-[11px] text-text-ter mt-2.5 text-center">
              Tap any player to see their game-by-game log
            </div>
          </>
        )}
      </div>
    </div>
  );
}
