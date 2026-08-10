"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { PrimaryBtn, GhostBtn } from "@/components/ui/Button";
import {
  createDrill,
  updateDrill,
  deleteDrill,
  savePractice,
  deletePractice,
  type PlanItemInput,
} from "./actions";

const CATEGORIES = ["All", "Warmup", "Passing", "Setting", "Attacking", "Serving", "Blocking", "Defense", "Game Play"];

export type Drill = {
  id: string;
  name: string;
  category: string;
  duration_min: number;
  description: string;
  focus: string;
  video_url: string;
  is_default: boolean;
};

export type PlanItem = {
  id: string;
  parentId: string | null;
  type: "drill" | "block" | "header" | "parallel";
  drillId: string | null;
  name: string;
  durationMin: number | null;
  groupIndex: number | null;
  sortOrder: number;
};

export type PracticeSummary = {
  id: string;
  title: string;
  practiceDate: string | null;
  durationMin: number;
  notes: string;
  itemCount: number;
  items: PlanItem[];
};

// Local editor model — a flat list of top-level items, blocks carry child drills.
type EditItem =
  | { uid: string; type: "header"; name: string }
  | { uid: string; type: "drill"; name: string; durationMin: number; focus: string; drillId: string | null }
  | {
      uid: string;
      type: "block";
      name: string;
      durationMin: number;
      children: { name: string; drillId: string | null; durationMin: number }[];
    };

let uidCounter = 0;
const nextUid = () => `e${Date.now()}_${uidCounter++}`;

export function PracticeClient({
  teamId,
  orgId,
  drills,
  practices,
}: {
  teamId: string;
  orgId: string;
  drills: Drill[];
  practices: PracticeSummary[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [tab, setTab] = useState<"plans" | "edit">("plans");

  // editor state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [durationMin, setDurationMin] = useState(90);
  const [practiceDate, setPracticeDate] = useState("");
  const [items, setItems] = useState<EditItem[]>([]);
  const [drillFilter, setDrillFilter] = useState("All");
  const [addingToBlock, setAddingToBlock] = useState<string | null>(null);

  // drill modals
  const [editDrill, setEditDrill] = useState<Drill | null>(null);
  const [newDrillOpen, setNewDrillOpen] = useState(false);

  // view
  const [viewing, setViewing] = useState<PracticeSummary | null>(null);

  const usedTime = items.reduce((s, it) => s + ("durationMin" in it ? it.durationMin || 0 : 0), 0);
  const remaining = durationMin - usedTime;
  const filtered = drillFilter === "All" ? drills : drills.filter((d) => d.category === drillFilter);
  const run = (p: Promise<unknown>) => startTransition(() => p.then(() => router.refresh()));

  function startNewPlan() {
    setEditingId(null);
    setTitle("");
    setDurationMin(90);
    setPracticeDate("");
    setItems([]);
    setTab("edit");
  }

  function loadPlanForEdit(p: PracticeSummary) {
    setEditingId(p.id);
    setTitle(p.title);
    setDurationMin(p.durationMin);
    setPracticeDate(p.practiceDate || "");
    const top = p.items.filter((i) => !i.parentId).sort((a, b) => a.sortOrder - b.sortOrder);
    const editItems: EditItem[] = top.map((it) => {
      if (it.type === "header") return { uid: nextUid(), type: "header", name: it.name };
      if (it.type === "block") {
        const children = p.items
          .filter((c) => c.parentId === it.id)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((c) => ({ name: c.name, drillId: c.drillId, durationMin: c.durationMin || 0 }));
        return { uid: nextUid(), type: "block", name: it.name, durationMin: it.durationMin || 0, children };
      }
      return {
        uid: nextUid(),
        type: "drill",
        name: it.name,
        durationMin: it.durationMin || 0,
        focus: "",
        drillId: it.drillId,
      };
    });
    setItems(editItems);
    setViewing(null);
    setTab("edit");
  }

  function addDrillToPlan(drill: Drill) {
    if (addingToBlock) {
      setItems((prev) =>
        prev.map((it) =>
          it.uid === addingToBlock && it.type === "block"
            ? { ...it, children: [...it.children, { name: drill.name, drillId: drill.id, durationMin: drill.duration_min }] }
            : it
        )
      );
    } else {
      setItems((prev) => [
        ...prev,
        { uid: nextUid(), type: "drill", name: drill.name, durationMin: drill.duration_min, focus: drill.focus, drillId: drill.id },
      ]);
    }
  }

  function moveItem(idx: number, dir: "up" | "down") {
    const ni = dir === "up" ? idx - 1 : idx + 1;
    if (ni < 0 || ni >= items.length) return;
    setItems((prev) => {
      const copy = [...prev];
      [copy[idx], copy[ni]] = [copy[ni], copy[idx]];
      return copy;
    });
  }

  async function handleSave() {
    const planItems: PlanItemInput[] = items.map((it) => {
      if (it.type === "header") return { type: "header", drillId: null, name: it.name, durationMin: null, groupIndex: null };
      if (it.type === "block")
        return {
          type: "block",
          drillId: null,
          name: it.name,
          durationMin: it.durationMin,
          groupIndex: null,
          children: it.children.map((c) => ({
            type: "drill" as const,
            drillId: c.drillId,
            name: c.name,
            durationMin: c.durationMin,
            groupIndex: null,
          })),
        };
      return { type: "drill", drillId: it.drillId, name: it.name, durationMin: it.durationMin, groupIndex: null };
    });
    await savePractice(
      teamId,
      editingId,
      { title: title || "Practice", practiceDate: practiceDate || null, durationMin, notes: "" },
      planItems
    );
    setTab("plans");
    router.refresh();
  }

  // ── View mode ──
  if (viewing) {
    const top = viewing.items.filter((i) => !i.parentId).sort((a, b) => a.sortOrder - b.sortOrder);
    let elapsed = 0;
    return (
      <div className="flex flex-col h-screen bg-bg font-display">
        <div className="bg-navy px-6 py-3.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewing(null)}
              className="flex items-center gap-1.5 bg-white/[0.08] border-none text-white/60 text-xs font-semibold px-3.5 py-1.5 rounded-lg cursor-pointer"
            >
              <Icon n="arrowLeft" size={14} color="rgba(255,255,255,0.6)" sw={2} /> Back
            </button>
            <div>
              <div className="text-[10px] text-white/30 font-bold uppercase font-label tracking-[0.1em]">
                {viewing.practiceDate}
              </div>
              <div className="text-xl font-extrabold text-white">{viewing.title || "Practice Plan"}</div>
            </div>
          </div>
          <button
            onClick={() => loadPlanForEdit(viewing)}
            className="px-4 py-2 text-xs font-semibold bg-white/10 text-white/70 border-none rounded-lg cursor-pointer"
          >
            Edit plan
          </button>
        </div>
        <div className="flex-1 overflow-auto px-7 py-5">
          <div className="text-[13px] text-text-sec mb-4">{viewing.durationMin} min total</div>
          {top.map((item) => {
            const rowStart = elapsed;
            if (item.type !== "header") elapsed += item.durationMin || 0;
            const children = viewing.items.filter((c) => c.parentId === item.id).sort((a, b) => a.sortOrder - b.sortOrder);
            return (
              <div key={item.id} className="flex gap-3 mb-2">
                <div className="w-9 text-right pt-2.5 flex-shrink-0 text-[13px] font-bold text-text-ter">{rowStart}′</div>
                {item.type === "header" ? (
                  <div className="flex-1 pt-2 pb-1.5 border-b-2 border-navy text-sm font-extrabold text-navy uppercase font-label tracking-[0.06em]">
                    {item.name}
                  </div>
                ) : item.type === "block" ? (
                  <div className="flex-1 px-4 py-3 bg-navy-bg rounded-xl border border-navy-border">
                    <div className="text-sm font-bold text-navy">
                      {item.name} — {item.durationMin} min
                    </div>
                    {children.map((d) => (
                      <div key={d.id} className="text-xs text-text-sec mt-1">
                        · {d.name}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 px-4 py-3 bg-surface rounded-xl shadow-card-sm">
                    <div className="text-sm font-bold">
                      {item.name}
                      {item.durationMin ? (
                        <span className="font-normal text-text-sec ml-1.5">· {item.durationMin} min</span>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-bg font-display">
      <div className="bg-navy px-6 py-3.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/app/team/${teamId}`)}
            className="flex items-center gap-1.5 bg-white/[0.08] border-none text-white/60 text-xs font-semibold px-3.5 py-1.5 rounded-lg cursor-pointer"
          >
            <Icon n="arrowLeft" size={14} color="rgba(255,255,255,0.6)" sw={2} /> Back
          </button>
          <div className="text-xl font-extrabold text-white">Practice Planner</div>
        </div>
        <div className="flex gap-0.5">
          {(
            [
              ["plans", "My Plans"],
              ["edit", editingId ? "Edit Plan" : "Build Plan"],
            ] as const
          ).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg border-none cursor-pointer"
              style={{
                background: tab === t ? "rgba(255,255,255,0.15)" : "transparent",
                color: tab === t ? "#FFF" : "rgba(255,255,255,0.4)",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === "plans" && (
        <div className="flex-1 overflow-auto px-7 py-5">
          <div className="flex justify-end mb-4">
            <button
              onClick={startNewPlan}
              className="flex items-center gap-1.5 px-[18px] py-2.5 text-[13px] font-semibold bg-navy text-white border-none rounded-[10px] cursor-pointer"
            >
              <Icon n="plus" size={14} color="#FFF" sw={2.5} /> Build plan
            </button>
          </div>
          {practices.length === 0 && (
            <div className="text-center py-12 text-text-ter text-sm">No saved plans yet</div>
          )}
          {practices.map((p) => (
            <div
              key={p.id}
              className="px-5 py-4 bg-surface rounded-[14px] mb-2.5 shadow-card-sm flex items-center justify-between"
            >
              <div>
                <div className="text-[15px] font-bold">{p.title}</div>
                <div className="text-xs text-text-sec mt-0.5">
                  {p.practiceDate || "No date"} · {p.itemCount} items · {p.durationMin} min
                </div>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setViewing(p)}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-navy-bg text-navy border-none rounded-lg cursor-pointer"
                >
                  View
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete this practice plan?")) run(deletePractice(teamId, p.id));
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-red-bg text-red border-none rounded-lg cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "edit" && (
        <>
          <div className="px-6 py-2.5 bg-surface border-b border-border flex gap-3 items-center flex-shrink-0 flex-wrap">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Practice title…"
              className="flex-[1_1_180px] px-3 py-2 text-sm font-semibold rounded-[10px] border-[1.5px] border-border bg-bg outline-none text-text"
            />
            <select
              value={durationMin}
              onChange={(e) => setDurationMin(parseInt(e.target.value))}
              className="px-3 py-2 text-[13px] rounded-[10px] border-[1.5px] border-border bg-bg outline-none text-text"
            >
              {[60, 75, 90, 105, 120].map((m) => (
                <option key={m} value={m}>
                  {m} min
                </option>
              ))}
            </select>
            <input
              type="date"
              value={practiceDate}
              onChange={(e) => setPracticeDate(e.target.value)}
              className="px-3 py-2 text-[13px] rounded-[10px] border-[1.5px] border-border bg-bg outline-none text-text"
            />
            <div className="flex items-center gap-2 ml-auto">
              <div className="w-20 h-[5px] rounded-full bg-bg-deep overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: Math.min(100, (usedTime / durationMin) * 100) + "%",
                    background: remaining >= 0 ? "var(--color-green)" : "var(--color-red)",
                  }}
                />
              </div>
              <span
                className="text-xs font-bold"
                style={{ color: remaining >= 0 ? "var(--color-green)" : "var(--color-red)" }}
              >
                {usedTime}/{durationMin}m
              </span>
            </div>
            <PrimaryBtn onClick={handleSave} disabled={items.length === 0} className="!py-2 !px-5 !text-[13px]">
              Save
            </PrimaryBtn>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Library */}
            <div className="flex-[0_0_40%] border-r border-border flex flex-col overflow-hidden bg-surface">
              <div className="px-4 pt-3 pb-2 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-text-ter uppercase font-label tracking-[0.06em]">
                    Drill Library
                  </span>
                  <button
                    onClick={() => setNewDrillOpen(true)}
                    className="px-3 py-1.5 text-[11px] font-semibold rounded-lg border-none bg-navy-bg text-navy cursor-pointer"
                  >
                    + New
                  </button>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setDrillFilter(c)}
                      className="px-2.5 py-1 text-[10px] rounded-lg cursor-pointer border-none"
                      style={{
                        fontWeight: drillFilter === c ? 700 : 500,
                        background: drillFilter === c ? "var(--color-navy)" : "var(--color-bg)",
                        color: drillFilter === c ? "#FFF" : "var(--color-text-ter)",
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                {addingToBlock && (
                  <div className="mt-2 text-[11px] text-accent font-semibold">
                    Adding to block — tap “+ Add”.{" "}
                    <button onClick={() => setAddingToBlock(null)} className="underline">
                      done
                    </button>
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-auto px-4 pt-1 pb-4">
                {filtered.map((drill) => (
                  <div key={drill.id} className="px-3 py-2.5 rounded-[10px] mb-1.5 bg-bg border border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[13px] font-semibold">{drill.name}</span>
                          <span className="text-[9px] px-1.5 py-px rounded-full bg-bg-deep text-text-ter">
                            {drill.category}
                          </span>
                          <span className="text-[10px] text-text-ter">{drill.duration_min}m</span>
                        </div>
                        <div className="text-[11px] text-text-sec">{drill.description}</div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => setEditDrill(drill)}
                          className="px-2 py-1 text-[10px] rounded-md border border-border bg-surface text-text-sec cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => addDrillToPlan(drill)}
                          className="px-2.5 py-1 text-[10px] font-semibold rounded-md border-none bg-navy text-white cursor-pointer"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && <div className="text-xs text-text-ter text-center py-6">No drills here.</div>}
              </div>
            </div>

            {/* Plan */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-[18px] py-3 flex-shrink-0 flex items-center justify-between border-b border-border-light">
                <span className="text-xs font-bold text-text-ter uppercase font-label tracking-[0.06em]">Plan</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setItems((p) => [...p, { uid: nextUid(), type: "header", name: "Warm Up" }])}
                    className="px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border-[1.5px] border-border bg-transparent text-text-sec cursor-pointer"
                  >
                    + Header
                  </button>
                  <button
                    onClick={() =>
                      setItems((p) => [...p, { uid: nextUid(), type: "block", name: "Block", durationMin: 15, children: [] }])
                    }
                    className="px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border-none bg-navy-bg text-navy cursor-pointer"
                  >
                    + Block
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto px-[18px] pt-2 pb-[18px]">
                {items.length === 0 ? (
                  <div className="text-center py-12 px-5 text-text-ter">
                    <div className="w-[52px] h-[52px] rounded-[14px] bg-bg-alt flex items-center justify-center mx-auto mb-3">
                      <Icon n="clipboard" size={24} color="var(--color-text-ter)" />
                    </div>
                    <div className="text-sm font-semibold text-text-sec">Empty plan</div>
                    <div className="text-xs mt-1">Add drills from the library</div>
                  </div>
                ) : (
                  items.map((item, i) => {
                    const elapsed = items.slice(0, i).reduce((s, x) => s + ("durationMin" in x ? x.durationMin || 0 : 0), 0);
                    const Ctrl = (
                      <div className="flex gap-1">
                        <button
                          onClick={() => moveItem(i, "up")}
                          disabled={i === 0}
                          className="w-6 h-6 rounded-md border-none bg-bg-alt text-text-sec cursor-pointer text-[11px] disabled:text-border-light"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveItem(i, "down")}
                          disabled={i === items.length - 1}
                          className="w-6 h-6 rounded-md border-none bg-bg-alt text-text-sec cursor-pointer text-[11px] disabled:text-border-light"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => setItems((p) => p.filter((_, j) => j !== i))}
                          className="w-6 h-6 rounded-md border-none bg-red-bg text-red cursor-pointer text-[11px]"
                        >
                          ×
                        </button>
                      </div>
                    );

                    if (item.type === "header")
                      return (
                        <div key={item.uid} className="flex gap-2.5 mb-1 mt-3">
                          <div className="w-9 text-right pt-1 flex-shrink-0 text-[11px] font-bold text-text-ter">
                            {elapsed}′
                          </div>
                          <div className="flex-1 flex items-center justify-between border-b-2 border-navy pb-1">
                            <input
                              value={item.name}
                              onChange={(e) =>
                                setItems((p) => p.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))
                              }
                              className="text-[13px] font-extrabold text-navy bg-transparent border-none outline-none uppercase font-label tracking-[0.06em]"
                            />
                            {Ctrl}
                          </div>
                        </div>
                      );

                    if (item.type === "block") {
                      const isAdding = addingToBlock === item.uid;
                      return (
                        <div key={item.uid} className="flex gap-2.5 mb-2">
                          <div className="w-9 text-right pt-3 flex-shrink-0 text-xs font-bold text-navy">{elapsed}′</div>
                          <div className="flex-1 border-[1.5px] border-navy-border rounded-xl bg-navy-bg overflow-hidden">
                            <div className="px-3 py-2 flex items-center justify-between border-b border-navy-border">
                              <div className="flex items-center gap-2">
                                <input
                                  value={item.name}
                                  onChange={(e) =>
                                    setItems((p) => p.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))
                                  }
                                  className="font-bold text-[13px] text-navy bg-transparent border-none outline-none w-[120px]"
                                />
                                <input
                                  type="number"
                                  value={item.durationMin}
                                  onChange={(e) =>
                                    setItems((p) =>
                                      p.map((x, j) =>
                                        j === i ? { ...x, durationMin: parseInt(e.target.value) || 0 } : x
                                      )
                                    )
                                  }
                                  className="w-9 px-1.5 py-0.5 text-[11px] rounded-md border border-navy-border bg-surface text-center outline-none"
                                />
                                <span className="text-[10px] text-text-ter">min</span>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setAddingToBlock(isAdding ? null : item.uid)}
                                  className="px-2.5 py-1 text-[10px] font-semibold rounded-md border-none text-white cursor-pointer"
                                  style={{ background: isAdding ? "var(--color-green)" : "var(--color-accent)" }}
                                >
                                  {isAdding ? "Done" : "+ Drill"}
                                </button>
                                {Ctrl}
                              </div>
                            </div>
                            <div className="px-3 py-2">
                              {item.children.length === 0 && (
                                <div className="text-[11px] text-text-ter text-center py-1.5">
                                  {isAdding ? "Tap “+ Add” on a drill →" : "No drills yet"}
                                </div>
                              )}
                              {item.children.map((d, j) => (
                                <div
                                  key={j}
                                  className="flex items-center justify-between px-2 py-1.5 mb-0.5 rounded-lg bg-surface"
                                >
                                  <span className="text-xs font-semibold">{d.name}</span>
                                  <button
                                    onClick={() =>
                                      setItems((p) =>
                                        p.map((x, xi) =>
                                          xi === i && x.type === "block"
                                            ? { ...x, children: x.children.filter((_, cj) => cj !== j) }
                                            : x
                                        )
                                      )
                                    }
                                    className="w-[18px] h-[18px] rounded border-none bg-red-bg text-red cursor-pointer text-[10px]"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // drill
                    return (
                      <div key={item.uid} className="flex gap-2.5 mb-1.5">
                        <div className="w-9 text-right pt-3 flex-shrink-0 text-xs font-bold text-navy">{elapsed}′</div>
                        <div className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface shadow-card-sm flex items-center justify-between">
                          <div>
                            <span className="text-[13px] font-semibold">{item.name}</span>
                            <span className="text-[11px] text-text-ter ml-1.5">{item.durationMin} min</span>
                            {item.focus && <div className="text-[11px] text-text-sec mt-px">{item.focus}</div>}
                          </div>
                          {Ctrl}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {editDrill && (
        <DrillModal
          drill={editDrill}
          onClose={() => setEditDrill(null)}
          onSave={(data) => {
            run(updateDrill(teamId, editDrill.id, data));
            setEditDrill(null);
          }}
          onDelete={() => {
            run(deleteDrill(teamId, editDrill.id));
            setEditDrill(null);
          }}
        />
      )}
      {newDrillOpen && (
        <DrillModal
          onClose={() => setNewDrillOpen(false)}
          onSave={(data) => {
            run(createDrill(orgId, teamId, data));
            setNewDrillOpen(false);
          }}
        />
      )}
    </div>
  );
}

function DrillModal({
  drill,
  onClose,
  onSave,
  onDelete,
}: {
  drill?: Drill;
  onClose: () => void;
  onSave: (data: {
    name: string;
    category: string;
    duration_min: number;
    description: string;
    focus: string;
    video_url: string;
  }) => void;
  onDelete?: () => void;
}) {
  const [name, setName] = useState(drill?.name || "");
  const [category, setCategory] = useState(drill?.category || "Warmup");
  const [duration, setDuration] = useState(drill?.duration_min || 10);
  const [description, setDescription] = useState(drill?.description || "");
  const [focus, setFocus] = useState(drill?.focus || "");
  const [videoUrl, setVideoUrl] = useState(drill?.video_url || "");

  return (
    <Modal onClose={onClose}>
      <div className="text-lg font-extrabold mb-4 tracking-[-0.02em]">{drill ? "Edit drill" : "New drill"}</div>
      <div className="mb-3">
        <Label>Name *</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. 3-Person Serve Receive" />
      </div>
      <div className="mb-3">
        <Label>Category</Label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2.5 text-[13px] rounded-[10px] border-[1.5px] border-border bg-bg outline-none text-text"
        >
          {CATEGORIES.filter((c) => c !== "All").map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <Label>Duration (min)</Label>
        <Input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value) || 0)} />
      </div>
      <div className="mb-3">
        <Label>Description</Label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief overview" />
      </div>
      <div className="mb-3">
        <Label>Focus</Label>
        <Input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="e.g. Passing accuracy" />
      </div>
      <div className="flex justify-between mt-5">
        {onDelete ? (
          <button
            onClick={onDelete}
            className="px-5 py-2.5 text-[13px] font-semibold bg-red-bg text-red border-none rounded-[10px] cursor-pointer"
          >
            Delete
          </button>
        ) : (
          <GhostBtn onClick={onClose}>Cancel</GhostBtn>
        )}
        <PrimaryBtn
          disabled={!name}
          onClick={() =>
            onSave({
              name,
              category,
              duration_min: duration,
              description,
              focus,
              video_url: videoUrl,
            })
          }
        >
          {drill ? "Save" : "Save drill"}
        </PrimaryBtn>
      </div>
    </Modal>
  );
}
