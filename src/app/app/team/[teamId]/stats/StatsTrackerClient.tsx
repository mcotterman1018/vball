"use client";

import { useEffect, useReducer, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { PrimaryBtn, GhostBtn } from "@/components/ui/Button";
import { STATS, SECTIONS, calc, fmtPct, type StatCounts } from "@/lib/stats";
import { saveMatch } from "./actions";

type Player = { id: string; jersey_num: number; name: string; position: string; is_libero: boolean };

type State = {
  stats: Record<string, StatCounts>;
  log: { playerId: string; statKey: string }[];
  score: [number, number];
  serving: boolean;
  set: number;
  sets: [number, number][];
  selPlayer: string | null;
};

type Action =
  | { t: "stat"; playerId: string; k: string }
  | { t: "ptUs" }
  | { t: "ptThem" }
  | { t: "decUs" }
  | { t: "decThem" }
  | { t: "undo" }
  | { t: "endSet" }
  | { t: "selPlayer"; v: string }
  | { t: "setServing"; v: boolean }
  | { t: "hydrate"; state: State };

function reducer(state: State, a: Action): State {
  switch (a.t) {
    case "hydrate":
      return a.state;
    case "stat": {
      const stats = { ...state.stats, [a.playerId]: { ...(state.stats[a.playerId] || {}) } };
      stats[a.playerId][a.k] = (stats[a.playerId][a.k] || 0) + 1;
      return { ...state, stats, log: [...state.log, { playerId: a.playerId, statKey: a.k }] };
    }
    case "ptUs":
      return state.serving
        ? { ...state, score: [state.score[0] + 1, state.score[1]] }
        : { ...state, score: [state.score[0] + 1, state.score[1]], serving: true };
    case "ptThem":
      return { ...state, score: [state.score[0], state.score[1] + 1], serving: false };
    case "decUs":
      return { ...state, score: [Math.max(0, state.score[0] - 1), state.score[1]] };
    case "decThem":
      return { ...state, score: [state.score[0], Math.max(0, state.score[1] - 1)] };
    case "undo": {
      if (!state.log.length) return state;
      const log = [...state.log];
      const last = log.pop()!;
      const stats = { ...state.stats, [last.playerId]: { ...(state.stats[last.playerId] || {}) } };
      if (stats[last.playerId][last.statKey]) stats[last.playerId][last.statKey]--;
      return { ...state, stats, log };
    }
    case "endSet":
      return {
        ...state,
        sets: [...state.sets, [...state.score] as [number, number]],
        score: [0, 0],
        set: state.set + 1,
        serving: !state.serving,
      };
    case "selPlayer":
      return { ...state, selPlayer: state.selPlayer === a.v ? null : a.v };
    case "setServing":
      return { ...state, serving: a.v };
    default:
      return state;
  }
}

const emptyState: State = {
  stats: {},
  log: [],
  score: [0, 0],
  serving: true,
  set: 1,
  sets: [],
  selPlayer: null,
};

export function StatsTrackerClient({
  teamId,
  teamName,
  players,
  gameId,
  matchDate,
  initialHomeName,
  initialAwayName,
}: {
  teamId: string;
  teamName: string;
  players: Player[];
  gameId: string | null;
  matchDate: string;
  initialHomeName: string;
  initialAwayName: string;
}) {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, emptyState);
  const [homeTeam, setHomeTeam] = useState(initialHomeName);
  const [awayTeam, setAwayTeam] = useState(initialAwayName);
  const [showStats, setShowStats] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const storageKey = `courtiq:match:${teamId}:${gameId ?? "adhoc"}`;

  // Restore in-progress match from localStorage (survives refresh courtside).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.state) dispatch({ t: "hydrate", state: saved.state });
        if (saved.homeTeam) setHomeTeam(saved.homeTeam);
        if (saved.awayTeam) setAwayTeam(saved.awayTeam);
      }
    } catch {}
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ state, homeTeam, awayTeam }));
    } catch {}
  }, [state, homeTeam, awayTeam, hydrated, storageKey]);

  const libero = players.find((p) => p.is_libero) || null;
  const courtPlayers = players.filter((p) => !p.is_libero);
  const selP = state.selPlayer ? players.find((p) => p.id === state.selPlayer) || null : null;

  async function handleSave() {
    setSaving(true);
    const finalSets = [...state.sets];
    if (state.score[0] > 0 || state.score[1] > 0) finalSets.push([...state.score] as [number, number]);
    try {
      await saveMatch({
        teamId,
        gameId,
        matchDate,
        homeTeamName: homeTeam,
        awayTeamName: awayTeam,
        sets: finalSets.map((s, i) => ({ setNumber: i + 1, homeScore: s[0], awayScore: s[1] })),
        events: state.log,
      });
      localStorage.removeItem(storageKey);
      router.push(`/app/team/${teamId}`);
      router.refresh();
    } catch (e) {
      setSaving(false);
      alert("Failed to save match: " + (e instanceof Error ? e.message : "unknown error"));
    }
  }

  if (showStats) {
    return <StatsTable state={state} players={players} homeTeam={homeTeam} awayTeam={awayTeam} onBack={() => setShowStats(false)} />;
  }

  return (
    <div className="flex flex-col h-screen bg-bg font-display overflow-hidden">
      {/* Top action bar */}
      <div className="flex items-center justify-between px-[18px] py-2.5 bg-navy flex-shrink-0">
        <div className="flex gap-1.5">
          <button
            onClick={() => router.push(`/app/team/${teamId}`)}
            className="px-3.5 py-2 text-xs font-semibold bg-white/10 text-white/70 border-none rounded-lg cursor-pointer"
          >
            ← Back
          </button>
          <button
            onClick={() => dispatch({ t: "undo" })}
            className="px-3.5 py-2 text-xs font-bold bg-accent-bg text-accent border border-accent-border rounded-lg cursor-pointer"
          >
            ↩ Undo
          </button>
          <button
            onClick={() => setShowStats(true)}
            className="px-3.5 py-2 text-xs font-semibold bg-white/10 text-white/70 border-none rounded-lg cursor-pointer"
          >
            Stats
          </button>
        </div>
        <div className="text-[11px] font-bold text-white/50 tracking-[0.12em] uppercase font-label">
          Set {state.set}
          {state.sets.length > 0 && (
            <span className="ml-2.5 opacity-60">{state.sets.map((s) => s[0] + "-" + s[1]).join("  ")}</span>
          )}
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => dispatch({ t: "endSet" })}
            className="px-3.5 py-2 text-xs font-semibold bg-white/10 text-white/70 border-none rounded-lg cursor-pointer"
          >
            End Set
          </button>
          <button
            onClick={() => setConfirmEnd(true)}
            className="px-3.5 py-2 text-xs font-semibold border-none rounded-lg cursor-pointer"
            style={{ background: "rgba(192,57,43,0.25)", color: "#FCA5A5" }}
          >
            End Match
          </button>
        </div>
      </div>

      {/* Scoreboard */}
      <div className="flex items-stretch justify-center gap-4 px-6 py-4 flex-shrink-0">
        <ScoreCard
          name={homeTeam}
          onName={setHomeTeam}
          score={state.score[0]}
          color="var(--color-green)"
          bg="var(--color-green-bg)"
          onInc={() => dispatch({ t: "ptUs" })}
          onDec={() => dispatch({ t: "decUs" })}
        />
        <div className="flex flex-col items-center justify-center gap-2 min-w-20">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{
              background: state.serving ? "var(--color-green)" : "var(--color-red)",
              boxShadow: `0 0 8px ${state.serving ? "var(--color-green)" : "var(--color-red)"}66`,
            }}
          />
          <div className="text-[10px] font-extrabold text-text-ter tracking-[0.12em] uppercase font-label text-center leading-tight">
            {state.serving ? "Serving" : "Receiving"}
          </div>
          <button
            onClick={() => dispatch({ t: "setServing", v: !state.serving })}
            className="text-[9px] text-text-ter underline cursor-pointer bg-none border-none"
          >
            toggle
          </button>
        </div>
        <ScoreCard
          name={awayTeam}
          onName={setAwayTeam}
          score={state.score[1]}
          color="var(--color-red)"
          bg="var(--color-red-bg)"
          onInc={() => dispatch({ t: "ptThem" })}
          onDec={() => dispatch({ t: "decThem" })}
        />
      </div>

      <div className="h-px bg-border flex-shrink-0 mx-[18px]" />

      {/* Player grid */}
      <div className="flex-1 overflow-auto px-[18px] py-3.5">
        <div className="text-[10px] font-extrabold text-text-sec uppercase font-label tracking-[0.12em] mb-3">
          Tap a player to record stats
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {courtPlayers.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              selected={state.selPlayer === player.id}
              counts={state.stats[player.id] || {}}
              onClick={() => dispatch({ t: "selPlayer", v: player.id })}
            />
          ))}
          {libero && (
            <PlayerCard
              player={libero}
              selected={state.selPlayer === libero.id}
              counts={state.stats[libero.id] || {}}
              onClick={() => dispatch({ t: "selPlayer", v: libero.id })}
              isLibero
            />
          )}
        </div>

        {state.log.length > 0 && (
          <div className="mt-4 flex gap-1.5 flex-wrap">
            {state.log
              .slice(-12)
              .reverse()
              .map((h, i) => {
                const st = STATS[h.statKey] || { color: "#888", short: h.statKey };
                const p = players.find((x) => x.id === h.playerId);
                return (
                  <span
                    key={i}
                    className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold border"
                    style={{ background: st.color + "20", color: st.color, borderColor: st.color + "30" }}
                  >
                    #{p?.jersey_num} {st.short}
                  </span>
                );
              })}
          </div>
        )}
      </div>

      {/* Bottom stat entry panel */}
      {selP && (
        <div className="bg-surface border-t border-border px-[18px] pt-3.5 pb-[18px] flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-[22px] font-extrabold text-accent">#{selP.jersey_num}</span>
              <span className="text-sm font-semibold text-text">{selP.name || "unnamed"}</span>
              {selP.is_libero && (
                <span className="text-[10px] font-bold text-libero bg-libero-bg px-2 py-0.5 rounded-full">
                  LIBERO
                </span>
              )}
            </div>
            <button
              onClick={() => dispatch({ t: "selPlayer", v: selP.id })}
              className="bg-white/[0.06] border border-border text-text-sec text-xs font-semibold px-3 py-1.5 rounded-md cursor-pointer"
            >
              Deselect
            </button>
          </div>
          <div className="flex flex-col gap-3.5">
            {SECTIONS.map((sec) => (
              <div key={sec.label}>
                <div className="text-[9px] font-extrabold text-text-sec uppercase font-label tracking-[0.1em] mb-2">
                  {sec.label}
                </div>
                <div className="flex gap-2">
                  {sec.keys.map((k) => {
                    const st = STATS[k];
                    const cnt = (state.stats[selP.id] || {})[k] || 0;
                    return (
                      <button
                        key={k}
                        onClick={() => dispatch({ t: "stat", playerId: selP.id, k })}
                        className="flex-[1_1_0] min-w-14 px-1.5 py-3 rounded-xl cursor-pointer border text-center transition-all"
                        style={{
                          borderColor: cnt > 0 ? st.color + "40" : "var(--color-border)",
                          background: cnt > 0 ? st.color + "18" : "var(--color-surface)",
                        }}
                      >
                        <div
                          className="text-2xl font-extrabold leading-none"
                          style={{ color: cnt > 0 ? st.color : "var(--color-text-sec)" }}
                        >
                          {cnt}
                        </div>
                        <div className="text-[10px] font-semibold text-text-sec mt-1 leading-tight">{st.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {confirmEnd && (
        <Modal onClose={() => setConfirmEnd(false)}>
          <div className="text-center">
            <div className="w-[52px] h-[52px] rounded-[13px] bg-red-bg flex items-center justify-center mx-auto mb-4">
              <Icon n="x" size={24} color="var(--color-red)" />
            </div>
            <div className="text-xl font-extrabold mb-1.5 tracking-[-0.02em]">End match?</div>
            <div className="text-sm text-text-sec mb-7">
              Current set ({state.score[0]}-{state.score[1]}) will be recorded and the match saved permanently.
            </div>
            <div className="flex gap-2.5 justify-center">
              <GhostBtn onClick={() => setConfirmEnd(false)}>Cancel</GhostBtn>
              <PrimaryBtn onClick={handleSave} disabled={saving} className="!bg-red">
                {saving ? "Saving…" : "End & save match"}
              </PrimaryBtn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ScoreCard({
  name,
  onName,
  score,
  color,
  bg,
  onInc,
  onDec,
}: {
  name: string;
  onName: (v: string) => void;
  score: number;
  color: string;
  bg: string;
  onInc: () => void;
  onDec: () => void;
}) {
  return (
    <div
      className="flex-1 max-w-[220px] rounded-2xl px-5 py-[18px] text-center"
      style={{ background: bg, border: `2px solid ${color}` }}
    >
      <input
        value={name}
        onChange={(e) => onName(e.target.value)}
        className="text-xs font-bold bg-transparent border-none outline-none text-center w-full tracking-[0.08em] uppercase font-label mb-1"
        style={{ color, borderBottom: `1px dashed ${color}` }}
      />
      <div className="text-[64px] font-extrabold leading-none tracking-[-0.04em]" style={{ color }}>
        {score}
      </div>
      <div className="flex justify-center mt-2.5 rounded-[10px] overflow-hidden" style={{ border: `2px solid ${color}` }}>
        <button
          onClick={onDec}
          className="flex-1 py-2 text-sm font-extrabold cursor-pointer bg-transparent"
          style={{ color, borderRight: `1px solid ${color}` }}
        >
          −1
        </button>
        <button onClick={onInc} className="flex-1 py-2 text-sm font-extrabold cursor-pointer" style={{ background: bg, color }}>
          +1
        </button>
      </div>
    </div>
  );
}

function PlayerCard({
  player,
  selected,
  counts,
  onClick,
  isLibero = false,
}: {
  player: Player;
  selected: boolean;
  counts: StatCounts;
  onClick: () => void;
  isLibero?: boolean;
}) {
  const kills = counts.kill || 0;
  const digs = counts.dig || 0;
  const aces = counts.ace || 0;
  const blks = (counts.blockSolo || 0) + (counts.blockAssist || 0);
  const asts = counts.assist || 0;
  const accent = isLibero ? "var(--color-libero)" : "var(--color-navy)";
  return (
    <button
      onClick={onClick}
      className="relative px-3 pt-4 pb-3.5 rounded-2xl border-2 cursor-pointer text-center transition-all"
      style={{
        borderColor: selected ? accent : "var(--color-border)",
        background: selected ? (isLibero ? "var(--color-libero-bg)" : "var(--color-navy-bg)") : "var(--color-surface)",
        boxShadow: selected ? "var(--shadow-card)" : "none",
      }}
    >
      {isLibero && (
        <div className="absolute top-2 left-2.5 text-[8px] font-extrabold text-libero tracking-[0.1em]">LIB</div>
      )}
      <div
        className="text-[44px] font-extrabold leading-none tracking-[-0.03em]"
        style={{ color: selected ? accent : "var(--color-text)" }}
      >
        {player.jersey_num}
      </div>
      <div className="text-[11px] font-medium mt-1 truncate" style={{ color: selected ? accent : "var(--color-text-sec)" }}>
        {player.name || "—"}
      </div>
      {(kills > 0 || digs > 0 || aces > 0 || blks > 0 || asts > 0) && (
        <div className="flex justify-center gap-1 mt-2 flex-wrap">
          {kills > 0 && <Chip label={`K${kills}`} color="var(--color-green)" bg="var(--color-green-bg)" />}
          {aces > 0 && <Chip label={`A${aces}`} color="var(--color-accent)" bg="var(--color-accent-bg)" />}
          {asts > 0 && <Chip label={`AST${asts}`} color="var(--color-navy)" bg="var(--color-navy-bg)" />}
          {blks > 0 && <Chip label={`B${blks}`} color="var(--color-gold)" bg="var(--color-gold-bg)" />}
          {digs > 0 && <Chip label={`D${digs}`} color="var(--color-text-sec)" bg="var(--color-bg-alt)" />}
        </div>
      )}
    </button>
  );
}

function Chip({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ color, background: bg }}>
      {label}
    </span>
  );
}

function StatsTable({
  state,
  players,
  homeTeam,
  awayTeam,
  onBack,
}: {
  state: State;
  players: Player[];
  homeTeam: string;
  awayTeam: string;
  onBack: () => void;
}) {
  const rows = players;
  const totals: StatCounts = {};
  rows.forEach((p) => {
    const s = state.stats[p.id] || {};
    Object.keys(s).forEach((k) => (totals[k] = (totals[k] || 0) + s[k]));
  });
  const t = calc(totals);
  const gp = state.sets.length + 1;

  const headers = [
    ["#", ""], ["Player", ""], ["GP", ""],
    ["SA", ""], ["A", ""], ["SE", ""],
    ["ATT", ""], ["K", ""], ["E", ""], ["PCT", ""],
    ["R", ""], ["RE", ""],
    ["BS", ""], ["BA", ""], ["BE", ""],
    ["BHA", ""], ["AST", ""], ["BHE", ""],
    ["D", ""], ["DE", ""],
  ];

  return (
    <div className="flex flex-col h-screen bg-bg font-display overflow-hidden">
      <div className="bg-navy border-b border-border px-5 py-2.5 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 bg-white/10 border-none text-white/70 text-xs font-semibold px-3.5 py-1.5 rounded-lg cursor-pointer"
        >
          <Icon n="arrowLeft" size={13} color="rgba(255,255,255,0.7)" sw={2} /> Back
        </button>
        <span className="text-base font-bold text-white">Stats</span>
        <div className="ml-auto text-base font-extrabold text-white">
          {homeTeam} <span className="text-white/40 text-[13px]">vs</span> {awayTeam}
        </div>
      </div>
      <div className="flex-1 overflow-auto px-5 py-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs bg-surface rounded-xl overflow-hidden shadow-card-sm">
            <thead>
              <tr className="border-b-2 border-navy">
                {headers.map(([h], i) => (
                  <th
                    key={h + i}
                    className={`px-1.5 py-2 text-[10px] font-bold text-text-sec uppercase font-label tracking-[0.05em] ${
                      h === "Player" ? "text-left" : "text-center"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const s = calc(state.stats[p.id] || {});
                const cell = (v: number, hi?: string) => (
                  <td
                    className="px-1.5 py-2.5 text-center"
                    style={{ color: v > 0 ? hi || "var(--color-text)" : "var(--color-border-light)", fontWeight: v > 0 ? 600 : 400 }}
                  >
                    {v || "—"}
                  </td>
                );
                return (
                  <tr key={p.id} className="border-b border-border-light">
                    <td
                      className="px-1.5 py-2.5 font-extrabold text-center text-sm"
                      style={{ color: p.is_libero ? "var(--color-libero)" : "var(--color-navy)" }}
                    >
                      {p.jersey_num}
                    </td>
                    <td className="px-1.5 py-2.5 font-medium text-text whitespace-nowrap">
                      {p.name || "—"}
                      {p.is_libero && <span className="text-libero text-[9px] ml-1 font-bold">L</span>}
                    </td>
                    <td className="px-1.5 py-2.5 text-center text-text-ter">{gp}</td>
                    {cell(s.sa)}
                    {cell(s.a, "var(--color-green)")}
                    {cell(s.se, "var(--color-red)")}
                    {cell(s.att)}
                    {cell(s.k, "var(--color-green)")}
                    {cell(s.e, "var(--color-red)")}
                    <td
                      className="px-1.5 py-2.5 text-center font-bold"
                      style={{ color: s.hp > 0.2 ? "var(--color-green)" : s.hp < 0 ? "var(--color-red)" : "var(--color-text-sec)" }}
                    >
                      {fmtPct(s.hp, s.att > 0)}
                    </td>
                    {cell(s.r)}
                    {cell(s.re, "var(--color-red)")}
                    {cell(s.bs, "var(--color-green)")}
                    {cell(s.ba, "var(--color-gold)")}
                    {cell(s.be, "var(--color-red)")}
                    {cell(s.bha)}
                    {cell(s.ast, "var(--color-green)")}
                    {cell(s.bhe, "var(--color-red)")}
                    {cell(s.d, "var(--color-green)")}
                    {cell(s.de, "var(--color-red)")}
                  </tr>
                );
              })}
              <tr className="border-t-2 border-navy bg-navy-bg">
                <td colSpan={2} className="px-1.5 py-2.5 font-extrabold text-navy text-right pr-3 uppercase font-label tracking-[0.08em] text-[11px]">
                  Team Totals
                </td>
                <td className="px-1.5 py-2.5 text-center text-text-ter">—</td>
                {[t.sa, t.a, t.se, t.att, t.k, t.e].map((v, i) => (
                  <td key={i} className="px-1.5 py-2.5 text-center font-bold text-navy">
                    {v || "—"}
                  </td>
                ))}
                <td
                  className="px-1.5 py-2.5 text-center font-extrabold"
                  style={{ color: t.hp > 0.2 ? "var(--color-green)" : t.hp < 0 ? "var(--color-red)" : "var(--color-navy)" }}
                >
                  {fmtPct(t.hp, t.att > 0)}
                </td>
                {[t.r, t.re, t.bs, t.ba, t.be, t.bha, t.ast, t.bhe, t.d, t.de].map((v, i) => (
                  <td key={i} className="px-1.5 py-2.5 text-center font-bold text-navy">
                    {v || "—"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
