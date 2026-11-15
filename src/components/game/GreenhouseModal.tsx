"use client";

import { useGame } from "@/lib/game-store";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { X, Droplets, Sun, Sprout, ExternalLink, FlaskConical } from "lucide-react";

/**
 * GreenhouseModal — interactive plant-growth mini-game.
 *
 * References real NASA OSDR experiments:
 *  - OSD-314: Arabidopsis seedlings under partial Mars gravity + red light
 *  - OSD-22: Root response to magnesium sulfate (Martian regolith simulant)
 *  - ISS water recovery (98%) — reusing water for plants
 *
 * Player turns on the grow light and waters the plants, then the plants
 * grow over time. Earns the "green-thumb" badge.
 */
export default function GreenhouseModal() {
  const {
    modal,
    closeModal,
    plantGrowth,
    plantWatered,
    plantLightOn,
    waterPlant,
    togglePlantLight,
    growPlantTick,
    water,
    battery,
    setPhase,
    assistantText,
  } = useGame();

  const open = modal === "greenhouse";

  // plant growth tick (every 700ms if watered + light on)
  useEffect(() => {
    if (!open) return;
    if (!plantWatered || !plantLightOn) return;
    if (plantGrowth >= 100) return;
    const t = setInterval(() => growPlantTick(), 700);
    return () => clearInterval(t);
  }, [open, plantWatered, plantLightOn, plantGrowth, growPlantTick]);

  if (!open) return null;

  const ready = plantWatered && plantLightOn;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 8 }}
          className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/80 to-slate-900"
        >
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-700 to-teal-800">
            <div className="flex items-center gap-2 text-white">
              <Sprout className="w-5 h-5" />
              <h3 className="font-black text-sm tracking-wide">GREENHOUSE LAB</h3>
            </div>
            <button
              aria-label="Close greenhouse" onClick={closeModal}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 sm:p-5">
            <p className="text-emerald-100 text-sm mb-3 leading-relaxed">
              The crew needs food every day. This greenhouse protects our plants while we grow fresh food. First water them, then power the grow light. Growth is sped up for this game.
            </p>

            <p className="text-emerald-100 text-sm mb-3">{assistantText}</p>
            <p className="text-white font-bold mb-3">Water: {water}% · Battery: {battery}/6</p>
            {/* plant stage visualization */}
            <div className="relative h-32 rounded-xl bg-gradient-to-b from-sky-900/40 to-amber-950/40 border border-emerald-700/40 overflow-hidden mb-4">
              {/* soil */}
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-b from-amber-800 to-amber-950" />
              {/* grow light beam when on */}
              {plantLightOn && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-full bg-gradient-to-b from-rose-400/50 to-transparent"
                />
              )}
              {/* plants */}
              <div className="absolute bottom-7 left-0 right-0 flex justify-around items-end">
                {[0, 1, 2, 3, 4].map((i) => {
                  const h = 12 + plantGrowth * 0.6;
                  const sz = 6 + plantGrowth * 0.08;
                  return (
                    <motion.div
                      key={i}
                      animate={ready && plantGrowth < 100 ? { y: [0, -2, 0] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      className="flex flex-col items-center"
                    >
                      {plantGrowth > 60 && (
                        <div className="mb-1 w-2 h-2 rounded-full bg-rose-400" />
                      )}
                      <div
                        className="rounded-full"
                        style={{
                          width: `${sz}px`,
                          height: `${sz}px`,
                          backgroundColor: plantGrowth > 40 ? "#4ade80" : "#84a85a",
                        }}
                      />
                      <div
                        className="w-1 bg-emerald-700"
                        style={{ height: `${h}px` }}
                      />
                    </motion.div>
                  );
                })}
              </div>
              {/* growth percentage */}
              <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-black/60 text-emerald-300 text-xs font-mono font-bold">
                {Math.round(plantGrowth)}% GROWN
              </div>
              {/* sun icon if light on */}
              {plantLightOn && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute top-2 right-2"
                >
                  <Sun className="w-5 h-5 text-rose-400" />
                </motion.div>
              )}
            </div>

            {/* growth progress bar */}
            <div className="h-3 rounded-full bg-slate-800 overflow-hidden mb-4">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
                animate={{ width: `${plantGrowth}%` }}
              />
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                onClick={waterPlant}
                disabled={plantWatered || water < 5}
                className="flex flex-col items-center gap-1 px-3 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold shadow-lg transition-colors"
              >
                <Droplets className="w-5 h-5" />
                <span className="text-sm">Water</span>
                <span className="text-[10px] font-mono opacity-80">
                  {plantWatered ? "DONE ✓" : "−5% WATER"}
                </span>
              </button>
              <button
                disabled={!plantWatered || plantGrowth >= 100 || (plantGrowth === 0 && battery < 1)}
                onClick={togglePlantLight}
                className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl font-bold shadow-lg transition-colors ${
                  plantLightOn
                    ? "bg-amber-500 hover:bg-amber-400 text-slate-900"
                    : "bg-rose-700 hover:bg-rose-600 text-white"
                }`}
              >
                <Sun className="w-5 h-5" />
                <span className="text-sm">{plantLightOn ? "Light ON" : "Light OFF"}</span>
                <span className="text-[10px] font-mono opacity-80">{plantGrowth === 0 ? "1 ENERGY FOR THIS CROP" : "ENERGY ALREADY PAID"}</span>
              </button>
            </div>

            {/* status / instructions */}
            {!ready && plantGrowth < 100 ? (
              <div className="rounded-lg bg-amber-900/30 border border-amber-700/40 px-3 py-2 text-amber-200 text-xs text-center">
                Water the plants first. Then switch on the light. One energy unit pays for this whole crop.
              </div>
            ) : plantGrowth >= 100 ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="rounded-lg bg-emerald-900/50 border border-emerald-500/50 px-3 py-2 text-emerald-200 text-xs text-center font-semibold"
              >
                🌱 Plants fully grown! +100 pts · GREEN-THUMB badge!
              </motion.div>
            ) : (
              <div className="rounded-lg bg-emerald-900/30 border border-emerald-700/40 px-3 py-2 text-emerald-200 text-xs text-center">
                Growing… the light uses the 1 energy unit you already paid. Real plants take much longer!
              </div>
            )}

            {plantGrowth >= 100 && <button className="mt-4 w-full rounded-lg bg-amber-400 p-3 font-bold text-slate-900" onClick={() => { closeModal(); setPhase("quiz"); }}>Food is ready — finish mission</button>}
            {/* NASA science footer */}
            <div className="mt-3 rounded-lg bg-slate-800/60 border border-slate-700/50 p-2.5">
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-400 mb-1 tracking-widest">
                <FlaskConical className="w-3 h-3" />
                NASA OSDR · REAL EXPERIMENTS
              </div>
              <div className="text-[11px] text-slate-300 leading-snug space-y-1">
                <div>
                  <a href="https://osdr.nasa.gov/bio/repo/data/studies/OSD-314" target="_blank" rel="noopener noreferrer" className="text-emerald-300 hover:text-emerald-200 underline inline-flex items-center gap-0.5">
                    OSD-314 <ExternalLink className="w-2.5 h-2.5 inline" />
                  </a>{" "}
                  — Arabidopsis seedlings under Mars-level gravity & red light
                </div>
                <div>
                  <a href="https://osdr.nasa.gov/bio/repo/data/studies/OSD-22" target="_blank" rel="noopener noreferrer" className="text-emerald-300 hover:text-emerald-200 underline inline-flex items-center gap-0.5">
                    OSD-22 <ExternalLink className="w-2.5 h-2.5 inline" />
                  </a>{" "}
                  — Root response to magnesium sulfate (Martian soil simulant)
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
