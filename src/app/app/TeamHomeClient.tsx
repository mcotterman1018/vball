"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { OrgContext, LevelWithTeams, Coach } from "@/lib/queries";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { AuthField } from "@/components/ui/Label";
import { PrimaryBtn, GhostBtn } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import {
  addLevel,
  addTeam,
  toggleFavorite,
  toggleCoachLevel,
  signOut,
  createBookkeeperLink,
  revokeBookkeeperLink,
} from "./actions";

export type BookkeeperLink = {
  id: string;
  level_id: string;
  token: string;
  label: string;
  active: boolean;
};

export function TeamHomeClient({
  ctx,
  levels,
  coaches,
  bookkeeperLinks,
}: {
  ctx: OrgContext;
  levels: LevelWithTeams[];
  coaches: Coach[];
  bookkeeperLinks: BookkeeperLink[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [adminTab, setAdminTab] = useState<"teams" | "coaches">("teams");
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [showAddLevel, setShowAddLevel] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newLevelName, setNewLevelName] = useState("");
  const [addTeamLevelId, setAddTeamLevelId] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [bookLinkLevel, setBookLinkLevel] = useState<{ id: string; name: string } | null>(null);

  const isAdmin = ctx.role === "admin";
  const visibleLevels = isAdmin
    ? levels
    : levels.filter((lv) => ctx.myLevelIds.includes(lv.id));
  const favTeams = levels
    .flatMap((lv) => lv.teams.map((t) => ({ ...t, levelName: lv.name })))
    .filter((t) => ctx.favoriteTeamIds.includes(t.id));

  function openTeam(teamId: string) {
    router.push(`/app/team/${teamId}`);
  }

  const TeamCard = ({
    team,
    levelName,
  }: {
    team: { id: string; name: string; playerCount: number };
    levelName?: string;
  }) => {
    const isFav = ctx.favoriteTeamIds.includes(team.id);
    return (
      <div className="relative">
        <button
          onClick={() => openTeam(team.id)}
          className="w-full text-left bg-surface border-none rounded-2xl p-[22px] cursor-pointer shadow-card transition-transform hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 rounded-[10px] bg-navy-bg flex items-center justify-center mb-3.5">
            <Icon n="users" size={20} color="var(--color-navy)" />
          </div>
          <div className="text-[17px] font-bold text-text mb-1">{team.name}</div>
          <div className="text-xs text-text-sec">
            {levelName ? levelName + " · " : ""}
            {team.playerCount} players
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-navy">
            Open <Icon n="chevronRight" size={14} color="var(--color-navy)" sw={2} />
          </div>
        </button>
        <button
          onClick={() => startTransition(() => toggleFavorite(team.id, isFav).then(() => router.refresh()))}
          title={isFav ? "Remove from My Teams" : "Add to My Teams"}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg border-none cursor-pointer text-base flex items-center justify-center"
          style={{
            background: isFav ? "var(--color-accent-bg)" : "var(--color-bg-alt)",
            color: isFav ? "var(--color-accent)" : "var(--color-text-ter)",
          }}
        >
          {isFav ? "★" : "☆"}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-bg font-display">
      {/* Header */}
      <div className="bg-navy px-8 py-5 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold text-white/35 uppercase font-label tracking-[0.12em] mb-0.5">
            {ctx.orgName}
          </div>
          <div className="text-[26px] font-extrabold text-white tracking-[-0.03em]">Teams</div>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <div className="px-3.5 py-1.5 bg-white/10 rounded-lg text-xs font-bold text-white/70 tracking-[0.15em]">
              {ctx.orgCode}
            </div>
          )}
          <div className="text-right">
            <div className="text-[13px] text-white/60 font-medium">{ctx.userName}</div>
            <div className="text-[10px] text-white/30 uppercase font-label tracking-[0.08em]">
              {isAdmin ? "Admin" : "Coach"}
            </div>
          </div>
          <button
            onClick={() => startTransition(() => signOut().then(() => router.push("/")))}
            className="px-4 py-2 text-xs font-semibold bg-white/[0.08] text-white/50 border-none rounded-lg cursor-pointer"
          >
            Log out
          </button>
        </div>
      </div>

      {/* Admin tabs */}
      {isAdmin && (
        <div className="flex gap-0.5 px-8 pt-4 border-b border-border bg-surface">
          {(
            [
              ["teams", "Teams"],
              ["coaches", "Coaches & Invites"],
            ] as const
          ).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setAdminTab(tab)}
              className="px-5 py-2.5 text-[13px] font-semibold rounded-t-lg border-none cursor-pointer"
              style={{
                background: adminTab === tab ? "var(--color-bg)" : "transparent",
                color: adminTab === tab ? "var(--color-navy)" : "var(--color-text-ter)",
                borderBottom: adminTab === tab ? "2px solid var(--color-navy)" : "2px solid transparent",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="px-8 py-7">
        {(adminTab === "teams" || !isAdmin) && (
          <>
            {isAdmin && (
              <div className="flex justify-end gap-2 mb-5">
                <button
                  onClick={() => setShowAddLevel(true)}
                  className="flex items-center gap-1.5 px-[18px] py-2.5 text-[13px] font-semibold bg-surface text-navy border-[1.5px] border-navy-border rounded-[10px] cursor-pointer"
                >
                  <Icon n="plus" size={14} color="var(--color-navy)" sw={2.5} /> Add level
                </button>
              </div>
            )}

            {visibleLevels.length === 0 && (
              <div className="text-center px-10 py-12 bg-surface rounded-2xl shadow-card-sm">
                <div className="w-14 h-14 rounded-[14px] bg-navy-bg flex items-center justify-center mx-auto mb-4">
                  <Icon n="users" size={28} color="var(--color-navy)" />
                </div>
                <div className="text-lg font-bold mb-1.5 text-text">
                  {isAdmin ? "Let's set up your program" : "No teams assigned yet"}
                </div>
                <div className="text-sm text-text-sec max-w-[380px] mx-auto leading-relaxed">
                  {isAdmin
                    ? 'Start by creating a level like "High School" or "Middle School", then add teams within it.'
                    : "Your admin hasn't assigned you to a level yet. Check back soon or reach out to them."}
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setShowAddLevel(true)}
                    className="mt-5 px-6 py-3 text-sm font-bold bg-navy text-white border-none rounded-xl cursor-pointer inline-flex items-center gap-2"
                  >
                    <Icon n="plus" size={16} color="#FFF" sw={2.5} /> Create your first level
                  </button>
                )}
              </div>
            )}

            {favTeams.length > 0 && (
              <div className="mb-7">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base text-accent">★</span>
                  <div className="text-lg font-extrabold text-text tracking-[-0.02em]">My Teams</div>
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3.5">
                  {favTeams.map((team) => (
                    <TeamCard key={team.id} team={team} levelName={team.levelName} />
                  ))}
                </div>
              </div>
            )}

            {visibleLevels.map((level) => (
              <div key={level.id} className="mb-7">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="text-lg font-extrabold text-navy tracking-[-0.02em]">{level.name}</div>
                    <div className="px-2.5 py-0.5 rounded-full bg-navy-bg text-[11px] font-bold text-navy">
                      {level.teams.length} team{level.teams.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setBookLinkLevel({ id: level.id, name: level.name })}
                        className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold bg-surface text-navy border border-navy-border rounded-lg cursor-pointer"
                      >
                        <Icon n="book" size={12} color="var(--color-navy)" sw={2} /> Book link
                      </button>
                      <button
                        onClick={() => {
                          setAddTeamLevelId(level.id);
                          setShowAddTeam(true);
                        }}
                        className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold bg-navy text-white border-none rounded-lg cursor-pointer"
                      >
                        <Icon n="plus" size={12} color="#FFF" sw={2.5} /> Add team
                      </button>
                    </div>
                  )}
                </div>
                {level.teams.length === 0 ? (
                  <div className="text-[13px] text-text-ter italic">No teams yet.</div>
                ) : (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3.5">
                    {level.teams.map((team) => (
                      <TeamCard key={team.id} team={team} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {adminTab === "coaches" && isAdmin && (
          <div className="max-w-[720px]">
            <div className="bg-navy rounded-2xl px-7 py-6 mb-6 text-white">
              <div className="text-[11px] font-bold text-white/50 uppercase font-label tracking-[0.1em] mb-1.5">
                Invite your coaches
              </div>
              <div className="text-[15px] text-white/85 mb-4 leading-relaxed">
                Share this code with your coaching staff. They&apos;ll create an account, enter the code, and pick their level.
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center bg-white/10 rounded-xl px-6 py-3.5">
                  <span className="text-[32px] font-extrabold tracking-[0.2em] font-label text-white">
                    {ctx.orgCode}
                  </span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(ctx.orgCode);
                    setCodeCopied(true);
                    setTimeout(() => setCodeCopied(false), 2000);
                  }}
                  className="px-[22px] py-3.5 text-[13px] font-bold border-none rounded-xl cursor-pointer flex items-center gap-2 transition-all"
                  style={{
                    background: codeCopied ? "var(--color-green)" : "#FFF",
                    color: codeCopied ? "#FFF" : "var(--color-navy)",
                  }}
                >
                  {codeCopied ? "✓ Copied!" : "Copy code"}
                </button>
              </div>
            </div>

            <div className="text-[15px] font-bold text-text mb-3.5">
              Coaching staff <span className="text-text-ter font-medium">({coaches.length})</span>
            </div>

            {coaches.map((coach) => {
              const isMe = coach.id === ctx.userId;
              return (
                <div key={coach.id} className="px-[18px] py-3.5 bg-surface rounded-xl mb-2 shadow-card-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-[15px] font-extrabold"
                      style={{
                        background: isMe ? "var(--color-accent-bg)" : "var(--color-navy-bg)",
                        color: isMe ? "var(--color-accent)" : "var(--color-navy)",
                      }}
                    >
                      {(coach.name || "?")[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">
                        {coach.name} {isMe && <span className="text-[11px] text-text-ter">(you)</span>}
                      </div>
                      <div className="text-xs text-text-ter">{coach.email}</div>
                    </div>
                    {isMe ? (
                      <Pill label="Admin · All access" color="var(--color-accent)" bg="var(--color-accent-bg)" />
                    ) : (
                      coach.levelIds.length === 0 && (
                        <Pill label="Needs level" color="var(--color-yellow)" bg="var(--color-yellow-bg)" />
                      )
                    )}
                  </div>
                  <div className="pl-[50px]">
                    <div className="text-[10px] font-bold text-text-ter uppercase font-label tracking-[0.08em] mb-1.5">
                      {isMe ? "My level (for quick access)" : "Assign to levels"}
                    </div>
                    {levels.length === 0 ? (
                      <div className="text-xs text-text-ter italic">Create a level first (Teams tab).</div>
                    ) : (
                      <div className="flex gap-1.5 flex-wrap">
                        {levels.map((lv) => {
                          const assigned = coach.levelIds.includes(lv.id);
                          return (
                            <button
                              key={lv.id}
                              onClick={() =>
                                startTransition(() =>
                                  toggleCoachLevel(coach.id, lv.id, assigned).then(() => router.refresh())
                                )
                              }
                              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer"
                              style={{
                                border: assigned ? "none" : "1px solid var(--color-border)",
                                background: assigned ? "var(--color-navy)" : "transparent",
                                color: assigned ? "#FFF" : "var(--color-text-sec)",
                              }}
                            >
                              {assigned ? "✓ " : ""}
                              {lv.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAddTeam && (
        <Modal
          onClose={() => {
            setShowAddTeam(false);
            setNewTeamName("");
          }}
        >
          <div className="text-lg font-extrabold mb-4">Add Team</div>
          <AuthField label="Team name">
            <Input
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Varsity, JV, Freshman…"
              autoFocus
            />
          </AuthField>
          <div className="flex justify-end gap-2.5 mt-4">
            <GhostBtn
              onClick={() => {
                setShowAddTeam(false);
                setNewTeamName("");
              }}
            >
              Cancel
            </GhostBtn>
            <PrimaryBtn
              disabled={!newTeamName}
              onClick={() => {
                if (newTeamName && addTeamLevelId) {
                  startTransition(() =>
                    addTeam(addTeamLevelId, newTeamName).then(() => router.refresh())
                  );
                  setShowAddTeam(false);
                  setNewTeamName("");
                }
              }}
            >
              Add
            </PrimaryBtn>
          </div>
        </Modal>
      )}

      {showAddLevel && (
        <Modal
          onClose={() => {
            setShowAddLevel(false);
            setNewLevelName("");
          }}
        >
          <div className="text-lg font-extrabold mb-4">Add Level</div>
          <AuthField label="Level name">
            <Input
              value={newLevelName}
              onChange={(e) => setNewLevelName(e.target.value)}
              placeholder="High School, Middle School…"
              autoFocus
            />
          </AuthField>
          <div className="flex justify-end gap-2.5 mt-4">
            <GhostBtn
              onClick={() => {
                setShowAddLevel(false);
                setNewLevelName("");
              }}
            >
              Cancel
            </GhostBtn>
            <PrimaryBtn
              disabled={!newLevelName}
              onClick={() => {
                if (newLevelName) {
                  startTransition(() => addLevel(ctx.orgId, newLevelName).then(() => router.refresh()));
                  setShowAddLevel(false);
                  setNewLevelName("");
                }
              }}
            >
              Add
            </PrimaryBtn>
          </div>
        </Modal>
      )}

      {bookLinkLevel && (
        <BookLinkModal
          level={bookLinkLevel}
          links={bookkeeperLinks.filter((l) => l.level_id === bookLinkLevel.id)}
          onClose={() => setBookLinkLevel(null)}
          onCreate={(label) =>
            startTransition(() => createBookkeeperLink(bookLinkLevel.id, label).then(() => router.refresh()))
          }
          onRevoke={(id) =>
            startTransition(() => revokeBookkeeperLink(id).then(() => router.refresh()))
          }
        />
      )}
    </div>
  );
}

function BookLinkModal({
  level,
  links,
  onClose,
  onCreate,
  onRevoke,
}: {
  level: { id: string; name: string };
  links: BookkeeperLink[];
  onClose: () => void;
  onCreate: (label: string) => void;
  onRevoke: (id: string) => void;
}) {
  const [label, setLabel] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <Modal onClose={onClose}>
      <div className="text-lg font-extrabold mb-1.5">Bookkeeper links — {level.name}</div>
      <div className="text-[13px] text-text-sec mb-4 leading-relaxed">
        Share a link with your bookkeeper. They can keep scorebooks for this level&apos;s teams — no account
        needed. Revoke any link to turn it off.
      </div>

      <div className="flex flex-col gap-2 mb-4">
        {links.length === 0 && (
          <div className="text-xs text-text-ter text-center py-3 bg-bg rounded-lg">No active links yet.</div>
        )}
        {links.map((l) => {
          const url = `${origin}/book/${l.token}`;
          return (
            <div key={l.id} className="bg-bg rounded-[10px] p-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-[13px] font-semibold">{l.label || "Bookkeeper link"}</div>
                <button
                  onClick={() => onRevoke(l.id)}
                  className="text-[11px] font-semibold text-red bg-none border-none cursor-pointer"
                >
                  Revoke
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  readOnly
                  value={url}
                  onFocus={(e) => e.currentTarget.select()}
                  className="flex-1 text-[11px] px-2 py-1.5 rounded-md border border-border bg-surface text-text-sec outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(url);
                    setCopiedId(l.id);
                    setTimeout(() => setCopiedId((c) => (c === l.id ? null : c)), 2000);
                  }}
                  className="px-3 py-1.5 text-[11px] font-bold rounded-md border-none cursor-pointer"
                  style={{
                    background: copiedId === l.id ? "var(--color-green)" : "var(--color-navy)",
                    color: "#FFF",
                  }}
                >
                  {copiedId === l.id ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <AuthField label="New link label (optional)">
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Home scorer table"
        />
      </AuthField>
      <div className="flex justify-end gap-2.5 mt-4">
        <GhostBtn onClick={onClose}>Done</GhostBtn>
        <PrimaryBtn
          onClick={() => {
            onCreate(label);
            setLabel("");
          }}
        >
          Generate link
        </PrimaryBtn>
      </div>
    </Modal>
  );
}
