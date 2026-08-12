"use client";

import { useEffect, useState } from "react";

// The offline fallback is a dead end otherwise: the URL the user asked for is
// still in the address bar, so as soon as the network is genuinely back we can
// just reload it and drop them where they were headed. No closing the app.
export function OfflineRecovery() {
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // This page is normally served by the service worker in place of some other
    // URL, which stays in the address bar — that's what we reload back to. If
    // someone navigated to /offline itself there's nothing to return to, and
    // auto-reloading would just loop.
    if (window.location.pathname === "/offline") return;

    // navigator.onLine only reports whether there's a network interface, not
    // whether anything is actually reachable, so confirm with a real request.
    async function reachable() {
      try {
        await fetch("/manifest.webmanifest", { method: "HEAD", cache: "no-store" });
        return true;
      } catch {
        return false;
      }
    }

    async function tryRecover() {
      if (cancelled || checking) return;
      setChecking(true);
      const ok = await reachable();
      if (!cancelled && ok) window.location.reload();
      if (!cancelled) setChecking(false);
    }

    const onOnline = () => tryRecover();
    window.addEventListener("online", onOnline);
    // Also poll, since the online event doesn't fire for every kind of
    // reconnection (captive portals, flaky gym wifi).
    const timer = setInterval(tryRecover, 4000);

    return () => {
      cancelled = true;
      window.removeEventListener("online", onOnline);
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <button
      onClick={() => window.location.reload()}
      className="mt-5 px-6 py-3 text-sm font-bold bg-navy text-white border-none rounded-xl cursor-pointer"
    >
      Try again now
    </button>
  );
}
