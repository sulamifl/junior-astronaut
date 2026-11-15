"use client";

import { useGame } from "@/lib/game-store";
import { Zap, Droplets, Wind, Sun, Moon, Sunrise, Sunset as SunsetIcon, AlertTriangle, Users, Star, Radiation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TIME_META = {
  Evening: { icon: Sun, label: "EVENING" },
  Sunset: { icon: SunsetIcon, label: "SUNSET" },
  Night: { icon: Moon, label: "NIGHT" },
  Dawn: { icon: Sunrise, label: "DAWN" },
} as const;

export default function HUDBar() {
  const {
    discovery, previewDark,
    battery,
    batteryMax,
    water,
    air,
    crew,
    timeOfDay,
    phase,
    stormEvent,
    stormResolved,
    radiationLevel,
    score,
    openModal,
  } = useGame();

  const TimeIcon = TIME_META[timeOfDay].icon;
  const stormActive = stormEvent && phase === "storm-decision";

  // radiation status color (Curiosity RAD baseline ~0.67 mSv/day)
  const radColor =
    radiationLevel < 1 ? "text-emerald-400"
    : radiationLevel < 2.5 ? "text-amber-400"
    : radiationLevel < 4 ? "text-orange-400"
    : "text-rose-500";

  if (discovery !== "ready") return <header className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-white flex flex-wrap justify-between gap-3">
    <strong>MARS BASE COMMANDER</strong><span>4 crew · Landing supplies ready</span><span>{previewDark ? "Sunset preview" : "Daylight"}</span>
  </header>;
  return (
    <header className="w-full">
      <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/60 shadow-xl overflow-hidden">
        <div className="flex items-center gap-0 overflow-x-auto custom-scroll-x">
          {/* Logo + title */}
          <div className="flex items-center gap-2.5 px-3 sm:px-4 py-2.5 bg-gradient-to-r from-orange-900/40 to-slate-900 border-r border-slate-700/60 shrink-0">
            <motion.div
              className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-700 flex items-center justify-center shadow-lg relative overflow-hidden"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <span className="relative text-white font-black text-sm">M</span>
            </motion.div>
            <div className="leading-tight hidden sm:block">
              <div className="text-amber-100 font-black text-xs tracking-wide">
                MARS BASE COMMANDER
              </div>
              <div className="text-amber-200/60 text-[10px] font-mono">
                MISSION 01 · FIRST NIGHT
              </div>
            </div>
          </div>

          {/* Resource readouts */}
          <Readout icon={<Zap className="w-4 h-4 text-amber-400" />} label="POWER" value={`${battery}/${batteryMax}`} tone="amber">
            <div className="flex gap-0.5">
              {Array.from({ length: batteryMax }, (_, i) => (
                <motion.div
                  key={i}
                  animate={i < battery ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                  className={`w-2 h-4 rounded-sm ${i < battery ? "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]" : "bg-slate-700"}`}
                />
              ))}
            </div>
          </Readout>

          <Readout icon={<Droplets className="w-4 h-4 text-sky-400" />} label="WATER" value={`${water}%`} tone="sky">
            <div className="w-14 h-2.5 rounded-full bg-slate-700 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full" style={{ width: `${water}%` }} />
            </div>
          </Readout>

          <Readout icon={<Wind className="w-4 h-4 text-emerald-400" />} label="AIR" value={`${air}%`} tone="emerald">
            <div className="w-14 h-2.5 rounded-full bg-slate-700 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: `${air}%` }} />
            </div>
          </Readout>

          {/* Radiation meter — driven by real NASA RAD reference + storm decisions */}
          <div className="flex items-center gap-2 px-2.5 sm:px-3 py-2 border-l border-slate-700/40 shrink-0">
            <Radiation className={`w-4 h-4 ${radColor}`} />
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="text-slate-500 text-[9px] font-mono font-bold tracking-widest">GAME RISK</span>
              <span className={`${radColor} text-xs font-mono font-bold`}>
                {radiationLevel.toFixed(2)} risk pts
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-3 py-2 border-l border-slate-700/40 shrink-0">
            <div className="flex -space-x-1.5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 border-2 border-slate-900 flex items-center justify-center text-[8px] text-slate-700 font-bold">
                  {i + 1}
                </div>
              ))}
            </div>
            <span className="text-slate-200 text-xs font-mono font-bold">{crew}</span>
          </div>

          {/* Spacer */}
          <div className="flex-1 min-w-2" />

          {/* Score */}
          <div className="flex items-center gap-1.5 px-3 py-2 border-l border-slate-700/40 shrink-0">
            <Star className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 text-xs font-mono font-black">{score}</span>
            <span className="text-slate-500 text-[9px] font-mono hidden sm:inline">PTS</span>
          </div>

          {/* Storm alert */}
          <AnimatePresence>
            {stormActive && (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={() => openModal("storm")}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-red-600 hover:bg-red-500 border-l border-red-400 text-white text-xs font-bold tracking-wide shrink-0"
              >
                <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.6, repeat: Infinity }}>
                  <AlertTriangle className="w-4 h-4" />
                </motion.div>
                <span className="hidden sm:inline">SOLAR STORM!</span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Time of day */}
          <div className="flex items-center gap-1.5 px-3 py-2.5 border-l border-slate-700/40 bg-slate-800/60 shrink-0">
            <TimeIcon className="w-4 h-4 text-amber-300" />
            <span className="text-amber-100 text-[11px] font-mono font-bold tracking-wide">
              {TIME_META[timeOfDay].label}
            </span>
          </div>
        </div>

        {/* Storm status strip with real NASA event info */}
        <AnimatePresence>
          {stormEvent && stormResolved && phase !== "storm-decision" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-slate-700/60"
            >
              <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-900/20 text-[10px] text-amber-300 font-mono">
                <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="tracking-wide">
                  NASA EVENT · {stormEvent.kind} {stormEvent.classType ?? ""} · GAME DIFFICULTY {stormEvent.intensity}/100
                </span>
                <a
                  href={stormEvent.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-amber-400 hover:text-amber-300 underline"
                >
                  SOURCE ↗
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

function Readout({
  icon,
  label,
  value,
  tone,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "amber" | "sky" | "emerald";
  children: React.ReactNode;
}) {
  const toneRing =
    tone === "amber" ? "border-amber-700/30"
    : tone === "sky" ? "border-sky-700/30"
    : "border-emerald-700/30";
  const valColor =
    tone === "amber" ? "text-amber-300" : tone === "sky" ? "text-sky-300" : "text-emerald-300";
  return (
    <div className={`flex items-center gap-2 px-2.5 sm:px-3 py-2 border-l border-slate-700/40 shrink-0`}>
      {icon}
      <div className="flex flex-col gap-0.5 leading-none">
        <span className="text-slate-500 text-[9px] font-mono font-bold tracking-widest">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`${valColor} text-xs font-mono font-bold`}>{value}</span>
          {children}
        </div>
      </div>
    </div>
  );
}
