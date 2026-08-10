"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FormCard } from "@/components/ui/FormCard";
import { AuthField, Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { PrimaryBtn, GhostBtn } from "@/components/ui/Button";

type Step = "choose" | "create" | "join";
type Level = { id: string; name: string };

export function OnboardingClient() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("choose");

  // create org
  const [orgName, setOrgName] = useState("");
  const [orgCode, setOrgCode] = useState("");

  // join org
  const [joinCode, setJoinCode] = useState("");
  const [levels, setLevels] = useState<Level[] | null>(null);
  const [orgFound, setOrgFound] = useState<boolean | null>(null);
  const [levelId, setLevelId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("create_organization", {
      org_name: orgName,
      org_code: orgCode,
    });
    if (rpcError) {
      setError(rpcError.message.includes("duplicate") ? "That org code is already taken." : rpcError.message);
      setLoading(false);
      return;
    }
    router.push("/app");
    router.refresh();
  }

  async function lookupCode(code: string) {
    setJoinCode(code);
    setLevelId(null);
    setLevels(null);
    setOrgFound(null);
    if (code.length < 2) return;
    const supabase = createClient();
    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("code", code.toUpperCase())
      .maybeSingle();
    if (!org) {
      setOrgFound(false);
      return;
    }
    setOrgFound(true);
    const { data: lv } = await supabase.rpc("get_org_levels_by_code", { org_code: code });
    setLevels(lv || []);
  }

  async function handleJoin() {
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("join_organization", {
      org_code: joinCode,
      join_level_id: levelId,
    });
    if (rpcError) {
      setError(rpcError.message);
      setLoading(false);
      return;
    }
    router.push("/app");
    router.refresh();
  }

  if (step === "choose") {
    return (
      <FormCard
        title="Set up your program"
        sub="Are you starting a new program or joining an existing one?"
        backHref="/"
      >
        <div className="flex flex-col gap-3">
          <PrimaryBtn className="w-full" onClick={() => setStep("create")}>
            Create a new organization
          </PrimaryBtn>
          <GhostBtn className="w-full" onClick={() => setStep("join")}>
            Join with an invite code
          </GhostBtn>
        </div>
      </FormCard>
    );
  }

  if (step === "create") {
    return (
      <FormCard
        title="New organization"
        sub="You'll be the admin. Share the org code with your coaching staff."
        backHref="/onboarding"
      >
        <div onClick={(e) => e.stopPropagation()}>
          <AuthField label="Organization name">
            <Input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Lincoln School District"
            />
          </AuthField>
          <AuthField label="Org code (for coaches to join)">
            <Input
              value={orgCode}
              onChange={(e) => setOrgCode(e.target.value.toUpperCase())}
              placeholder="LSD"
              maxLength={10}
              className="tracking-[0.2em] font-bold"
            />
          </AuthField>
          {error && <div className="text-sm text-red mb-4 -mt-2">{error}</div>}
          <PrimaryBtn
            disabled={!orgName || !orgCode || loading}
            onClick={handleCreate}
            className="w-full mt-2"
          >
            {loading ? "Creating…" : "Create organization"}
          </PrimaryBtn>
          <button
            onClick={() => setStep("choose")}
            className="w-full text-[13px] text-text-ter mt-4 font-semibold"
          >
            Back
          </button>
        </div>
      </FormCard>
    );
  }

  // join
  return (
    <FormCard
      title="Join your team"
      sub="Enter the invite code your admin shared with you."
      backHref="/onboarding"
    >
      <AuthField label="Invite code">
        <Input
          value={joinCode}
          onChange={(e) => lookupCode(e.target.value.toUpperCase())}
          placeholder="e.g. LSD"
          maxLength={10}
          className="text-center !text-2xl font-extrabold tracking-[0.3em] font-label"
        />
      </AuthField>

      {orgFound === false && (
        <div className="mt-3 px-4 py-3 bg-red-bg rounded-[10px] text-[13px] text-red font-semibold text-center">
          No organization found with that code. Double-check with your admin.
        </div>
      )}

      {orgFound && (
        <div className="mt-3 px-4 py-3.5 bg-green-bg rounded-[10px] mb-1">
          <div className="text-xs text-green font-semibold flex items-center gap-1.5">✓ Organization found</div>
        </div>
      )}

      {levels && levels.length > 0 && (
        <div className="mt-4">
          <Label>Which level do you coach?</Label>
          <div className="flex flex-col gap-2 mt-2">
            {levels.map((lv) => {
              const selected = levelId === lv.id;
              return (
                <button
                  key={lv.id}
                  onClick={() => setLevelId(lv.id)}
                  className={[
                    "px-[18px] py-3.5 text-sm font-semibold rounded-xl text-left flex items-center justify-between border",
                    selected
                      ? "border-2 border-navy bg-navy-bg text-navy"
                      : "border-[1.5px] border-border bg-surface text-text-sec",
                  ].join(" ")}
                >
                  <span>{lv.name}</span>
                  {selected && <span className="text-navy font-extrabold">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {orgFound && levels && levels.length === 0 && (
        <div className="mt-4 px-4 py-3.5 bg-yellow-bg rounded-[10px] text-[13px] text-yellow font-semibold text-center">
          This organization hasn&apos;t set up levels yet. You can still join — your admin will assign you to a level.
        </div>
      )}

      {error && <div className="text-sm text-red mt-4">{error}</div>}

      <PrimaryBtn disabled={!orgFound || loading} onClick={handleJoin} className="w-full mt-5">
        {loading ? "Joining…" : levels && levels.length > 0 && !levelId ? "Select a level to continue" : "Join organization"}
      </PrimaryBtn>
      <button
        onClick={() => setStep("choose")}
        className="w-full text-[13px] text-text-ter mt-4 font-semibold"
      >
        Back
      </button>
    </FormCard>
  );
}
