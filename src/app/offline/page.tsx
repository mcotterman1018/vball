import { OfflineRecovery } from "./OfflineRecovery";

// Shown when a page is requested that was never cached and there's no
// connection. Anything already visited is served from cache instead.
export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-bg font-display flex items-center justify-center p-6">
      <div className="max-w-[420px] text-center bg-surface rounded-[20px] p-8 shadow-card">
        <div className="text-[44px] font-extrabold text-navy tracking-[-0.04em] leading-none mb-4">
          Court<span className="text-text-ter">IQ</span>
        </div>
        <div className="text-lg font-bold mb-1.5">You&apos;re offline</div>
        <div className="text-sm text-text-sec leading-relaxed">
          This page hasn&apos;t been opened on this device yet, so there&apos;s no saved copy to show.
          Reconnect once and it&apos;ll be available offline from then on.
        </div>
        <div className="text-[13px] text-text-ter mt-4 leading-relaxed">
          Any scorebook already in progress is safe — it&apos;s stored on this device and will upload
          when you&apos;re back online.
        </div>
        <OfflineRecovery />
        <div className="text-[12px] text-text-ter mt-3">
          This page returns on its own as soon as you&apos;re back online.
        </div>
      </div>
    </div>
  );
}
