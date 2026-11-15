"use client";

import { useGame } from "@/lib/game-store";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { Pause, Play, ArrowRight } from "lucide-react";

export default function NightOverlay() {
  const { phase, nightStage, nightEnergyUsed, battery, advanceNight, toggleNightPause, nightPaused } =
    useGame();

  // Auto-advance the night stages
  useEffect(() => {
    if (phase !== "night") return;
    if (nightPaused) return;
    if (nightStage >= 4) return;
    const t = setTimeout(() => advanceNight(), 2200);
    return () => clearTimeout(t);
  }, [phase, nightStage, nightPaused, advanceNight]);

  const stages = [1, 2, 3, 4];

  return (
    <AnimatePresence>
      {phase === "night" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-x-0 top-20 z-30 flex flex-col items-center gap-3 px-4 pointer-events-none"
        >
          <div className="pointer-events-auto rounded-2xl bg-stone-950/85 border border-stone-700/60 shadow-2xl px-5 py-3 max-w-md w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-200 font-bold text-sm">Night on Mars</span>
              <button
                onClick={toggleNightPause}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-amber-100"
              >
                {nightPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center gap-2">
              {stages.map((s) => (
                <div key={s} className="flex-1">
                  <div
                    className={`h-2 rounded-full ${
                      nightStage >= s ? "bg-amber-400" : "bg-stone-700"
                    }`}
                  />
                  <div className="text-[10px] text-stone-400 mt-1 text-center">
                    Stage {s}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-center text-amber-100 text-xs">
              Energy used: {nightEnergyUsed} / 4 · Battery left: {battery}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
