"use client";

import { useGame } from "@/lib/game-store";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, ArrowRight, Shield, Sun, Battery, Radio, Satellite, Sprout, Zap } from "lucide-react";

export default function IntroScreen() {
  const { phase, setPhase, setAssistant, stormEvent, donkiSource } = useGame();

  const start = () => {
    setAssistant("Sun is setting soon! Tap the glowing battery to begin. 👆");
    setPhase("evening");
  };

  return (
    <AnimatePresence>
      {phase === "intro" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-orange-950/60 overflow-y-auto"
        >
          {/* Starfield */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 50 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-amber-100"
                style={{
                  left: `${(i * 37) % 100}%`,
                  top: `${(i * 53) % 70}%`,
                  width: `${1 + (i % 3) * 0.5}px`,
                  height: `${1 + (i % 3) * 0.5}px`,
                }}
                animate={{ opacity: [0.2, 0.8, 0.2] }}
                transition={{ duration: 2 + (i % 5), repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>

          {/* Floating Mars planet */}
          <motion.div
            className="absolute right-4 top-4 sm:right-12 sm:top-12 w-24 h-24 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-orange-500 via-red-600 to-red-900 shadow-2xl pointer-events-none hidden sm:block"
            animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          >
            <div className="absolute inset-2 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,200,120,0.4),transparent_50%)]" />
            <div className="absolute top-1/3 left-1/4 w-6 h-4 rounded-full bg-red-900/40" />
            <div className="absolute bottom-1/4 right-1/3 w-4 h-3 rounded-full bg-red-900/30" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 bg-slate-900/80 backdrop-blur my-auto"
          >
            {/* Header with cute mascot */}
            <div className="flex items-center gap-4 px-5 sm:px-8 py-6 bg-gradient-to-r from-orange-900/40 via-slate-900 to-slate-900 border-b border-slate-700/60">
              {/* Mascot robot */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-400 flex items-center justify-center shadow-2xl relative"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-slate-800 flex items-center justify-center relative">
                  <motion.div
                    className="absolute w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-cyan-300"
                    style={{ left: "22%", top: "32%" }}
                    animate={{ scaleY: [1, 0.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity, times: [0, 0.5, 1] }}
                  />
                  <motion.div
                    className="absolute w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-cyan-300"
                    style={{ right: "22%", top: "32%" }}
                    animate={{ scaleY: [1, 0.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity, times: [0, 0.5, 1] }}
                  />
                  <motion.div
                    className="absolute left-1/2 -translate-x-1/2 bottom-2 w-6 h-1 rounded-full bg-cyan-300"
                    animate={{ scaleX: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </motion.div>
              <div>
                <motion.h1
                  className="text-amber-100 text-2xl sm:text-3xl font-black tracking-tight leading-none"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  MARS BASE
                </motion.h1>
                <motion.h1
                  className="text-amber-300 text-2xl sm:text-3xl font-black tracking-tight leading-none"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  COMMANDER
                </motion.h1>
                <p className="text-amber-200/70 text-xs font-mono tracking-widest mt-1.5">
                  MISSION 01 · FIRST NIGHT ON MARS
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              {/* Mission briefing with mascot speech bubble */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-slate-800/50 border border-slate-700/40 p-4 mb-5 flex gap-3"
              >
                <div className="shrink-0 w-8 h-8 rounded-full bg-cyan-400 flex items-center justify-center text-slate-900 font-black">
                  M
                </div>
                <p className="text-slate-200 text-sm leading-relaxed">
                  <b className="text-amber-200">Hi Commander!</b> I'm your base AI. The sun is
                  setting on Mars. Solar panels stop working at night — you have{" "}
                  <b className="text-amber-200">1 battery</b> and{" "}
                  <b className="text-amber-200">4 crew</b> to keep warm. Save electricity for the night, protect the crew during a practice storm, then grow fresh food in the morning. Ready?
                </p>
              </motion.div>

              {/* What you'll do — game feature cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
                <FeatureCard icon={<Battery className="w-5 h-5" />} color="amber" title="Battery" text="Store energy" delay={0} />
                <FeatureCard icon={<Rocket className="w-5 h-5" />} color="sky" title="Rover" text="Plan charge" delay={0.08} />
                <FeatureCard icon={<Shield className="w-5 h-5" />} color="rose" title="Storm" text="NASA data!" delay={0.16} />
                <FeatureCard icon={<Sprout className="w-5 h-5" />} color="emerald" title="Plants" text="Grow food" delay={0.24} />
              </div>

              {/* NASA data notice — live integration */}
              {stormEvent && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-5 rounded-2xl bg-rose-950/40 border-2 border-rose-700/50 p-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.8, repeat: Infinity }}>
                      <Satellite className="w-4 h-4 text-rose-400" />
                    </motion.div>
                    <span className="text-rose-200 text-xs font-mono font-bold tracking-wider">
                      NASA EVENT RECORD LOADED
                    </span>
                  </div>
                  <div className="text-slate-300 text-sm">
                    Scenario inspired by: <b className="text-amber-200">{stormEvent.kind}</b>{" "}
                    {stormEvent.classType ?? ""}
                    {" · "}
                    <span className={stormEvent.intensity > 70 ? "text-rose-400" : "text-amber-300"}>
                      INTENSITY {stormEvent.intensity}/100
                    </span>
                  </div>
                  <div className="text-slate-500 text-[10px] font-mono mt-1">
                    SOURCE: {donkiSource === "live-donki" ? "LIVE DONKI API ✓" : "NASA DOCUMENTED"}
                  </div>
                </motion.div>
              )}

              {/* CTA */}
              <motion.button
                onClick={start}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 font-black text-lg shadow-2xl shadow-amber-900/40 transition-all"
              >
                <Zap className="w-5 h-5" />
                BEGIN MISSION
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-mono tracking-wide">
                <Radio className="w-3 h-3" />
                NO SIGN-UP · PLAY IN BROWSER · NASA SPACE APPS CHALLENGE
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FeatureCard({
  icon,
  color,
  title,
  text,
  delay,
}: {
  icon: React.ReactNode;
  color: "amber" | "sky" | "rose" | "emerald";
  title: string;
  text: string;
  delay: number;
}) {
  const colors = {
    amber: "from-amber-600/30 to-orange-700/20 border-amber-700/40 text-amber-300",
    sky: "from-sky-700/30 to-blue-800/20 border-sky-700/40 text-sky-300",
    rose: "from-rose-700/30 to-red-800/20 border-rose-700/40 text-rose-300",
    emerald: "from-emerald-700/30 to-teal-800/20 border-emerald-700/40 text-emerald-300",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.05 }}
      className={`rounded-xl bg-gradient-to-b ${colors[color]} border p-3 flex flex-col items-center text-center gap-1`}
    >
      {icon}
      <div className="text-slate-100 font-bold text-xs">{title}</div>
      <div className="text-slate-400 text-[10px]">{text}</div>
    </motion.div>
  );
}
