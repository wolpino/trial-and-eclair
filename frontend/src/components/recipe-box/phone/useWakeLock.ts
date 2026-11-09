import { useEffect } from "react";

/** True when the browser can keep the screen on (Wake Lock API). */
export function wakeLockSupported(): boolean {
  return typeof navigator !== "undefined" && navigator.wakeLock != null;
}

/**
 * Keeps the screen on while `on` is true and the page is visible. The browser
 * drops the lock when the tab is hidden, so it is taken again on return.
 * Where the API is missing or refuses, nothing happens (decision 003).
 */
export function useWakeLock(on: boolean): void {
  useEffect(() => {
    if (!on || !wakeLockSupported()) {
      return;
    }
    let sentinel: WakeLockSentinel | null = null;
    let stopped = false;

    async function acquire() {
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (stopped) {
          void lock.release();
        } else {
          sentinel = lock;
        }
      } catch {
        // Refused (battery saver, hidden tab): the screen just follows its own timeout.
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible" && (!sentinel || sentinel.released)) {
        void acquire();
      }
    }

    void acquire();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      stopped = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (sentinel && !sentinel.released) {
        void sentinel.release();
      }
    };
  }, [on]);
}
