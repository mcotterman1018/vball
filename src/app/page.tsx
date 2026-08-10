import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CourtBg } from "@/components/ui/CourtBg";
import { PrimaryBtn, GhostBtn } from "@/components/ui/Button";

export default async function Welcome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: membership } = await supabase
      .from("org_members")
      .select("org_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();
    redirect(membership ? "/app" : "/onboarding");
  }

  return (
    <div className="min-h-screen flex font-display">
      <div className="flex-[0_0_52%] bg-navy relative overflow-hidden flex flex-col items-center justify-center p-[60px]">
        <CourtBg />
        <div className="relative z-10 text-center">
          <div className="text-[52px] font-extrabold text-white tracking-[-0.04em] leading-none">
            Court<span className="text-white/45">IQ</span>
          </div>
          <div className="text-[15px] text-white/40 mt-3 font-medium tracking-[0.02em]">
            Volleyball Coaching Platform
          </div>
          <div className="mt-14 flex flex-col gap-2.5">
            {[
              ["Ball control", "bg-green"],
              ["Live stats", "bg-libero"],
              ["Practice planning", "bg-accent"],
            ].map(([t, c]) => (
              <div key={t} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${c}`} />
                <span className="text-sm text-white/55 font-medium">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-[60px] bg-bg">
        <div className="w-full max-w-[360px] fadein">
          <div className="text-[28px] font-extrabold text-text tracking-[-0.03em] mb-2">
            Welcome back
          </div>
          <div className="text-[15px] text-text-sec mb-10">
            Sign in or create a new account to get started.
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/signup">
              <PrimaryBtn className="w-full !py-[15px] !text-[15px]">Create account</PrimaryBtn>
            </Link>
            <Link href="/login">
              <GhostBtn className="w-full">Sign in</GhostBtn>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
