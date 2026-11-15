"use client";

import { useGame } from "@/lib/game-store";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, BookOpen, FlaskConical, Sun, Radiation, Wind, Mountain } from "lucide-react";
import { NASA_FACTS, GAMEPLAY_NOTES } from "@/lib/nasa-data";

const CATEGORY_META = {
  energy: { icon: Sun, label: "Energy & Power", color: "text-amber-600" },
  radiation: { icon: Radiation, label: "Radiation & Shielding", color: "text-rose-600" },
  "life-support": { icon: Wind, label: "Life Support", color: "text-sky-600" },
  weather: { icon: FlaskConical, label: "Space Weather", color: "text-violet-600" },
  terrain: { icon: Mountain, label: "Terrain & Site", color: "text-emerald-600" },
} as const;

export default function SciencePanel() {
  const { modal, closeModal } = useGame();
  if (modal !== "science") return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-2xl max-h-[88vh] flex flex-col bg-stone-50 rounded-2xl overflow-hidden shadow-2xl border border-stone-200"
        >
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-stone-800 to-stone-900 text-white">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm sm:text-base">NASA Science Behind the Game</h3>
            </div>
            <button
              onClick={() => closeModal()}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-y-auto p-4 sm:p-5 space-y-4 max-h-[78vh]">
            <p className="text-sm text-stone-600 leading-relaxed">
              Every fact in this game comes from a real NASA source. Game balance numbers
              (battery “divisions”, night length) are clearly labeled as teaching
              simplifications and are <b>not</b> real engineering norms.
            </p>

            {(["energy", "radiation", "life-support", "weather", "terrain"] as const).map((cat) => {
              const meta = CATEGORY_META[cat];
              const Icon = meta.icon;
              const facts = NASA_FACTS.filter((f) => f.category === cat);
              return (
                <section key={cat}>
                  <div className={`flex items-center gap-2 mb-2 ${meta.color}`}>
                    <Icon className="w-4 h-4" />
                    <h4 className="font-bold text-sm">{meta.label}</h4>
                  </div>
                  <div className="space-y-2">
                    {facts.map((f) => (
                      <div
                        key={f.id}
                        className="rounded-xl bg-white border border-stone-200 p-3"
                      >
                        <div className="text-sm font-semibold text-stone-800 mb-1">
                          {f.title}
                        </div>
                        <p className="text-xs text-stone-600 leading-relaxed">{f.text}</p>
                        <a
                          href={f.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-600"
                        >
                          {f.sourceLabel} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}

            <section>
              <div className="flex items-center gap-2 mb-2 text-stone-700">
                <FlaskConical className="w-4 h-4" />
                <h4 className="font-bold text-sm">Game simplifications (NOT NASA data)</h4>
              </div>
              <ul className="space-y-1.5">
                {GAMEPLAY_NOTES.map((n) => (
                  <li
                    key={n.id}
                    className="text-xs text-stone-600 bg-stone-100 border border-stone-200 rounded-lg px-3 py-2"
                  >
                    {n.text}
                  </li>
                ))}
              </ul>
            </section>

            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
              <div className="font-semibold mb-1">Live NASA DONKI feed</div>
              This game loads real space-weather events from NASA CCMC’s DONKI service. If
              the live API is unreachable, documented real NASA events are shown instead —
              never fabricated data.
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
