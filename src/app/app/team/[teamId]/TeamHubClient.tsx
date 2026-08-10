"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { PrimaryBtn, GhostBtn } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Pill } from "@/components/ui/Pill";
import {
  addPlayer,
  updatePlayer,
  setLibero,
  removePlayer,
  addGame,
  removeGame,
  importGames,
} from "./actions";

type Player = { id: string; jersey_num: number; name: string; position: string; is_libero: boolean };
type Game = { id: string; opponent: string; home_away: "Home" | "Away"; game_date: string };
type MatchSet = { set_number: number; home_score: number; away_score: number };
type Match = {
  id: string;
  match_date: string;
  home_team_name: string;
  away_team_name: string;
  match_sets: MatchSet[];
};
type Header = {
  teamId: string;
  teamName: string;
  levelName: string;
  orgName: string;
};
type Scorebook = {
  id: string;
  home_team: string;
  away_team: string;
  created_at: string;
  scorebook_sets: MatchSet[];
};
type SiblingTeam = { id: string; name: string; games: Game[] };

const POSITIONS = ["OH", "MB", "S", "OPP", "L", "DS"];

export function TeamHubClient({
  header,
  userName,
  players,
  games,
  matches,
  scorebooks,
  siblingTeams,
}: {
  header: Header;
  userName: string;
  players: Player[];
  games: Game[];
  matches: Match[];
  scorebooks: Scorebook[];
  siblingTeams: SiblingTeam[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [editId, setEditId] = useState<string | null>(null);
  const [showAddGame, setShowAddGame] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [gameForm, setGameForm] = useState<{ opponent: string; date: string; homeAway: "Home" | "Away" }>({
    opponent: "",
    date: "",
    homeAway: "Home",
  });
  const teamId = header.teamId;
  const refresh = () => router.refresh();
  const run = (p: Promise<unknown>) => startTransition(() => p.then(refresh));

  const tools = [
    {
      icon: "barChart" as const,
      title: "Stats Tracker",
      desc: "Live match stats & rotations",
      color: "var(--color-green)",
      bg: "var(--color-green-bg)",
      href: `/app/team/${teamId}/stats`,
    },
    {
      icon: "clipboard" as const,
      title: "Practice Planner",
      desc: "Build and run drill plans",
      color: "var(--color-navy)",
      bg: "var(--color-navy-bg)",
      href: `/app/team/${teamId}/practice`,
    },
    {
      icon: "book" as const,
      title: "Scorebook",
      desc: "Glover's digital scorebook",
      color: "var(--color-accent)",
      bg: "var(--color-accent-bg)",
      href: `/app/team/${teamId}/scorebook`,
    },
    {
      icon: "trendingUp" as const,
      title: "Season Stats",
      desc: "Team & player season totals",
      color: "var(--color-gold)",
      bg: "var(--color-gold-bg)",
      href: `/app/team/${teamId}/season`,
    },
  ];

  const SH = ({
    children,
    action,
    actionLabel,
  }: {
    children: React.ReactNode;
    action?: () => void;
    actionLabel?: string;
  }) => (
    <div className="flex items-center justify-between mb-3">
      <div className="text-[11px] font-extrabold text-text-ter uppercase font-label tracking-[0.1em]">
        {children}
      </div>
      {action && (
        <button onClick={action} className="text-[11px] font-bold text-accent bg-none border-none cursor-pointer p-0">
          {actionLabel}
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-bg font-display">
      {/* Header */}
      <div className="bg-navy px-7 py-3.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3.5">
          <Link
            href="/app"
            className="flex items-center gap-1.5 bg-white/[0.08] text-white/55 text-xs font-semibold px-3 py-1.5 rounded-lg"
          >
            <Icon n="arrowLeft" size={13} color="rgba(255,255,255,0.55)" sw={2} /> Teams
          </Link>
          <div>
            <div className="text-[10px] text-white/30 font-bold uppercase font-label tracking-[0.12em]">
              {header.orgName}
              {header.levelName ? " · " + header.levelName : ""}
            </div>
            <div className="text-[22px] font-extrabold text-white tracking-[-0.03em] leading-tight">
              {header.teamName}
            </div>
          </div>
        </div>
        <div className="text-[11px] text-white/30 font-medium">{players.length} players</div>
      </div>

      {/* Split layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT — Roster */}
        <div className="flex-[0_0_56%] overflow-auto px-[26px] py-[22px] border-r border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[11px] font-extrabold text-text-ter uppercase font-label tracking-[0.1em]">
              Roster · {players.length}
            </div>
            <button
              onClick={() =>
                startTransition(() => addPlayer(teamId).then((id) => { router.refresh(); setEditId(id); }))
              }
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-navy text-white border-none rounded-lg cursor-pointer"
            >
              <Icon n="plus" size={13} color="#FFF" sw={2.5} /> Player
            </button>
          </div>

          <div className="grid grid-cols-[52px_1fr_48px_52px_36px] pb-2 border-b-[1.5px] border-border mb-1.5 px-1">
            {["#", "Name", "Pos", "", ""].map((h, i) => (
              <div
                key={i}
                className={`text-[9px] font-extrabold text-text-ter uppercase font-label tracking-[0.08em] ${
                  i === 0 || i >= 3 ? "text-center" : "text-left"
                }`}
              >
                {h}
              </div>
            ))}
          </div>

          <div className="flex flex-col">
            {players.map((p) =>
              editId === p.id ? (
                <EditablePlayerRow
                  key={p.id}
                  player={p}
                  teamId={teamId}
                  onClose={() => setEditId(null)}
                  run={run}
                />
              ) : (
                <div key={p.id}>
                  <div className="grid grid-cols-[52px_1fr_48px_52px_36px] items-center py-2.5 px-1 border-b border-border-light">
                    <div
                      onClick={() => setEditId(p.id)}
                      className="text-[15px] font-extrabold cursor-pointer text-center"
                      style={{ color: p.is_libero ? "var(--color-libero)" : "var(--color-navy)" }}
                    >
                      #{p.jersey_num}
                    </div>
                    <div onClick={() => setEditId(p.id)} className="text-sm font-medium text-text cursor-pointer">
                      {p.name || <span className="text-text-ter italic text-xs">unnamed</span>}
                    </div>
                    <div className="text-xs text-text-sec text-center">
                      {p.position || <span className="text-border-light">—</span>}
                    </div>
                    <div className="text-center">
                      {p.is_libero && <Pill label="LIB" color="var(--color-libero)" bg="var(--color-libero-bg)" />}
                    </div>
                    <button
                      onClick={() => setEditId(p.id)}
                      className="bg-none border-none cursor-pointer text-text-ter text-center p-0"
                    >
                      <Icon n="edit" size={14} color="var(--color-text-ter)" />
                    </button>
                  </div>
                </div>
              )
            )}
            {players.length === 0 && (
              <div className="text-[13px] text-text-ter py-6 text-center">
                No players yet. Click “+ Player” to build your roster.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Tools + Schedule + History */}
        <div className="flex-1 overflow-auto px-5 py-[22px] flex flex-col gap-7">
          {/* Tools */}
          <div>
            <SH>Tools</SH>
            <div className="flex flex-col gap-2">
              {tools.map((c) => (
                <Link
                  key={c.title}
                  href={c.href}
                  className="flex items-center gap-3.5 text-left bg-surface border-none rounded-[14px] px-4 py-3.5 cursor-pointer shadow-card-sm hover:shadow-card transition-all"
                >
                  <div
                    className="w-[42px] h-[42px] rounded-[11px] flex items-center justify-center flex-shrink-0"
                    style={{ background: c.bg }}
                  >
                    <Icon n={c.icon} size={20} color={c.color} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[15px] font-bold text-text tracking-[-0.01em]">{c.title}</div>
                    <div className="text-xs text-text-sec mt-px">{c.desc}</div>
                  </div>
                  <Icon n="chevronRight" size={16} color="var(--color-text-ter)" />
                </Link>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] font-extrabold text-text-ter uppercase font-label tracking-[0.1em]">
                Schedule
              </div>
              <div className="flex items-center gap-3">
                {siblingTeams.some((t) => t.games.length > 0) && (
                  <button
                    onClick={() => setShowImport(true)}
                    className="text-[11px] font-bold text-accent bg-none border-none cursor-pointer p-0"
                  >
                    Import games
                  </button>
                )}
                <button
                  onClick={() => setShowAddGame((v) => !v)}
                  className="text-[11px] font-bold text-accent bg-none border-none cursor-pointer p-0"
                >
                  {showAddGame ? "Cancel" : "+ Add game"}
                </button>
              </div>
            </div>
            {showAddGame && (
              <div className="fadein px-4 py-3.5 bg-surface rounded-xl mb-2.5 shadow-card-sm">
                <div className="flex gap-2 flex-wrap items-end">
                  <div className="flex-[1_1_130px]">
                    <Label>Opponent</Label>
                    <Input
                      value={gameForm.opponent}
                      onChange={(e) => setGameForm({ ...gameForm, opponent: e.target.value })}
                      placeholder="Team name"
                      className="!py-2 !text-xs"
                    />
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={gameForm.date}
                      onChange={(e) => setGameForm({ ...gameForm, date: e.target.value })}
                      className="!py-2 !text-xs"
                    />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <div className="flex gap-1">
                      {(["Home", "Away"] as const).map((ha) => (
                        <button
                          key={ha}
                          onClick={() => setGameForm({ ...gameForm, homeAway: ha })}
                          className="px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer border-[1.5px]"
                          style={{
                            background: gameForm.homeAway === ha ? "var(--color-navy)" : "var(--color-bg)",
                            color: gameForm.homeAway === ha ? "#FFF" : "var(--color-text-sec)",
                            borderColor: gameForm.homeAway === ha ? "var(--color-navy)" : "var(--color-border)",
                          }}
                        >
                          {ha}
                        </button>
                      ))}
                    </div>
                  </div>
                  <PrimaryBtn
                    disabled={!gameForm.opponent}
                    onClick={() => {
                      if (gameForm.opponent) {
                        run(addGame(teamId, gameForm.opponent, gameForm.homeAway, gameForm.date));
                        setGameForm({ opponent: "", date: "", homeAway: "Home" });
                        setShowAddGame(false);
                      }
                    }}
                    className="!py-2 !px-4 !text-xs"
                  >
                    Add
                  </PrimaryBtn>
                </div>
              </div>
            )}
            {games.length === 0 && !showAddGame && (
              <div className="text-xs text-text-ter py-2">No games scheduled yet.</div>
            )}
            {games.map((g) => (
              <div key={g.id} className="bg-surface rounded-[10px] mb-1.5 shadow-card-sm overflow-hidden">
                <div className="flex items-center justify-between px-3.5 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Pill
                      label={g.home_away}
                      color={g.home_away === "Home" ? "var(--color-navy)" : "var(--color-text-sec)"}
                      bg={g.home_away === "Home" ? "var(--color-navy-bg)" : "var(--color-bg-alt)"}
                    />
                    <div>
                      <div className="text-[13px] font-semibold">vs {g.opponent}</div>
                      <div className="text-[11px] text-text-ter">{g.game_date || "TBD"}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => run(removeGame(teamId, g.id))}
                    className="text-[11px] text-red bg-none border-none cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
                <div className="flex border-t border-border-light">
                  <Link
                    href={`/app/team/${teamId}/stats?gameId=${g.id}`}
                    className="flex-1 py-2.5 text-xs font-bold text-navy border-r border-border-light cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Icon n="barChart" size={13} color="var(--color-navy)" /> Take Stats
                  </Link>
                  <Link
                    href={`/app/team/${teamId}/scorebook?gameId=${g.id}`}
                    className="flex-1 py-2.5 text-xs font-bold text-navy cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Icon n="book" size={13} color="var(--color-navy)" /> Take Book
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Matches */}
          {matches.length > 0 && (
            <div>
              <SH>Recent Matches</SH>
              {matches.map((m) => {
                const sets = [...m.match_sets].sort((a, b) => a.set_number - b.set_number);
                const homeWins = sets.filter((s) => s.home_score > s.away_score).length;
                const awayWins = sets.filter((s) => s.away_score > s.home_score).length;
                const won = homeWins > awayWins;
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between px-3.5 py-2.5 bg-surface rounded-[10px] mb-1.5 shadow-card-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-extrabold"
                        style={{
                          background: won ? "var(--color-green-bg)" : "var(--color-red-bg)",
                          color: won ? "var(--color-green)" : "var(--color-red)",
                        }}
                      >
                        {won ? "W" : "L"}
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold">vs {m.away_team_name || "Opponent"}</div>
                        <div className="text-[11px] text-text-ter">
                          {m.match_date} · {sets.map((s) => s.home_score + "-" + s.away_score).join(", ")}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Scorebooks (incl. ones kept by bookkeepers) */}
          {scorebooks.length > 0 && (
            <div>
              <SH>Scorebooks</SH>
              {scorebooks.map((b) => {
                const sets = [...b.scorebook_sets].sort((a, b2) => a.set_number - b2.set_number);
                return (
                  <div
                    key={b.id}
                    className="flex items-center justify-between px-3.5 py-2.5 bg-surface rounded-[10px] mb-1.5 shadow-card-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-accent-bg flex items-center justify-center">
                        <Icon n="book" size={15} color="var(--color-accent)" />
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold">
                          {b.home_team || "Home"} vs {b.away_team || "Away"}
                        </div>
                        <div className="text-[11px] text-text-ter">
                          {new Date(b.created_at).toLocaleDateString()}
                          {sets.length > 0 && " · " + sets.map((s) => s.home_score + "-" + s.away_score).join(", ")}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showImport && (
        <ImportGamesModal
          teamId={teamId}
          teamName={header.teamName}
          siblingTeams={siblingTeams.filter((t) => t.games.length > 0)}
          existingGames={games}
          onClose={() => setShowImport(false)}
          onImported={() => {
            setShowImport(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

// Import selected games from a sibling team's schedule. Games already on this
// team (same opponent + date + home/away) are shown as already-added.
function ImportGamesModal({
  teamId,
  teamName,
  siblingTeams,
  existingGames,
  onClose,
  onImported,
}: {
  teamId: string;
  teamName: string;
  siblingTeams: SiblingTeam[];
  existingGames: Game[];
  onClose: () => void;
  onImported: () => void;
}) {
  const gkey = (g: { opponent: string; game_date: string; home_away: string }) =>
    `${g.opponent}|${g.game_date}|${g.home_away}`;
  const existingKeys = new Set(existingGames.map(gkey));
  const importableFor = (id: string) =>
    (siblingTeams.find((t) => t.id === id)?.games || []).filter((g) => !existingKeys.has(gkey(g)));

  const firstId = siblingTeams[0]?.id ?? "";
  const [sourceId, setSourceId] = useState(firstId);
  const [selected, setSelected] = useState<Set<string>>(() => new Set(importableFor(firstId).map((g) => g.id)));
  const [busy, setBusy] = useState(false);

  const source = siblingTeams.find((t) => t.id === sourceId);
  const importable = importableFor(sourceId);

  function changeSource(id: string) {
    setSourceId(id);
    setSelected(new Set(importableFor(id).map((g) => g.id))); // pre-check all importable
  }

  const toggle = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  async function doImport() {
    setBusy(true);
    try {
      await importGames(teamId, [...selected]);
      onImported();
    } catch (e) {
      setBusy(false);
      alert("Failed to import: " + (e instanceof Error ? e.message : "unknown"));
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="text-lg font-extrabold mb-1.5">Import games → {teamName}</div>
      <div className="text-[13px] text-text-sec mb-4 leading-relaxed">
        Copy games from another team in this level. They become {teamName}&apos;s own games — edit or remove any
        that differ (e.g. tournaments).
      </div>

      <Label>Import from</Label>
      <select
        value={sourceId}
        onChange={(e) => changeSource(e.target.value)}
        className="w-full px-3 py-2.5 text-[13px] rounded-[10px] border-[1.5px] border-border bg-bg outline-none text-text mb-4"
      >
        {siblingTeams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name} ({t.games.length} game{t.games.length !== 1 ? "s" : ""})
          </option>
        ))}
      </select>

      <div className="flex flex-col gap-1.5 max-h-[240px] overflow-auto mb-4">
        {(source?.games || []).map((g) => {
          const already = existingKeys.has(gkey(g));
          const checked = selected.has(g.id);
          return (
            <button
              key={g.id}
              disabled={already}
              onClick={() => toggle(g.id)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-left border"
              style={{
                borderColor: checked && !already ? "var(--color-navy)" : "var(--color-border)",
                background: already ? "var(--color-bg)" : checked ? "var(--color-navy-bg)" : "var(--color-surface)",
                cursor: already ? "default" : "pointer",
                opacity: already ? 0.6 : 1,
              }}
            >
              <div
                className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 text-[10px] text-white"
                style={{
                  background: already ? "var(--color-text-ter)" : checked ? "var(--color-navy)" : "transparent",
                  border: checked || already ? "none" : "1.5px solid var(--color-border)",
                }}
              >
                {(checked || already) && "✓"}
              </div>
              <Pill
                label={g.home_away}
                color={g.home_away === "Home" ? "var(--color-navy)" : "var(--color-text-sec)"}
                bg={g.home_away === "Home" ? "var(--color-navy-bg)" : "var(--color-bg-alt)"}
              />
              <div className="flex-1">
                <div className="text-[13px] font-semibold">vs {g.opponent}</div>
                <div className="text-[11px] text-text-ter">{g.game_date || "TBD"}</div>
              </div>
              {already && <span className="text-[10px] text-text-ter font-semibold">Already added</span>}
            </button>
          );
        })}
        {importable.length === 0 && (
          <div className="text-xs text-text-ter text-center py-3">
            All of this team&apos;s games are already on {teamName}&apos;s schedule.
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2.5">
        <GhostBtn onClick={onClose}>Cancel</GhostBtn>
        <PrimaryBtn disabled={busy || selected.size === 0} onClick={doImport}>
          {busy ? "Importing…" : `Import ${selected.size} game${selected.size !== 1 ? "s" : ""}`}
        </PrimaryBtn>
      </div>
    </Modal>
  );
}

// Roster edit row with instant local typing. Name/number are held in local
// state and only persisted on blur, so keystrokes never wait on the network.
function EditablePlayerRow({
  player,
  teamId,
  onClose,
  run,
}: {
  player: Player;
  teamId: string;
  onClose: () => void;
  run: (p: Promise<unknown>) => void;
}) {
  const [name, setName] = useState(player.name);
  const [jersey, setJersey] = useState(String(player.jersey_num));

  function saveName() {
    if (name !== player.name) run(updatePlayer(teamId, player.id, { name }));
  }
  function saveJersey() {
    const n = parseInt(jersey) || 0;
    if (n !== player.jersey_num) run(updatePlayer(teamId, player.id, { jersey_num: n }));
  }

  return (
    <div>
      <div className="grid grid-cols-[52px_1fr_48px_52px_36px] items-center py-2.5 px-1 border-b border-border-light bg-navy-bg rounded-t-lg">
        <input
          type="number"
          value={jersey}
          onChange={(e) => setJersey(e.target.value)}
          onBlur={saveJersey}
          className="w-[42px] p-1.5 text-[13px] rounded-md border-[1.5px] border-navy-border bg-surface text-center font-extrabold outline-none text-navy"
        />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={saveName}
          placeholder="Player name"
          autoFocus
          className="px-2 py-1.5 text-[13px] rounded-md border-[1.5px] border-border bg-surface outline-none w-[95%]"
        />
        <div className="text-[11px] text-text-sec text-center font-semibold">{player.position || "—"}</div>
        <button
          onClick={() => run(setLibero(teamId, player.id, !player.is_libero))}
          className="px-2 py-1.5 text-[11px] font-bold rounded-md border-none cursor-pointer mx-auto"
          style={{
            background: player.is_libero ? "var(--color-libero)" : "var(--color-bg-deep)",
            color: player.is_libero ? "#FFF" : "var(--color-text-sec)",
          }}
        >
          LIB
        </button>
        <button
          onClick={() => {
            saveName();
            saveJersey();
            onClose();
          }}
          className="text-[11px] font-bold text-accent bg-none border-none cursor-pointer text-center"
        >
          ✓
        </button>
      </div>
      <div className="px-1 pb-3 bg-navy-bg rounded-b-lg -mt-px">
        <div className="text-[9px] font-bold text-text-ter uppercase font-label tracking-[0.08em] mb-1.5 pt-1">
          Position
        </div>
        <div className="flex gap-1.5 flex-wrap mb-2.5">
          {POSITIONS.map((pos) => (
            <button
              key={pos}
              onClick={() => {
                run(updatePlayer(teamId, player.id, { position: player.position === pos ? "" : pos }));
                if (pos === "L" && !player.is_libero) run(setLibero(teamId, player.id, true));
              }}
              className="px-3.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer"
              style={{
                border: player.position === pos ? "none" : "1px solid var(--color-border)",
                background: player.position === pos ? "var(--color-navy)" : "var(--color-surface)",
                color: player.position === pos ? "#FFF" : "var(--color-text-sec)",
              }}
            >
              {pos}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            if (confirm("Remove #" + player.jersey_num + " from roster?")) {
              run(removePlayer(teamId, player.id));
              onClose();
            }
          }}
          className="text-[11px] font-semibold text-red bg-none border-none cursor-pointer p-0"
        >
          Remove player
        </button>
      </div>
    </div>
  );
}
