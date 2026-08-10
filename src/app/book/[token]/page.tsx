import { createClient } from "@/lib/supabase/server";
import { BookkeeperApp, type BkContext } from "./BookkeeperApp";

export const dynamic = "force-dynamic";

export default async function BookkeeperPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("bk_context", { p_token: token });

  if (!data) {
    return (
      <div className="min-h-screen bg-bg font-display flex items-center justify-center p-6">
        <div className="max-w-[400px] text-center bg-surface rounded-[20px] p-8 shadow-card">
          <div className="text-[52px] font-extrabold text-navy tracking-[-0.04em] leading-none mb-4">
            Court<span className="text-text-ter">IQ</span>
          </div>
          <div className="text-lg font-bold mb-1.5">This link isn&apos;t active</div>
          <div className="text-sm text-text-sec leading-relaxed">
            This bookkeeper link is invalid or has been turned off. Ask your coach for a current link.
          </div>
        </div>
      </div>
    );
  }

  return <BookkeeperApp token={token} context={data as BkContext} />;
}
