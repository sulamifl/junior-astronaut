"use client";

import { useEffect } from "react";
import { useGame, type StormEventData } from "@/lib/game-store";
import HUDBar from "@/components/game/HUDBar";
import MarsBaseScene from "@/components/game/MarsBaseScene";
import MissionPanel from "@/components/game/MissionPanel";
import ObjectModals from "@/components/game/ObjectModals";
import StormModal from "@/components/game/StormModal";
import NightOverlay from "@/components/game/NightOverlay";
import DawnResult, { QuizScreen } from "@/components/game/DawnResult";
import SciencePanel from "@/components/game/SciencePanel";
import IntroScreen from "@/components/game/IntroScreen";
import { ExternalLink } from "lucide-react";
import GreenhouseModal from "@/components/game/GreenhouseModal";

export default function Page() {
  const initFromDonki = useGame((s) => s.initFromDonki);
  const phase = useGame((s) => s.phase);

  // Load real NASA DONKI space-weather events on first mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/nasa/donki");
        const data = await res.json();
        if (cancelled) return;
        if (data?.events?.length) {
          initFromDonki({
            source: data.source,
            message: data.message,
            events: data.events as StormEventData[],
          });
        }
      } catch {
        /* game works without a live storm event */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initFromDonki]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <IntroScreen />

      <main className="flex-1 flex flex-col gap-3 p-3 sm:p-4 max-w-[1500px] w-full mx-auto">
        <HUDBar />

        {/* Main play area: scene + mission sidebar */}
        <div className="flex flex-col lg:flex-row gap-3 flex-1 min-h-0">
          {/* Scene */}
          <div className="flex-1 min-h-0">
            <div className="relative w-full h-full min-h-[320px] rounded-lg overflow-hidden border border-slate-700/60 shadow-xl bg-slate-900 aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto lg:h-full">
              <MarsBaseScene />
              <NightOverlay />
            </div>
          </div>

          {/* Mission sidebar */}
          <MissionPanel />
        </div>
      </main>

      {/* Footer with NASA attribution */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-[1500px] px-3 sm:px-4 py-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-400 font-mono tracking-wide">
                NASA SPACE APPS · MARS BASE COMMANDER
              </span>
              <span className="hidden sm:inline text-slate-600">·</span>
              <span className="hidden sm:inline font-mono">REAL DATA: DONKI · RAD · OSDR · MARS TREK</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <FooterLink href="https://ccmc.gsfc.nasa.gov/tools/DONKI/" label="DONKI" />
              <FooterLink href="https://www.nasa.gov/news-release/nasa-rover-results-include-first-age-measurement-on-mars-and-help-for-human-exploration/" label="RAD" />
              <FooterLink href="https://osdr.nasa.gov/bio/repo/" label="OSDR" />
              <FooterLink href="https://trek.nasa.gov/mars/" label="MARS TREK" />
              <FooterLink href="https://api.nasa.gov/" label="NASA APIs" />
            </div>
          </div>
          <div className="mt-1 text-[10px] text-slate-600 font-mono">
            Game balance values are simplified for teaching, not real engineering norms. Space-weather events are real NASA data.
          </div>
        </div>
      </footer>

      {/* Overlays */}
      <ObjectModals />
      <StormModal />
      <GreenhouseModal />
      <SciencePanel />
      <DawnResult />
      {phase === "quiz" && <QuizScreen />}
    </div>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-700/50 hover:border-amber-500/50 hover:text-amber-300 text-slate-400 font-mono text-[10px] tracking-wide transition-colors"
    >
      {label} <ExternalLink className="w-2.5 h-2.5" />
    </a>
  );
}
