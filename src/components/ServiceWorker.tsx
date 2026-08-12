"use client";

import { useEffect } from "react";

// Registers the offline service worker. Silently does nothing where service
// workers aren't available (older browsers, private modes), so the app still
// works as a plain website.
export function ServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") return;

    // Never in dev: the worker caches /_next/static cache-first, which is right
    // for production's content-hashed filenames but serves stale chunks forever
    // against a dev server that reuses them. Tear down any worker left behind
    // from an earlier build so a dev machine can't get stuck on old code.
    if (process.env.NODE_ENV === "development") {
      navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
      if (typeof caches !== "undefined") {
        caches.keys().then((keys) => keys.forEach((k) => k.startsWith("courtiq-") && caches.delete(k)));
      }
      return;
    }

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Offline support just won't be available; not worth surfacing.
      });
    };

    if (document.readyState === "complete") register();
    else {
      window.addEventListener("load", register);
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
