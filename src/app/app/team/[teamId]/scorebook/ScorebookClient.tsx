"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { PrimaryBtn, GhostBtn } from "@/components/ui/Button";
import type { ScorebookSetInput, ScorebookSavePayload } from "./types";

type Team = "home" | "away";
type RosterEntry = { num: number; name: string; lib: boolean };
type PointEntry = {
  team: Team;
  homeScore: number;
  awayScore: number;
  server: string;
  serving: Team;
  sideout: boolean;
};
type SubEntry = { team: Team; out: string; playerIn: string; set: number; homeScore: number; awayScore: number };
type TOEntry = { team: Team; homeScore: number; awayScore: number };

// Everything that happens during a set is recorded as an ordered event list,
// and the visible book (scores, rotations, grids, subs, timeouts) is rebuilt by
// replaying it. That makes undo exact: drop the last event and replay.
type BookEvent =
  | { k: "point"; team: Team }
  | { k: "sub"; team: Team; out: string; playerIn: string }
  | { k: "timeout"; team: Team }
  | { k: "circle"; team: Team; row: number; col: number };

type SetStart = {
  homeLine: string[];
  awayLine: string[];
  serving: Team;
  homeRot: number;
  awayRot: number;
};

type SetData = {
  set: number;
  homeScore: number;
  awayScore: number;
  homeGrid: (number | string)[][];
  awayGrid: (number | string)[][];
  homeCircled: number[][];
  awayCircled: number[][];
  pointLog: PointEntry[];
  subLog: SubEntry[];
  homeLine: string[];
  awayLine: string[];
  homeLib: string;
  awayLib: string;
};

type State = {
  page: "sbSetup" | "sbLive" | "sbSetEnd";
  set: number;
  format: number;
  serving: Team;
  homeTeam: string;
  awayTeam: string;
  homeLine: string[];
  awayLine: string[];
  homeLib: string;
  awayLib: string;
  homeScore: number;
  awayScore: number;
  homeSubs: number;
  awaySubs: number;
  homeTO: number;
  awayTO: number;
  homeRot: number;
  awayRot: number;
  homeGrid: (number | string)[][];
  awayGrid: (number | string)[][];
  homeCircled: number[][];
  awayCircled: number[][];
  homePlayers: string[][];
  awayPlayers: string[][];
  homeTimeouts: string[];
  awayTimeouts: string[];
  pointLog: PointEntry[];
  subLog: SubEntry[];
  toLog: TOEntry[];
  setData: SetData[];
  matchDone: boolean;
  // Source of truth for the current set; everything above is derived from these.
  events: BookEvent[];
  setStart: SetStart | null;
};

const grid6 = (): number[][] => [[], [], [], [], [], []];

function makeInitial(home: string, away: string): State {
  return {
    page: "sbSetup",
    set: 1,
    format: 3,
    serving: "home",
    homeTeam: home,
    awayTeam: away,
    homeLine: ["", "", "", "", "", ""],
    awayLine: ["", "", "", "", "", ""],
    homeLib: "",
    awayLib: "",
    homeScore: 0,
    awayScore: 0,
    homeSubs: 0,
    awaySubs: 0,
    homeTO: 0,
    awayTO: 0,
    homeRot: 0,
    awayRot: 0,
    homeGrid: grid6(),
    awayGrid: grid6(),
    homeCircled: grid6(),
    awayCircled: grid6(),
    homePlayers: grid6().map(() => [] as string[]),
    awayPlayers: grid6().map(() => [] as string[]),
    homeTimeouts: [],
    awayTimeouts: [],
    pointLog: [],
    subLog: [],
    toLog: [],
    setData: [],
    matchDone: false,
    events: [],
    setStart: null,
  };
}

type Derived = Pick<
  State,
  | "homeScore" | "awayScore" | "serving" | "homeRot" | "awayRot"
  | "homeGrid" | "awayGrid" | "homeCircled" | "awayCircled"
  | "homeLine" | "awayLine" | "homePlayers" | "awayPlayers"
  | "homeSubs" | "awaySubs" | "homeTO" | "awayTO"
  | "homeTimeouts" | "awayTimeouts" | "pointLog" | "subLog" | "toLog"
>;

// Rebuild the whole set from its starting lineups + the event list.
function replaySet(start: SetStart, events: BookEvent[], setNumber: number): Derived {
  let homeScore = 0;
  let awayScore = 0;
  let serving: Team = start.serving;
  let homeRot = start.homeRot;
  let awayRot = start.awayRot;
  let homeSubs = 0;
  let awaySubs = 0;
  let homeTO = 0;
  let awayTO = 0;
  const homeLine = [...start.homeLine];
  const awayLine = [...start.awayLine];
  const homeGrid: (number | string)[][] = [[], [], [], [], [], []];
  const awayGrid: (number | string)[][] = [[], [], [], [], [], []];
  const homeCircled: number[][] = [[], [], [], [], [], []];
  const awayCircled: number[][] = [[], [], [], [], [], []];
  const homePlayers = start.homeLine.map((n) => [n]);
  const awayPlayers = start.awayLine.map((n) => [n]);
  const homeTimeouts: string[] = [];
  const awayTimeouts: string[] = [];
  const pointLog: PointEntry[] = [];
  const subLog: SubEntry[] = [];
  const toLog: TOEntry[] = [];

  for (const ev of events) {
    const isHome = ev.team === "home";
    if (ev.k === "point") {
      const wasServing = serving;
      const sideout = ev.team !== wasServing;
      if (isHome) homeScore++;
      else awayScore++;
      const ptVal = isHome ? homeScore : awayScore;
      if (sideout) {
        // The serving team has just been sided out. Their term of service ends
        // here, so circle the last point that server put up — the circle marks
        // where a service term finished, not where one began. A server who
        // never scored has nothing to circle.
        const lostRot = wasServing === "home" ? homeRot : awayRot;
        const lostGrid = wasServing === "home" ? homeGrid : awayGrid;
        const lostCircled = wasServing === "home" ? homeCircled : awayCircled;
        const row = lostGrid[lostRot];
        for (let i = row.length - 1; i >= 0; i--) {
          if (typeof row[i] === "number") {
            if (!lostCircled[lostRot].includes(i)) lostCircled[lostRot].push(i);
            break;
          }
        }

        serving = ev.team;
        // Winning the serve rotates the receiving team into their next slot.
        if (isHome) {
          homeRot = (homeRot + 1) % 6;
          homeGrid[homeRot].push(ptVal);
        } else {
          awayRot = (awayRot + 1) % 6;
          awayGrid[awayRot].push(ptVal);
        }
      } else if (isHome) {
        homeGrid[homeRot].push(ptVal);
      } else {
        awayGrid[awayRot].push(ptVal);
      }
      const serverLine = serving === "home" ? homeLine : awayLine;
      const serverRot = serving === "home" ? homeRot : awayRot;
      pointLog.push({
        team: ev.team,
        homeScore,
        awayScore,
        server: serverLine[serverRot],
        serving,
        sideout,
      });
    } else if (ev.k === "sub") {
      if ((isHome ? homeSubs : awaySubs) >= 18) continue;
      const line = isHome ? homeLine : awayLine;
      const idx = line.indexOf(String(ev.out));
      if (idx === -1) continue;
      line[idx] = String(ev.playerIn);
      (isHome ? homePlayers : awayPlayers)[idx].push(String(ev.playerIn));
      (isHome ? homeGrid : awayGrid)[idx].push("S");
      if (isHome) homeSubs++;
      else awaySubs++;
      subLog.push({
        team: ev.team,
        out: ev.out,
        playerIn: ev.playerIn,
        set: setNumber,
        homeScore,
        awayScore,
      });
    } else if (ev.k === "timeout") {
      if ((isHome ? homeTO : awayTO) >= 2) continue;
      const my = isHome ? homeScore : awayScore;
      const opp = isHome ? awayScore : homeScore;
      if (isHome) {
        homeTO++;
        homeTimeouts.push(my + "-" + opp);
      } else {
        awayTO++;
        awayTimeouts.push(my + "-" + opp);
      }
      toLog.push({ team: ev.team, homeScore, awayScore });
    } else {
      // Manual circle toggle by the bookkeeper.
      const circled = isHome ? homeCircled : awayCircled;
      const at = circled[ev.row].indexOf(ev.col);
      if (at >= 0) circled[ev.row].splice(at, 1);
      else circled[ev.row].push(ev.col);
    }
  }

  return {
    homeScore, awayScore, serving, homeRot, awayRot,
    homeGrid, awayGrid, homeCircled, awayCircled,
    homeLine, awayLine, homePlayers, awayPlayers,
    homeSubs, awaySubs, homeTO, awayTO,
    homeTimeouts, awayTimeouts, pointLog, subLog, toLog,
  };
}

// Apply a new event list to the set, recomputing everything it drives.
function withEvents(state: State, events: BookEvent[]): State {
  if (!state.setStart) return state;
  return { ...state, ...replaySet(state.setStart, events, state.set), events };
}

// A book saved before the event log existed still has its point/sub/timeout
// logs. Rebuild an equivalent event list from them so undo works, keeping the
// old starting rotations so the restored grid matches what was on screen.
function migrateStoredState(stored: State): State {
  if (Array.isArray(stored.events) && stored.setStart !== undefined) return stored;

  const pts = stored.pointLog || [];
  const subs = stored.subLog || [];
  const tos = stored.toLog || [];
  const flip = (t: Team): Team => (t === "home" ? "away" : "home");
  // A first rally that wasn't a sideout means the scorer was already serving.
  const startServing: Team = pts.length
    ? pts[0].sideout
      ? flip(pts[0].team)
      : pts[0].team
    : stored.serving;

  const setStart: SetStart = {
    homeLine: (stored.homePlayers || []).map((p) => p?.[0] ?? ""),
    awayLine: (stored.awayPlayers || []).map((p) => p?.[0] ?? ""),
    serving: startServing,
    homeRot: 0,
    awayRot: 0,
  };

  // Subs and timeouts recorded the score they happened at, so slot them back
  // between the points that produced that score.
  const pending: { at: [number, number]; ev: BookEvent; used: boolean }[] = [
    ...subs.map((s) => ({
      at: [s.homeScore, s.awayScore] as [number, number],
      ev: { k: "sub", team: s.team, out: s.out, playerIn: s.playerIn } as BookEvent,
      used: false,
    })),
    ...tos.map((t) => ({
      at: [t.homeScore, t.awayScore] as [number, number],
      ev: { k: "timeout", team: t.team } as BookEvent,
      used: false,
    })),
  ];

  const events: BookEvent[] = [];
  for (let i = 0; i <= pts.length; i++) {
    const h = i === 0 ? 0 : pts[i - 1].homeScore;
    const aw = i === 0 ? 0 : pts[i - 1].awayScore;
    for (const p of pending) {
      if (!p.used && p.at[0] === h && p.at[1] === aw) {
        p.used = true;
        events.push(p.ev);
      }
    }
    if (i < pts.length) events.push({ k: "point", team: pts[i].team });
  }
  for (const p of pending) if (!p.used) events.push(p.ev);

  const base: State = { ...stored, events, setStart };
  if (stored.page === "sbLive" && setStart.homeLine.some(Boolean)) {
    return withEvents(base, events);
  }
  return base;
}

type Action =
  | { t: "field"; f: keyof State; v: unknown }
  | { t: "startSet" }
  | { t: "point"; team: Team }
  | { t: "removePoint"; team: Team }
  | { t: "circle"; team: Team; row: number; col: number }
  | { t: "undo" }
  | { t: "sub"; team: Team; out: string; playerIn: string }
  | { t: "timeout"; team: Team }
  | { t: "endSet" }
  | { t: "nextSet" }
  | { t: "backToLive" }
  | { t: "hydrate"; state: State };

function reducer(state: State, a: Action): State {
  switch (a.t) {
    case "hydrate":
      return migrateStoredState(a.state);
    case "field":
      return { ...state, [a.f]: a.v } as State;
    case "startSet": {
      if (state.homeLine.some((x) => !x) || state.awayLine.some((x) => !x)) return state;
      // The receiving team starts a rotation back, so their first sideout
      // brings serve order I to the service line (not II).
      const setStart: SetStart = {
        homeLine: [...state.homeLine],
        awayLine: [...state.awayLine],
        serving: state.serving,
        homeRot: startRot(state.serving === "home"),
        awayRot: startRot(state.serving === "away"),
      };
      return withEvents({ ...state, page: "sbLive", setStart }, []);
    }
    case "point":
      return withEvents(state, [...state.events, { k: "point", team: a.team }]);
    case "sub":
      return withEvents(state, [
        ...state.events,
        { k: "sub", team: a.team, out: a.out, playerIn: a.playerIn },
      ]);
    case "timeout":
      return withEvents(state, [...state.events, { k: "timeout", team: a.team }]);
    case "circle":
      return withEvents(state, [
        ...state.events,
        { k: "circle", team: a.team, row: a.row, col: a.col },
      ]);
    case "undo":
      if (!state.events.length) return state;
      return withEvents(state, state.events.slice(0, -1));
    case "removePoint": {
      // The −1 buttons drop that team's most recent point and rebuild, so
      // rotation and serve stay consistent with the remaining rallies.
      let idx = -1;
      for (let i = state.events.length - 1; i >= 0; i--) {
        const ev = state.events[i];
        if (ev.k === "point" && ev.team === a.team) {
          idx = i;
          break;
        }
      }
      if (idx === -1) return state;
      const next = [...state.events];
      next.splice(idx, 1);
      return withEvents(state, next);
    }
    case "endSet": {
      const setResult: SetData = {
        set: state.set,
        homeScore: state.homeScore,
        awayScore: state.awayScore,
        homeGrid: state.homeGrid.map((r) => [...r]),
        awayGrid: state.awayGrid.map((r) => [...r]),
        homeCircled: state.homeCircled.map((r) => [...r]),
        awayCircled: state.awayCircled.map((r) => [...r]),
        pointLog: [...state.pointLog],
        subLog: [...state.subLog],
        homeLine: [...state.homeLine],
        awayLine: [...state.awayLine],
        homeLib: state.homeLib,
        awayLib: state.awayLib,
      };
      const newSetData = [...state.setData, setResult];
      const needed = Math.ceil(state.format / 2);
      const hw = newSetData.filter((s) => s.homeScore > s.awayScore).length;
      const aw = newSetData.filter((s) => s.awayScore > s.homeScore).length;
      return { ...state, setData: newSetData, page: "sbSetEnd", matchDone: hw >= needed || aw >= needed };
    }
    case "nextSet": {
      const ls = state.serving;
      return {
        ...state,
        page: "sbSetup",
        set: state.set + 1,
        homeScore: 0,
        awayScore: 0,
        homeSubs: 0,
        awaySubs: 0,
        homeTO: 0,
        awayTO: 0,
        homeRot: 0,
        awayRot: 0,
        homeGrid: grid6(),
        awayGrid: grid6(),
        homeCircled: grid6(),
        awayCircled: grid6(),
        homePlayers: grid6().map(() => [] as string[]),
        awayPlayers: grid6().map(() => [] as string[]),
        homeTimeouts: [],
        awayTimeouts: [],
        pointLog: [],
        subLog: [],
        toLog: [],
        events: [],
        setStart: null,
        serving: ls === "home" ? "away" : "home",
      };
    }
    case "backToLive":
      return { ...state, page: "sbLive" };
    default:
      return state;
  }
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI"];

// Court slots keyed by the standard volleyball position number, with screen
// coords. 1 = right back (serving spot), then counter-clockwise 2..6.
const COURT_SLOTS = [
  { court: 4, x: "15%", y: "20%" }, // left front
  { court: 3, x: "50%", y: "20%" }, // middle front
  { court: 2, x: "85%", y: "20%" }, // right front
  { court: 5, x: "15%", y: "70%" }, // left back
  { court: 6, x: "50%", y: "70%" }, // middle back
  { court: 1, x: "85%", y: "70%" }, // right back
];

// A team that receives first starts one rotation "behind": serve order I lines
// up in right front (court 2), so the first sideout rotates I into the serving
// spot. Serving first means I starts in right back (court 1).
const startRot = (servesFirst: boolean) => (servesFirst ? 0 : 5);

// Which serve-order slot (0-5) occupies a given court position, for a team
// currently at rotation `rot`.
const serveIndexAtCourt = (court: number, rot: number) => (rot + court - 1) % 6;

export function ScorebookClient({
  storageKey,
  initialHome,
  initialAway,
  roster,
  rosterSide,
  saveBook,
  onExit,
}: {
  storageKey: string;
  initialHome: string;
  initialAway: string;
  roster: RosterEntry[];
  /** Which side of the book our roster is on. The opposing team is tracked by
   *  jersey number only — we have no names for them. */
  rosterSide: Team;
  saveBook: (payload: ScorebookSavePayload) => Promise<void>;
  onExit: () => void;
}) {
  const [state, dispatch] = useReducer(reducer, undefined, () => makeInitial(initialHome, initialAway));
  const [subModal, setSubModal] = useState<{ team: Team; position?: number } | null>(null);
  const [subOut, setSubOut] = useState("");
  const [subIn, setSubIn] = useState("");
  const [setEndDismissed, setSetEndDismissed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const prevSet = useRef(state.set);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) dispatch({ t: "hydrate", state: JSON.parse(raw) });
    } catch {}
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {}
  }, [state, hydrated, storageKey]);

  if (prevSet.current !== state.set) {
    prevSet.current = state.set;
    if (setEndDismissed) setSetEndDismissed(false);
  }

  // ── Lineup entry: drag a roster player into a slot, or tap-then-tap ──
  // Built on pointer events rather than HTML5 drag-and-drop, which doesn't
  // fire on touchscreens — this has to work on a tablet at the scorer's table.
  const dragRef = useRef<{ num: string; startX: number; startY: number; moved: boolean } | null>(null);
  const [dragging, setDragging] = useState<{ num: string; name: string; x: number; y: number } | null>(null);
  const [hoverSlot, setHoverSlot] = useState<string | null>(null);
  const [pickedPlayer, setPickedPlayer] = useState<string | null>(null);

  // Put a jersey number in a slot. A player can only occupy one slot per team,
  // so assigning them somewhere new clears where they were.
  function assignSlot(team: Team, idx: number, num: string) {
    const key = team === "home" ? "homeLine" : "awayLine";
    const line = [...(team === "home" ? state.homeLine : state.awayLine)];
    const existing = line.indexOf(num);
    if (existing >= 0 && existing !== idx) line[existing] = "";
    line[idx] = num;
    dispatch({ t: "field", f: key, v: line });
  }

  const slotUnder = (x: number, y: number): { team: Team; idx: number } | null => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    const slot = el?.closest("[data-slot]") as HTMLElement | null;
    if (!slot?.dataset.slot) return null;
    const [team, idx] = slot.dataset.slot.split(":");
    // Our players can only be dropped into our own lineup.
    if (team !== rosterSide) return null;
    return { team: team as Team, idx: parseInt(idx, 10) };
  };

  function rosterPointerDown(e: React.PointerEvent, p: RosterEntry) {
    dragRef.current = { num: String(p.num), startX: e.clientX, startY: e.clientY, moved: false };
    setDragging({ num: String(p.num), name: p.name, x: e.clientX, y: e.clientY });
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  }

  function rosterPointerMove(e: React.PointerEvent) {
    const d = dragRef.current;
    if (!d) return;
    if (!d.moved && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > 6) d.moved = true;
    if (!d.moved) return;
    setDragging((cur) => (cur ? { ...cur, x: e.clientX, y: e.clientY } : cur));
    const hit = slotUnder(e.clientX, e.clientY);
    setHoverSlot(hit ? `${hit.team}:${hit.idx}` : null);
  }

  function rosterPointerUp(e: React.PointerEvent) {
    const d = dragRef.current;
    dragRef.current = null;
    setDragging(null);
    setHoverSlot(null);
    if (!d) return;
    if (d.moved) {
      const hit = slotUnder(e.clientX, e.clientY);
      if (hit) assignSlot(hit.team, hit.idx, d.num);
    } else {
      // A plain tap arms the player; the next slot tapped receives them.
      setPickedPlayer((cur) => (cur === d.num ? null : d.num));
    }
  }

  // Wraps a lineup input so it can receive a dragged or armed player.
  const slotProps = (team: Team, idx: number) => ({
    "data-slot": `${team}:${idx}`,
    onClick: () => {
      if (pickedPlayer && team === rosterSide) {
        assignSlot(team, idx, pickedPlayer);
        setPickedPlayer(null);
      }
    },
  });

  const isHovered = (team: Team, idx: number) => hoverSlot === `${team}:${idx}`;
  // Only our own empty boxes light up as drop targets.
  const isDroppable = (team: Team) => team === rosterSide;

  const currentServer = () => {
    const l = state.serving === "home" ? state.homeLine : state.awayLine;
    const r = state.serving === "home" ? state.homeRot : state.awayRot;
    return l[r] || "?";
  };

  async function handleSaveMatch() {
    setSaving(true);
    const sets: ScorebookSetInput[] = state.setData.map((s) => ({
      setNumber: s.set,
      homeScore: s.homeScore,
      awayScore: s.awayScore,
      homeLine: s.homeLine,
      awayLine: s.awayLine,
      homeLibero: s.homeLib,
      awayLibero: s.awayLib,
      homeGrid: s.homeGrid,
      awayGrid: s.awayGrid,
      homeCircled: s.homeCircled,
      awayCircled: s.awayCircled,
      pointLog: s.pointLog,
      subLog: s.subLog,
      timeoutLog: [],
    }));
    try {
      await saveBook({
        homeTeam: state.homeTeam,
        awayTeam: state.awayTeam,
        format: state.format,
        sets,
      });
      localStorage.removeItem(storageKey);
      onExit();
    } catch (e) {
      setSaving(false);
      alert("Failed to save scorebook: " + (e instanceof Error ? e.message : "unknown"));
    }
  }

  const NavBar = ({ right }: { right?: React.ReactNode }) => (
    <div className="bg-navy px-6 py-3 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 bg-white/[0.08] border-none text-white/60 text-xs font-semibold px-3.5 py-1.5 rounded-lg cursor-pointer"
        >
          <Icon n="arrowLeft" size={14} color="rgba(255,255,255,0.6)" sw={2} /> Back
        </button>
        <div>
          <div className="text-[10px] text-white/30 font-semibold uppercase font-label tracking-[0.1em]">Scorebook</div>
          <div className="flex items-baseline gap-2">
            <div className="text-lg font-extrabold text-white">Set {state.set}</div>
            {state.setData.length > 0 && (
              <div className="text-[13px] font-bold text-white/50">
                {state.setData.filter((s) => s.homeScore > s.awayScore).length}–
                {state.setData.filter((s) => s.awayScore > s.homeScore).length}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2">{right}</div>
    </div>
  );

  // ── SETUP ──
  if (state.page === "sbSetup") {
    const teams: {
      team: Team;
      name: string;
      nameKey: keyof State;
      line: string[];
      lineKey: keyof State;
      lib: string;
      libKey: keyof State;
      color: string;
    }[] = [
      { team: "home", name: state.homeTeam, nameKey: "homeTeam", line: state.homeLine, lineKey: "homeLine", lib: state.homeLib, libKey: "homeLib", color: "var(--color-navy)" },
      { team: "away", name: state.awayTeam, nameKey: "awayTeam", line: state.awayLine, lineKey: "awayLine", lib: state.awayLib, libKey: "awayLib", color: "var(--color-red)" },
    ];
    const canStart = state.homeLine.every((x) => x) && state.awayLine.every((x) => x);
    return (
      <div className="min-h-screen bg-bg font-display">
        <NavBar
          right={
            <button
              onClick={() => dispatch({ t: "startSet" })}
              disabled={!canStart}
              className="px-7 py-2.5 text-[13px] font-extrabold border-none rounded-[10px] cursor-pointer uppercase font-label tracking-[0.04em]"
              style={{ background: canStart ? "#FFF" : "rgba(255,255,255,0.3)", color: "var(--color-navy)" }}
            >
              Start Set {state.set}
            </button>
          }
        />
        {state.set === 1 && (
          <div className="px-7 pt-4 flex items-center gap-2.5">
            <span className="text-[11px] font-bold text-text-sec uppercase font-label tracking-[0.08em]">Format</span>
            {[3, 5].map((f) => (
              <button
                key={f}
                onClick={() => dispatch({ t: "field", f: "format", v: f })}
                className="px-5 py-2 text-[13px] font-bold rounded-[10px] cursor-pointer border-2 border-navy"
                style={{ background: state.format === f ? "var(--color-navy)" : "var(--color-surface)", color: state.format === f ? "#FFF" : "var(--color-navy)" }}
              >
                Best of {f}
              </button>
            ))}
          </div>
        )}
        <div className="px-7 pt-4 pb-2 flex items-center gap-2.5">
          <span className="text-[11px] font-bold text-text-sec uppercase font-label tracking-[0.08em]">First serve</span>
          {(["home", "away"] as Team[]).map((sv) => (
            <button
              key={sv}
              onClick={() => dispatch({ t: "field", f: "serving", v: sv })}
              className="px-5 py-2 text-xs font-bold rounded-[10px] cursor-pointer border-2 border-navy"
              style={{ background: state.serving === sv ? "var(--color-navy)" : "var(--color-surface)", color: state.serving === sv ? "#FFF" : "var(--color-navy)" }}
            >
              {sv === "home" ? state.homeTeam : state.awayTeam}
            </button>
          ))}
        </div>
        {/* Side by side needs ~500px per card for the serve order names to
            breathe; below that (tablet portrait, phones) stack them instead. */}
        <div className="flex flex-col lg:flex-row gap-4 px-7 pb-7">
          {teams.map((t) => (
            <div key={t.team} className="flex-1 bg-surface rounded-2xl overflow-hidden shadow-card">
              <div className="h-[3px]" style={{ background: t.color }} />
              <div className="px-[18px] py-3.5 border-b border-border">
                <div className="text-[9px] font-bold uppercase font-label tracking-[0.12em] mb-1" style={{ color: t.color }}>
                  {t.team.toUpperCase()}
                </div>
                <input
                  value={t.name}
                  onChange={(e) => dispatch({ t: "field", f: t.nameKey, v: e.target.value })}
                  className="text-xl font-extrabold text-text bg-transparent border-none outline-none w-full tracking-[-0.02em]"
                />
              </div>
              <div className="flex">
                <div className="flex-[0_0_220px] p-3.5 border-r border-border">
                  <div className="text-[9px] font-bold text-text-ter uppercase font-label tracking-[0.08em] mb-2">Court</div>
                  <div className="relative h-[170px] bg-bg-alt rounded-[10px] border border-border">
                    <div className="absolute top-[12%] left-[5%] right-[5%] h-[1.5px] bg-border" />
                    {COURT_SLOTS.map((slot) => {
                      const idx = serveIndexAtCourt(slot.court, startRot(state.serving === t.team));
                      const val = t.line[idx];
                      const hot =
                        isHovered(t.team, idx) || (!!pickedPlayer && isDroppable(t.team) && !val);
                      return (
                        <div
                          key={slot.court}
                          {...slotProps(t.team, idx)}
                          className="absolute -translate-x-1/2 -translate-y-1/2"
                          style={{
                            left: slot.x,
                            top: slot.y,
                            cursor: pickedPlayer && isDroppable(t.team) ? "copy" : undefined,
                          }}
                        >
                          <input
                            type="number"
                            value={val}
                            onChange={(e) => {
                              const l = [...t.line];
                              l[idx] = e.target.value;
                              dispatch({ t: "field", f: t.lineKey, v: l });
                            }}
                            className="w-12 h-10 rounded-lg text-center text-base font-extrabold text-navy outline-none transition-colors"
                            style={{
                              border: hot
                                ? "2px dashed var(--color-navy)"
                                : val
                                ? `2px solid ${t.color}`
                                : "1.5px dashed var(--color-border)",
                              background: isHovered(t.team, idx)
                                ? "var(--color-navy-bg)"
                                : val
                                ? "var(--color-surface)"
                                : "transparent",
                            }}
                          />
                          <div className="text-[8px] text-text-ter text-center mt-0.5 font-label font-bold">
                            {ROMAN[idx]}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-[10px] text-text-sec mt-1.5 leading-snug">
                    {state.serving === t.team ? (
                      <>Serving first — <strong className="text-navy">I</strong> starts in right back.</>
                    ) : (
                      <>Receiving first — <strong className="text-navy">I</strong> starts in right front.</>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 px-2.5 py-2 bg-libero-bg rounded-lg">
                    <span className="text-[10px] font-extrabold text-libero">LIB</span>
                    <input
                      type="number"
                      value={t.lib}
                      onChange={(e) => dispatch({ t: "field", f: t.libKey, v: e.target.value })}
                      placeholder="#"
                      className="w-11 px-1.5 py-1 rounded-md border border-libero-border bg-surface text-center text-[15px] font-extrabold text-libero outline-none"
                    />
                  </div>
                </div>
                <div className="flex-1 p-3.5">
                  <div className="text-[9px] font-bold text-text-ter uppercase font-label tracking-[0.08em] mb-2">Serve order</div>
                  {ROMAN.map((pos, idx) => {
                    const hot =
                      isHovered(t.team, idx) ||
                      (!!pickedPlayer && isDroppable(t.team) && !t.line[idx]);
                    // Names come from our roster, so they only apply to our side.
                    const named = isDroppable(t.team)
                      ? roster.find((r) => String(r.num) === String(t.line[idx]))
                      : undefined;
                    return (
                      <div
                        key={pos}
                        {...slotProps(t.team, idx)}
                        className="flex items-center gap-1.5 mb-1.5 rounded-lg transition-colors"
                        style={{
                          background: isHovered(t.team, idx) ? "var(--color-navy-bg)" : "transparent",
                          cursor: pickedPlayer && isDroppable(t.team) ? "copy" : undefined,
                        }}
                      >
                        <span className="w-[22px] text-[11px] font-bold text-text-ter">{pos}</span>
                        <input
                          type="number"
                          value={t.line[idx]}
                          onChange={(e) => {
                            const l = [...t.line];
                            l[idx] = e.target.value;
                            dispatch({ t: "field", f: t.lineKey, v: l });
                          }}
                          className="w-[50px] px-2 py-1.5 rounded-lg bg-bg text-center text-[15px] font-extrabold text-text outline-none transition-colors"
                          style={{
                            border: hot ? "2px dashed var(--color-navy)" : "1.5px solid var(--color-border)",
                          }}
                        />
                        {named && <span className="text-[10px] text-text-ter ml-1">{named.name}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
        {roster.some((p) => p.name) && (
          <div className="px-7 pb-7">
            <div className="px-4 py-3 bg-surface rounded-xl shadow-card-sm">
              <div className="flex items-baseline justify-between mb-2 gap-3">
                <div className="text-[9px] font-bold text-text-ter uppercase font-label tracking-[0.08em]">
                  Roster · {rosterSide === "home" ? state.homeTeam : state.awayTeam}
                </div>
                <div className="text-[11px] text-text-sec">
                  {pickedPlayer ? (
                    <span className="text-navy font-semibold">
                      Now tap a {rosterSide === "home" ? "Home" : "Away"} lineup box to place #
                      {pickedPlayer}
                    </span>
                  ) : (
                    <>Drag a player into a lineup box — or tap them, then tap the box.</>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {roster
                  .filter((p) => p.name)
                  .map((p) => {
                    const inLineup =
                      state.homeLine.includes(String(p.num)) || state.awayLine.includes(String(p.num));
                    const armed = pickedPlayer === String(p.num);
                    return (
                    <span
                      key={p.num}
                      onPointerDown={(e) => rosterPointerDown(e, p)}
                      onPointerMove={rosterPointerMove}
                      onPointerUp={rosterPointerUp}
                      onPointerCancel={() => {
                        dragRef.current = null;
                        setDragging(null);
                        setHoverSlot(null);
                      }}
                      className="text-[11px] px-2.5 py-1.5 rounded-md font-semibold border select-none transition-all"
                      style={{
                        // Stops the page scrolling out from under a drag on touch.
                        touchAction: "none",
                        cursor: "grab",
                        opacity: inLineup && !armed ? 0.45 : 1,
                        background: armed
                          ? "var(--color-navy)"
                          : p.lib
                          ? "var(--color-libero-bg)"
                          : "var(--color-bg-alt)",
                        color: armed ? "#FFF" : p.lib ? "var(--color-libero)" : "var(--color-text)",
                        borderColor: armed
                          ? "var(--color-navy)"
                          : p.lib
                          ? "var(--color-libero-border)"
                          : "var(--color-border)",
                      }}
                    >
                      #{p.num} {p.name}
                    </span>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Chip that follows the finger/cursor while dragging a player. */}
        {dragging && (
          <div
            className="fixed z-[300] pointer-events-none text-[12px] px-3 py-1.5 rounded-lg font-bold bg-navy text-white shadow-card-lg"
            style={{ left: dragging.x, top: dragging.y, transform: "translate(-50%, -160%)" }}
          >
            #{dragging.num} {dragging.name}
          </div>
        )}
      </div>
    );
  }

  // ── SET END ──
  if (state.page === "sbSetEnd") {
    const lastSet = state.setData[state.setData.length - 1];
    const hw = state.setData.filter((s) => s.homeScore > s.awayScore).length;
    const aw = state.setData.filter((s) => s.awayScore > s.homeScore).length;
    return (
      <div className="min-h-screen bg-bg font-display">
        <NavBar
          right={
            <>
              <button
                onClick={() => dispatch({ t: "backToLive" })}
                className="px-4 py-2.5 text-xs font-bold bg-white/10 text-white/70 border-none rounded-[10px] cursor-pointer"
              >
                ← Edit
              </button>
              {state.matchDone ? (
                <button
                  onClick={handleSaveMatch}
                  disabled={saving}
                  className="px-6 py-2.5 text-[13px] font-extrabold bg-white text-navy border-none rounded-[10px] cursor-pointer uppercase font-label"
                >
                  {saving ? "Saving…" : "Save match"}
                </button>
              ) : (
                <button
                  onClick={() => dispatch({ t: "nextSet" })}
                  className="px-6 py-2.5 text-[13px] font-extrabold bg-white text-navy border-none rounded-[10px] cursor-pointer uppercase font-label"
                >
                  Next set →
                </button>
              )}
            </>
          }
        />
        <div className="max-w-[520px] mx-auto my-8 px-6">
          <div className="text-center p-7 bg-surface rounded-[20px] shadow-card mb-4">
            <div className="text-2xl font-extrabold tracking-[-0.03em]">
              <span style={{ color: lastSet.homeScore > lastSet.awayScore ? "var(--color-navy)" : "var(--color-text-sec)" }}>
                {state.homeTeam} {lastSet.homeScore}
              </span>
              <span className="text-border mx-2.5">—</span>
              <span style={{ color: lastSet.awayScore > lastSet.homeScore ? "var(--color-red)" : "var(--color-text-sec)" }}>
                {lastSet.awayScore} {state.awayTeam}
              </span>
            </div>
            <div className="text-[13px] text-text-sec mt-2">
              Sets: {hw} — {aw}
            </div>
          </div>
          {state.setData.map((s, i) => (
            <div key={i} className="px-[18px] py-3 bg-surface rounded-xl mb-2 shadow-card-sm flex justify-between items-center">
              <span className="text-xs font-bold text-text-ter uppercase font-label">Set {s.set}</span>
              <span className="text-base font-extrabold">
                <span style={{ color: s.homeScore > s.awayScore ? "var(--color-navy)" : "var(--color-text-sec)" }}>{s.homeScore}</span>
                <span className="text-border mx-2">—</span>
                <span style={{ color: s.awayScore > s.homeScore ? "var(--color-red)" : "var(--color-text-sec)" }}>{s.awayScore}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── LIVE ──
  // Only a best-of-5 has a short deciding set; every set of a best-of-3 is to 25.
  const maxPt = state.format === 5 && state.set >= 5 ? 15 : 25;
  const hGP = state.homeScore >= maxPt - 1 && state.homeScore - state.awayScore >= 1;
  const aGP = state.awayScore >= maxPt - 1 && state.awayScore - state.homeScore >= 1;
  const hWon = state.homeScore >= maxPt && state.homeScore - state.awayScore >= 2;
  const aWon = state.awayScore >= maxPt && state.awayScore - state.homeScore >= 2;

  const teams = [
    {
      team: "home" as Team,
      name: state.homeTeam,
      color: "var(--color-navy)",
      colorLight: "var(--color-navy-bg)",
      line: state.homeLine,
      lib: state.homeLib,
      rot: state.homeRot,
      subs: state.homeSubs,
      to: state.homeTO,
      grid: state.homeGrid,
      circled: state.homeCircled,
      score: state.homeScore,
      players: state.homePlayers,
      timeouts: state.homeTimeouts,
    },
    {
      team: "away" as Team,
      name: state.awayTeam,
      color: "var(--color-red)",
      colorLight: "var(--color-red-bg)",
      line: state.awayLine,
      lib: state.awayLib,
      rot: state.awayRot,
      subs: state.awaySubs,
      to: state.awayTO,
      grid: state.awayGrid,
      circled: state.awayCircled,
      score: state.awayScore,
      players: state.awayPlayers,
      timeouts: state.awayTimeouts,
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-bg font-display overflow-hidden">
      <div className="bg-navy px-5 py-2.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[15px] font-extrabold text-white">CourtIQ</span>
          <span className="text-[11px] font-bold text-navy-bg px-2.5 py-0.5 bg-navy-mid rounded-md">SET {state.set}</span>
          <span className="text-[11px] text-white/40">
            Serving:{" "}
            <strong className="text-white">
              #{currentServer()} {state.serving === "home" ? state.homeTeam : state.awayTeam}
            </strong>
          </span>
          <span className="text-[22px] font-extrabold text-white">
            {state.homeScore} <span className="text-white/25 text-sm">—</span> {state.awayScore}
          </span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => dispatch({ t: "undo" })}
            className="px-3.5 py-1.5 text-xs font-bold bg-accent-bg text-accent border border-accent-border rounded-lg cursor-pointer"
          >
            ↩ Undo
          </button>
          <button
            onClick={onExit}
            className="px-3.5 py-1.5 text-[11px] font-semibold border-none rounded-lg cursor-pointer"
            style={{ background: "rgba(192,57,43,0.25)", color: "#FCA5A5" }}
          >
            Exit
          </button>
        </div>
      </div>

      {/* One team per row, and the rows share whatever height is left after the
          bars — so a full book fits any tablet without scrolling. */}
      <div className="flex-1 min-h-0 flex flex-col gap-1.5 px-2.5 py-1.5">
        {(hGP || aGP) && !hWon && !aWon && (
          <div className="flex-shrink-0 px-3.5 py-1.5 bg-yellow-bg border border-yellow-border rounded-[10px] text-xs font-bold text-yellow">
            Game point — {hGP ? state.homeTeam : state.awayTeam} ({state.homeScore}-{state.awayScore})
          </div>
        )}

        {teams.map((tm) => {
          const cols = Math.max(25, ...tm.grid.map((r) => r.length + 2));
          return (
            <div
              key={tm.team}
              className="flex-1 min-h-0 flex flex-col bg-surface rounded-[14px] overflow-hidden shadow-card-sm"
            >
              <div className="h-[3px] flex-shrink-0" style={{ background: tm.color }} />
              <div className="flex-shrink-0 flex items-center justify-between px-3 py-1.5 bg-bg border-b border-border gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[13px] font-extrabold text-text truncate">{tm.name}</span>
                  <span className="text-[24px] font-extrabold leading-none" style={{ color: tm.color }}>
                    {tm.score}
                  </span>
                </div>
                <div className="flex gap-1.5 items-center">
                  <button
                    onClick={() => dispatch({ t: "timeout", team: tm.team })}
                    disabled={tm.to >= 2}
                    className="px-3.5 py-1.5 text-[11px] font-bold rounded-lg border-2"
                    style={{
                      cursor: tm.to >= 2 ? "default" : "pointer",
                      background: tm.to >= 2 ? "var(--color-red-bg)" : "var(--color-surface)",
                      borderColor: tm.to >= 2 ? "var(--color-red-border)" : "var(--color-navy)",
                      color: tm.to >= 2 ? "var(--color-red)" : "var(--color-navy)",
                    }}
                  >
                    {tm.to >= 2 ? "T/O Used" : "T/O " + tm.to + "/2"}
                    {tm.timeouts.length > 0 ? " (" + tm.timeouts.join(", ") + ")" : ""}
                  </button>
                  <div className="flex rounded-lg overflow-hidden border-2" style={{ borderColor: tm.color }}>
                    <button
                      onClick={() => dispatch({ t: "removePoint", team: tm.team })}
                      disabled={tm.score <= 0}
                      className="px-3 py-2 text-sm font-extrabold bg-surface border-none"
                      style={{ cursor: tm.score > 0 ? "pointer" : "default", color: tm.score > 0 ? tm.color : "var(--color-border)", borderRight: `1px solid ${tm.color}` }}
                    >
                      −1
                    </button>
                    <button
                      onClick={() => dispatch({ t: "point", team: tm.team })}
                      className="px-[18px] py-2 text-sm font-extrabold text-white border-none cursor-pointer"
                      style={{ background: tm.color }}
                    >
                      +1
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex flex-1 min-h-0 overflow-hidden">
                {/* rotation labels */}
                <div className="flex-shrink-0 flex flex-col border-r border-border bg-bg">
                  <div className="h-[18px] flex-shrink-0" />
                  {[0, 1, 2, 3, 4, 5].map((r) => {
                    const act = state.serving === tm.team && r === tm.rot;
                    return (
                      <div
                        key={r}
                        className="w-[22px] flex-1 min-h-[30px] max-h-[56px] flex items-center justify-center text-[10px] font-extrabold border-b border-border"
                        style={{ color: act ? "#FFF" : "var(--color-text-ter)", background: act ? "var(--color-navy)" : "transparent" }}
                      >
                        {ROMAN[r]}
                      </div>
                    );
                  })}
                </div>
                {/* players */}
                <div
                  className="flex-shrink-0 w-[130px] flex flex-col"
                  style={{ borderRight: "2px solid var(--color-navy-border)" }}
                >
                  <div className="h-[18px] flex-shrink-0 flex items-center justify-center text-[8px] font-bold text-text-ter border-b border-border uppercase font-label tracking-[0.08em]">
                    Players
                  </div>
                  {tm.line.map((pn, ri) => {
                    const act = state.serving === tm.team && ri === tm.rot;
                    const ph = tm.players[ri] || [];
                    const cur = ph.length > 0 ? ph[ph.length - 1] : pn;
                    return (
                      <div
                        key={ri}
                        className="flex items-center flex-1 min-h-[30px] max-h-[56px] border-b border-border px-1 overflow-x-auto whitespace-nowrap"
                        style={{ background: act ? "var(--color-navy-bg)" : "transparent" }}
                      >
                        {ph.map((p, pi) => (
                          <span key={pi} className="inline-flex items-center">
                            {pi > 0 && <span className="text-[8px] text-border-light mx-0.5">/</span>}
                            {p === cur ? (
                              // The player on court: a full-height tap target, since
                              // this is what opens the sub sheet mid-match.
                              <button
                                onClick={() => {
                                  setSubModal({ team: tm.team, position: ri });
                                  setSubOut(p);
                                }}
                                title="Substitute"
                                className="min-w-[38px] h-9 px-2 rounded-lg text-[15px] font-extrabold border cursor-pointer active:scale-95 transition-transform"
                                style={{
                                  color: act ? "var(--color-navy)" : "var(--color-text)",
                                  background: act ? "var(--color-surface)" : "var(--color-bg-alt)",
                                  borderColor: act ? "var(--color-navy-border)" : "var(--color-border)",
                                }}
                              >
                                {p}
                              </button>
                            ) : (
                              // Subbed out. Needs to stay readable — the book is
                              // a record of who played, not just who's on now.
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
                  {tm.lib && (
                    <div className="h-[20px] flex-shrink-0 flex items-center px-1.5 bg-libero-bg">
                      <span className="text-[9px] font-extrabold text-libero">LIB #{tm.lib}</span>
                    </div>
                  )}
                </div>
                {/* grid */}
                <div
                  className="flex-1 min-w-0 overflow-x-auto flex flex-col"
                  style={{ borderRight: "2px solid var(--color-navy-border)" }}
                >
                  <div className="flex border-b border-border h-[18px] flex-shrink-0 bg-bg">
                    {Array.from({ length: cols }, (_, i) => (
                      <div
                        key={i}
                        className="w-[30px] flex-shrink-0 flex items-center justify-center text-[8px] text-text font-bold border-r border-border"
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  {tm.line.map((_, ri) => {
                    const act = state.serving === tm.team && ri === tm.rot;
                    const rd = tm.grid[ri] || [];
                    const rc = tm.circled[ri] || [];
                    return (
                      <div
                        key={ri}
                        className="flex flex-1 min-h-[30px] max-h-[56px] border-b border-border"
                        style={{ background: act ? "var(--color-navy-bg)" : "transparent" }}
                      >
                        {Array.from({ length: cols }, (_, ci) => {
                          const v = rd[ci];
                          const has = v !== undefined;
                          const cir = rc.includes(ci);
                          const isSub = v === "S";
                          return (
                            <div
                              key={ci}
                              onClick={() => {
                                if (has && !isSub) dispatch({ t: "circle", team: tm.team, row: ri, col: ci });
                              }}
                              className="w-[30px] flex-shrink-0 flex items-center justify-center border-r border-border"
                              style={{ cursor: has && !isSub ? "pointer" : "default" }}
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
                                    border: cir ? `2px solid ${tm.color}` : "none",
                                    color: cir ? tm.color : "var(--color-text)",
                                    background: cir ? tm.colorLight : "transparent",
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
              <div className="flex-shrink-0 flex items-center border-t border-border px-2.5 py-1 bg-bg overflow-hidden">
                <span className="text-[9px] font-bold text-text-ter mr-1.5 uppercase font-label tracking-[0.06em]">Subs</span>
                <div className="flex gap-0.5 min-w-0 overflow-hidden">
                  {Array.from({ length: 18 }, (_, i) => (
                    <div
                      key={i}
                      className="w-[15px] h-[15px] flex-shrink-0 flex items-center justify-center text-[8px] font-bold rounded"
                      style={{
                        background: i < tm.subs ? "var(--color-navy)" : "var(--color-surface)",
                        color: i < tm.subs ? "#FFF" : "var(--color-border)",
                        border: `1px solid ${i < tm.subs ? "var(--color-navy)" : "var(--color-border)"}`,
                      }}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
                <span className="text-[10px] font-extrabold text-navy ml-2 flex-shrink-0">{tm.subs}/18</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-5 py-2.5 bg-surface border-t border-border flex items-center justify-between flex-shrink-0">
        <div className="text-[11px] text-text-sec">
          {state.setData.length > 0 && (
            <span>
              Sets: {state.setData.filter((s) => s.homeScore > s.awayScore).length}–
              {state.setData.filter((s) => s.awayScore > s.homeScore).length}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => dispatch({ t: "endSet" })}
            className="px-5 py-2.5 text-xs font-extrabold bg-navy text-white border-none rounded-[10px] cursor-pointer uppercase font-label tracking-[0.04em]"
          >
            End Set
          </button>
        </div>
      </div>

      {/* Set-complete popup */}
      {(hWon || aWon) && !setEndDismissed && (
        <div className="fixed inset-0 bg-[rgba(13,27,62,0.5)] backdrop-blur-sm flex items-center justify-center z-[200]">
          <div className="slideup bg-surface rounded-[20px] p-8 max-w-[360px] w-[90%] text-center shadow-card-lg">
            <div className="text-xl font-extrabold mb-1.5">Set complete?</div>
            <div className="text-sm text-text-sec mb-6">
              {state.homeTeam} {state.homeScore} — {state.awayScore} {state.awayTeam}
            </div>
            <div className="flex gap-2.5 justify-center">
              <GhostBtn onClick={() => setSetEndDismissed(true)}>Continue</GhostBtn>
              <PrimaryBtn
                onClick={() => {
                  setSetEndDismissed(true);
                  dispatch({ t: "endSet" });
                }}
              >
                End set
              </PrimaryBtn>
            </div>
          </div>
        </div>
      )}

      {/* Sub modal */}
      {subModal &&
        (() => {
          const teamColor = subModal.team === "home" ? "var(--color-navy)" : "var(--color-red)";
          const teamName = subModal.team === "home" ? state.homeTeam : state.awayTeam;
          const line = subModal.team === "home" ? state.homeLine : state.awayLine;
          const players = subModal.team === "home" ? state.homePlayers : state.awayPlayers;
          const posIdx = subModal.position !== undefined ? subModal.position : subOut ? line.indexOf(subOut) : -1;
          const posHistory = posIdx >= 0 ? players[posIdx] || [] : [];
          const suggestedIn = posHistory.length >= 2 ? posHistory[posHistory.length - 2] : "";
          // Bench = our roster minus whoever is on court. Only meaningful for
          // our own side; we don't know the opponent's bench.
          const benchPlayers =
            rosterSide === subModal.team ? roster.filter((r) => !line.includes(String(r.num))) : [];
          const close = () => {
            setSubModal(null);
            setSubOut("");
            setSubIn("");
          };
          return (
            <div
              className="fixed inset-0 bg-[rgba(13,27,62,0.5)] backdrop-blur-sm flex items-start sm:items-center justify-center z-[200] overflow-y-auto py-6"
              onClick={close}
            >
              <div
                className="slideup bg-surface rounded-[20px] p-6 max-w-[380px] w-[92%] shadow-card-lg my-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-5">
                  <div className="text-[10px] font-bold text-text-ter uppercase font-label tracking-[0.1em]">Substitution</div>
                  <div className="text-lg font-extrabold mt-1" style={{ color: teamColor }}>
                    {teamName}
                  </div>
                </div>
                {!subOut ? (
                  <div className="mb-5">
                    <div className="text-[13px] text-text-sec text-center mb-3.5">Who&apos;s coming out?</div>
                    <div className="flex gap-2 flex-wrap justify-center">
                      {line.map((num, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSubModal({ ...subModal, position: idx });
                            setSubOut(num);
                          }}
                          className="w-14 h-14 rounded-xl text-xl font-extrabold cursor-pointer bg-bg border-2 border-navy text-navy"
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-[10px] font-extrabold text-red mb-2 uppercase font-label">Out</div>
                      <div className="w-16 h-16 rounded-xl bg-red-bg border-[3px] border-red-border flex items-center justify-center text-[26px] font-extrabold text-red">
                        {subOut}
                      </div>
                      <button
                        onClick={() => setSubOut("")}
                        className="text-[10px] text-text-ter bg-none border-none cursor-pointer mt-1.5 underline"
                      >
                        change
                      </button>
                    </div>
                    <div className="text-[26px] text-border font-light">→</div>
                    <div className="text-center">
                      <div className="text-[10px] font-extrabold text-green mb-2 uppercase font-label">In</div>
                      {/* A plain box, not a text field: tapping it must not raise
                          the on-screen keyboard, which covers this sheet on a
                          tablet. Numbers come from the pad below instead. */}
                      <div className="w-16 h-16 rounded-xl border-[3px] border-green-border bg-green-bg flex items-center justify-center text-[26px] font-extrabold text-green">
                        {subIn || <span className="text-green/35">#</span>}
                      </div>
                      {subIn && (
                        <button
                          onClick={() => setSubIn("")}
                          className="text-[10px] text-text-ter bg-none border-none cursor-pointer mt-1.5 underline"
                        >
                          clear
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {subOut && (
                  <div className="mb-5">
                    {benchPlayers.length > 0 && (
                      <>
                        <div className="text-[10px] font-bold text-text-ter uppercase font-label tracking-[0.08em] mb-2">
                          On the bench
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {suggestedIn && (
                            <button
                              onClick={() => setSubIn(suggestedIn)}
                              className="px-3 py-2 text-xs font-bold rounded-lg cursor-pointer bg-green-bg text-green border-[1.5px] border-green-border"
                            >
                              #{suggestedIn} back in
                            </button>
                          )}
                          {benchPlayers.map((p) => (
                            <button
                              key={p.num}
                              onClick={() => setSubIn(String(p.num))}
                              className="px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer bg-bg-alt text-text border border-border"
                            >
                              #{p.num} {p.name}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                    {benchPlayers.length === 0 && suggestedIn && (
                      <button
                        onClick={() => setSubIn(suggestedIn)}
                        className="w-full mb-3 px-3 py-2 text-xs font-bold rounded-lg cursor-pointer bg-green-bg text-green border-[1.5px] border-green-border"
                      >
                        #{suggestedIn} back in
                      </button>
                    )}

                    <div className="text-[10px] font-bold text-text-ter uppercase font-label tracking-[0.08em] mb-2">
                      Or enter a number
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((d) => (
                        <button
                          key={d}
                          onClick={() => setSubIn((v) => (v.length >= 2 ? v : v + d))}
                          className="h-12 rounded-xl text-lg font-extrabold cursor-pointer bg-bg border border-border text-text active:scale-95 transition-transform"
                        >
                          {d}
                        </button>
                      ))}
                      <button
                        onClick={() => setSubIn((v) => v.slice(0, -1))}
                        className="h-12 rounded-xl text-lg font-extrabold cursor-pointer bg-bg-alt border border-border text-text-sec col-span-2 active:scale-95 transition-transform"
                      >
                        ⌫
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex justify-center gap-2.5">
                  <GhostBtn onClick={close}>Cancel</GhostBtn>
                  <PrimaryBtn
                    disabled={!subOut || !subIn}
                    onClick={() => {
                      if (subOut && subIn) {
                        dispatch({ t: "sub", team: subModal.team, out: subOut, playerIn: subIn });
                        close();
                      }
                    }}
                  >
                    Confirm
                  </PrimaryBtn>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
