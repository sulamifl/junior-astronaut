"use client";

import { useGame, type StormEventData } from "@/lib/game-store";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { AlertTriangle, Shield, ExternalLink, X, Droplets, Radiation, Satellite } from "lucide-react";
import { RADIATION_REFERENCE } from "@/lib/nasa-data";

/**
 * StormModal — an interactive NASA-driven mini-game.
 *
 * Real NASA DONKI data drives the storm:
 *  - intensity (0..100) from real CME speed / flare class
 *  - hoursToImpact sets the countdown timer
 *  - The player taps "Add water shielding" to build protection up to 100%
 *    (mirrors NASA-STD-3001's 10 g/cm² water-equivalent recommendation).
 *  - When the countdown hits zero OR the player taps "Shelter now",
 *    the shelter decision resolves with a dose based on real intensity.
 */
export default function StormModal() {
  const { modal, stormEvent, resolveStorm, closeModal, stormCountdown, tickStorm, buildShield, stormShieldStrength, phase } =
    useGame();
  const open = modal === "storm" && !!stormEvent;

  // countdown ticker
  useEffect(() => {
    if (!open) return;
    const t = setInterval(() => {
      tickStorm();
    }, 1000);
    return () => clearInterval(t);
  }, [open, tickStorm]);

  if (!open || !stormEvent) return null;

  const intensity = stormEvent.intensity;
  const shield = stormShieldStrength;
  const timeLeft = stormCountdown;

  // projected dose if sheltered now vs not
  const stormDose = (intensity / 100) * 2.5;
  const reduction = Math.min(0.8, (shield / 100) * 0.85);
  const doseIfShelter = stormDose * (1 - reduction);
  const doseIfIgnore = stormDose;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 12 }}
          className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border-2 border-rose-500/60 bg-gradient-to-b from-slate-900 to-slate-950"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-rose-600 to-red-700">
            <motion.div
              className="flex items-center gap-2 text-white"
              animate={{ x: [0, -3, 3, 0] }}
              transition={{ duration: 0.4, repeat: Infinity }}
            >
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-black text-sm sm:text-base tracking-wide">SOLAR STORM ALERT!</h3>
            </motion.div>
            <button
              onClick={() => closeModal()}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 sm:p-5">
            {/* Real NASA event data */}
            <StormData event={stormEvent} />

            {/* Countdown timer — driven by real NASA hoursToImpact */}
            <div className="mt-4 rounded-xl bg-rose-950/50 border border-rose-700/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-rose-200 text-xs font-mono font-bold tracking-widest">
                  ⏱ PRACTICE TIME LEFT
                </span>
                <motion.span
                  key={timeLeft}
                  initial={{ scale: 1.4, color: "#fde047" }}
                  animate={{ scale: 1, color: timeLeft <= 5 ? "#f87171" : "#fde047" }}
                  className="text-3xl font-mono font-black"
                >
                  {timeLeft}s
                </motion.span>
              </div>
              {/* intensity bar */}
              <div className="mt-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-rose-300 mb-1">
                  <span>GAME DIFFICULTY</span>
                  <span className="text-amber-300 font-bold">{intensity}/100</span>
                </div>
                <div className="h-3 rounded-full bg-slate-800 overflow-hidden border border-rose-900/40">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${intensity}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
              </div>
            </div>

            {/* Build shielding mini-game */}
            <div className="mt-4 rounded-xl bg-emerald-950/40 border border-emerald-700/40 p-4">
              <div className="flex items-center gap-2 text-emerald-200 font-bold text-sm mb-2">
                <Shield className="w-4 h-4" />
                Build water shielding
              </div>
              <p className="text-emerald-100/80 text-xs leading-snug mb-3">
                Tap the button fast to stack water tanks around the crew. NASA-STD-3001
                recommends ~10 g/cm² water-equivalent shielding on the surface.
              </p>

              {/* shield bar */}
              <div className="h-4 rounded-full bg-slate-800 overflow-hidden border border-emerald-900/40 mb-3">
                <motion.div
                  className="h-full bg-gradient-to-r from-sky-400 to-cyan-300 rounded-full"
                  animate={{ width: `${shield}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono mb-3">
                <span className="text-emerald-300 font-bold">SHIELD: {shield}%</span>
                <span className="text-slate-400">{shield >= 100 ? "MAX!" : "keep tapping!"}</span>
              </div>

              <motion.button
                disabled={shield >= 100}
                  onClick={() => buildShield(12)}
                whileTap={{ scale: 0.92 }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white font-black shadow-lg active:scale-95 transition-all"
              >
                <Droplets className="w-5 h-5" />
                {shield >= 100 ? "SHIELD READY — MOVE CREW BELOW" : "+ STACK A WATER TANK"}
              </motion.button>
            </div>

            {/* Projected dose preview — real NASA RAD reference */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <DosePreview label="If you shelter" dose={doseIfShelter} good />
              <DosePreview label="If you ignore" dose={doseIfIgnore} bad />
            </div>
            <div className="mt-1.5 text-[10px] text-slate-400 font-mono text-center">
              Risk points are a game model. See the science notebook for measurements.
            </div>

            {/* Decision buttons */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => resolveStorm("shelter")}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg transition-colors disabled:opacity-60"
              >
                <Shield className="w-5 h-5" />
                Move crew into shelter
              </button>
              <button
                onClick={() => resolveStorm("ignore")}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold shadow-lg transition-colors"
              >
                <Radiation className="w-5 h-5" />
                Ignore
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function StormData({ event }: { event: StormEventData }) {
  const kindLabel =
    event.kind === "CME" ? "Coronal Mass Ejection"
    : event.kind === "FLR" ? "Solar Flare"
    : "Solar Energetic Particles";
  const time = new Date(event.startTime).toLocaleString(undefined, {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZone: "UTC",
  });
  return (
    <div className="rounded-xl bg-slate-800/70 border border-slate-700 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Satellite className="w-4 h-4 text-amber-400" />
        <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wide">
          {event.kind}
        </span>
        <span className="text-slate-400 text-[10px] font-mono">
          {event.source === "live-donki" ? "NASA EVENT RECORD" : "NASA DOCUMENTED"}
        </span>
      </div>
      <p className="text-amber-100 text-sm font-semibold mb-2">Practice protecting the crew from a solar storm. This NASA event inspired the scenario. Game risk and timing are simplified.</p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <Field label="Type" value={kindLabel} />
        <Field label="Class / Speed" value={event.classType ?? (event.speedKmS ? `${event.speedKmS} km/s` : "—")} />
        <Field label="Source location" value={event.sourceLocation ?? "—"} />
        <Field label="Start (UTC)" value={time} />
      </div>
      <a
        href={event.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex items-center gap-1 text-xs text-rose-400 font-semibold hover:text-rose-300"
      >
        View NASA source <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[9px] text-slate-500 font-mono font-bold tracking-widest uppercase">{label}</div>
      <div className="text-slate-200 font-medium text-sm break-words">{value}</div>
    </div>
  );
}

function DosePreview({ label, dose, good, bad }: { label: string; dose: number; good?: boolean; bad?: boolean }) {
  const color = good ? "text-emerald-400" : "text-rose-400";
  const border = good ? "border-emerald-700/50 bg-emerald-950/30" : "border-rose-700/50 bg-rose-950/30";
  return (
    <div className={`rounded-lg border p-2.5 ${border}`}>
      <div className="text-[9px] font-mono font-bold tracking-widest text-slate-400 uppercase">{label}</div>
      <div className={`text-lg font-mono font-black ${color}`}>
        +{dose.toFixed(2)} risk points
      </div>
    </div>
  );
}
