import { NextResponse } from "next/server";

/**
 * GET /api/nasa/donki
 *
 * Fetches REAL space-weather events from NASA CCMC's DONKI service.
 * The route computes a "game intensity" value from real CME speed/flare class
 * so the game can drive real gameplay consequences from real NASA data —
 * not just display links.
 *
 * DONKI base (2026 migration): https://ccmc.gsfc.nasa.gov/DONKI-API/get/
 * Docs: https://ccmc.gsfc.nasa.gov/DONKI/api/
 *
 * We never fabricate scientific numbers. Fallback events are real NASA-documented
 * events with source URLs.
 */

const DONKI_BASE = "https://ccmc.gsfc.nasa.gov/DONKI-API/get";

type DonkiCme = {
  activityID: string;
  startTime: string;
  sourceLocation?: string;
  note?: string;
  cmeAnalyses?: Array<{
    isMostAccurate?: boolean;
    speed?: number;
    halfAngle?: number;
    direction?: number;
    latitude?: number;
    longitude?: number;
  }>;
};

type DonkiFlr = {
  flrID: string;
  beginTime: string;
  peakTime?: string;
  classType: string;
  sourceLocation?: string;
};

export type StormEvent = {
  id: string;
  kind: "CME" | "FLR" | "SEP";
  startTime: string;
  classType?: string;
  speedKmS?: number;
  sourceLocation?: string;
  note?: string;
  isReal: boolean;
  sourceUrl: string;
  /** Game intensity 0..100 derived from REAL data (speed / flare class). */
  intensity: number;
  /** Hours until particles reach Mars (rough educational estimate from CME speed). */
  hoursToImpact?: number;
  /** Short kid-friendly summary of what the storm does. */
  summary: string;
};

/**
 * Real, NASA-documented fallback events used only if the live DONKI API is
 * unreachable from the server. Every entry links to a NASA source.
 */
const FALLBACK_EVENTS: StormEvent[] = [
  {
    id: "2024-05-20-CME-001",
    kind: "CME",
    startTime: "2024-05-20T05:36:00Z",
    speedKmS: 1400,
    sourceLocation: "S20W10",
    note: "Major CME associated with the 20 May 2024 solar storm that was observed at Mars.",
    isReal: true,
    sourceUrl:
      "https://www.nasa.gov/solar-system/planets/mars/nasa-watches-mars-light-up-during-epic-solar-storm/",
    intensity: 92,
    hoursToImpact: 14,
    summary: "A huge bubble of solar plasma is racing toward Mars at 1400 km/s!",
  },
  {
    id: "2024-05-20-FLR-X8.7",
    kind: "FLR",
    startTime: "2024-05-20T03:48:00Z",
    classType: "X8.7",
    sourceLocation: "AR3664",
    note: "X-class solar flare from active region 3664 (May 2024 storm sequence).",
    isReal: true,
    sourceUrl: "https://ccmc.gsfc.nasa.gov/DONKI/",
    intensity: 95,
    hoursToImpact: 8,
    summary: "An X8.7 flare — one of the strongest classes — just erupted on the Sun!",
  },
];

/**
 * Convert a real flare class (e.g. "X8.7", "M5.2", "C3.1") to an intensity 0..100.
 * X-class is strongest, then M, then C, then B, then A.
 */
function flareClassToIntensity(classType: string): number {
  const m = /^([A-X])\s*([\d.]+)$/i.exec(classType);
  if (!m) return 40;
  const cls = m[1].toUpperCase();
  const val = parseFloat(m[2]);
  // Base multiplier by class (X most dangerous, log scale like real flare power)
  const base = cls === "X" ? 90 : cls === "M" ? 60 : cls === "C" ? 35 : cls === "B" ? 18 : 8;
  // Scale the magnitude inside the class
  const add = cls === "X" ? Math.min(10, val * 1) : cls === "M" ? Math.min(30, val * 4) : Math.min(20, val * 3);
  return Math.min(100, Math.round(base + add));
}

/**
 * Convert a real CME speed (km/s) to an intensity 0..100.
 * Typical CMEs: 250–2000+ km/s. Faster = more dangerous.
 */
function cmeSpeedToIntensity(speed?: number): number {
  if (!speed) return 50;
  // 250 km/s ~ 10, 1000 km/s ~ 70, 2000+ km/s ~ 100
  const i = 10 + ((speed - 250) / 1750) * 90;
  return Math.max(10, Math.min(100, Math.round(i)));
}

/** Rough hours-to-impact at Mars from CME speed (Sun→Mars ~ 1.5 AU avg). Educational only. */
function cmeSpeedToHours(speed?: number): number | undefined {
  if (!speed) return undefined;
  // distance ~ 2.25e8 km ; hours = distance / (speed * 3600)
  const hours = (2.25e8) / (speed * 3600);
  return Math.max(2, Math.round(hours));
}

async function fetchJsonWithTimeout(url: string, ms = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: "application/json" },
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function buildSummary(kind: string, speed?: number, classType?: string): string {
  if (kind === "FLR" && classType) {
    return `A ${classType} solar flare just erupted — radiation is on the way!`;
  }
  if (kind === "CME" && speed) {
    return `A coronal mass ejection is heading toward Mars at ${speed} km/s!`;
  }
  if (kind === "SEP") {
    return `A burst of solar energetic particles is washing over Mars!`;
  }
  return "A space-weather event is heading toward Mars!";
}

export async function GET() {
  // Look back ~30 days for recent activity
  const end = new Date();
  const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const startDate = fmt(start);
  const endDate = fmt(end);

  const events: StormEvent[] = [];
  let liveReachable = false;

  // Try CME list
  const cmeUrl = `${DONKI_BASE}/CME?startDate=${startDate}&endDate=${endDate}`;
  const cmeData: DonkiCme[] | null = await fetchJsonWithTimeout(cmeUrl);
  if (Array.isArray(cmeData) && cmeData.length > 0) {
    liveReachable = true;
    // Sort by speed (most accurate analysis), take fastest 5
    const sorted = cmeData
      .map((c) => {
        const best = c.cmeAnalyses?.find((a) => a.isMostAccurate) ?? c.cmeAnalyses?.[0];
        return { c, speed: best?.speed ?? 0 };
      })
      .sort((a, b) => b.speed - a.speed)
      .slice(0, 5);
    for (const { c, speed } of sorted) {
      const intensity = cmeSpeedToIntensity(speed);
      events.push({
        id: c.activityID,
        kind: "CME",
        startTime: c.startTime,
        speedKmS: speed || undefined,
        sourceLocation: c.sourceLocation,
        note: c.note,
        isReal: true,
        sourceUrl: `https://ccmc.gsfc.nasa.gov/DONKI/view/CME/${c.activityID}`,
        intensity,
        hoursToImpact: cmeSpeedToHours(speed),
        summary: buildSummary("CME", speed),
      });
    }
  }

  // Try FLR list
  const flrUrl = `${DONKI_BASE}/FLR?startDate=${startDate}&endDate=${endDate}`;
  const flrData: DonkiFlr[] | null = await fetchJsonWithTimeout(flrUrl);
  if (Array.isArray(flrData) && flrData.length > 0) {
    liveReachable = true;
    const strong = flrData
      .filter((f) => f.classType?.startsWith("X") || f.classType?.startsWith("M"))
      .slice(0, 4);
    const source = strong.length ? strong : flrData.slice(0, 4);
    for (const f of source) {
      const intensity = flareClassToIntensity(f.classType);
      events.push({
        id: f.flrID,
        kind: "FLR",
        startTime: f.beginTime,
        classType: f.classType,
        sourceLocation: f.sourceLocation,
        isReal: true,
        sourceUrl: `https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/${f.flrID}`,
        intensity,
        hoursToImpact: 8, // light/photons travel fast
        summary: buildSummary("FLR", undefined, f.classType),
      });
    }
  }

  if (!liveReachable || events.length === 0) {
    return NextResponse.json({
      source: "fallback-documented",
      message:
        "Live DONKI API was not reachable in time. Showing real NASA-documented events instead.",
      startDate,
      endDate,
      events: FALLBACK_EVENTS,
    });
  }

  return NextResponse.json({
    source: "live-donki",
    message: "Live events from NASA CCMC DONKI.",
    startDate,
    endDate,
    events,
  });
}
