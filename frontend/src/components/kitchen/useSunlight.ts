import { useEffect, useState, type CSSProperties } from "react";

/** Morning, midday and evening over a 6:00–19:00 day; moonlight the rest. */
export type LightPhase = "morning" | "midday" | "evening" | "night";

export type Sunlight = {
  phase: LightPhase;
  /** CSS custom properties for the glow position, strength and cast shadows. */
  style: CSSProperties;
};

const DAY_START = 6 * 60;
const DAY_END = 19 * 60;
const UPDATE_MS = 5 * 60_000;

function pct(n: number): string {
  return `${n.toFixed(2)}%`;
}

function px(n: number): string {
  return `${n.toFixed(1)}px`;
}

/**
 * Where the light comes from at this device time. No location: the day is a
 * fixed 6:00–19:00 (Q16 leaves location and time zone for later).
 */
export function sunlightAt(now: Date): Sunlight {
  const minutes = now.getHours() * 60 + now.getMinutes();

  if (minutes >= DAY_START && minutes < DAY_END) {
    // 0 at sunrise, 1 at sunset. The sun crosses from right to left and arcs up.
    const t = (minutes - DAY_START) / (DAY_END - DAY_START);
    const height = Math.sin(Math.PI * t);
    const hour = minutes / 60;
    const phase: LightPhase = hour < 10 ? "morning" : hour < 15 ? "midday" : "evening";
    return {
      phase,
      style: {
        "--sun-x": pct(85 - 70 * t),
        "--sun-y": pct(45 - 35 * height),
        "--light-strength": (0.55 + 0.45 * height).toFixed(2),
        // Shadows fall away from the sun and grow long when it is low.
        "--shadow-x": px((t - 0.5) * 24),
        "--shadow-y": px(3 + 7 * (1 - height)),
        "--shadow-blur": px(4 + 6 * (1 - height)),
      } as CSSProperties,
    };
  }

  // Night: the moon drifts across from 19:00 to 6:00.
  const sinceDusk = (minutes - DAY_END + 24 * 60) % (24 * 60);
  const t = sinceDusk / (24 * 60 - (DAY_END - DAY_START));
  return {
    phase: "night",
    style: {
      "--sun-x": pct(80 - 60 * t),
      "--sun-y": pct(22 - 8 * Math.sin(Math.PI * t)),
      "--light-strength": "0.7",
      "--shadow-x": px((t - 0.5) * 12),
      "--shadow-y": px(4),
      "--shadow-blur": px(8),
    } as CSSProperties,
  };
}

/** The kitchen light from the device clock, refreshed every 5 minutes. */
export function useSunlight(): Sunlight {
  const [light, setLight] = useState(() => sunlightAt(new Date()));

  useEffect(() => {
    const update = () => setLight(sunlightAt(new Date()));
    const id = window.setInterval(update, UPDATE_MS);
    // Catch up straight away when a sleeping tab comes back.
    const onVisible = () => {
      if (document.visibilityState === "visible") update();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return light;
}
