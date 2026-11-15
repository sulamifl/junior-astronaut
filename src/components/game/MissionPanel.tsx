"use client";

import DiscoveryPanel from "./DiscoveryPanel";
import { useGame, type MissionTask, type Badge } from "@/lib/game-store";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Loader2, SkipForward, BookOpen, Target, Hand, ClipboardCheck, Award } from "lucide-react";

/**
 * MissionPanel — the clarity centerpiece.
 *
 * Shows the player at all times:
 *  - The big-picture objective
 *  - A numbered step list (where am I in the mission?)
 *  - The single next action (what do I do right now?)
 *
 * This is what makes the game intuitive: a kid always knows what to do next.
 */
export default function MissionPanel() {
  const { discovery, tasks, activeTaskId, assistantText, openModal, phase, startPlanCheck, baseConnected, robotStatus, score, badges } =
    useGame();
  const canCheckPlan =
    baseConnected && (robotStatus === "charged" || robotStatus === "charge-in-morning");

  const activeTask = tasks.find((t) => t.id === activeTaskId);
  const completedCount = tasks.filter((t) => t.state === "done" || t.state === "skipped").length;
  const progress = Math.round((completedCount / tasks.length) * 100);

  if (discovery !== "ready") return <DiscoveryPanel />;

  return (
    <aside className="w-full lg:w-80 xl:w-96 shrink-0 flex flex-col gap-3">
      {/* Objective card */}
      <div className="rounded-xl bg-slate-900 border border-slate-700/60 shadow-lg overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700/60">
          <Target className="w-4 h-4 text-amber-400" />
          <h2 className="text-slate-100 text-xs font-bold uppercase tracking-wider">
            Mission Objective
          </h2>
        </div>
        <div className="p-4">
          <p className="text-slate-200 text-sm leading-snug font-semibold">
            Keep 4 crew warm tonight. Then choose what to build next.
          </p>
          <p className="text-slate-400 text-xs mt-1.5 leading-snug">
            Solar panels stop at sunset. You have one battery. The rover also needs
            charging for tomorrow. Plan carefully.
          </p>
          {/* progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
              <span>Progress</span>
              <span className="font-mono text-slate-400">
                {completedCount}/{tasks.length}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <motion.div
                className="h-full bg-amber-500 rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Step list */}
      <div className="rounded-xl bg-slate-900 border border-slate-700/60 shadow-lg overflow-hidden flex-1">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700/60">
          <Loader2 className="w-4 h-4 text-slate-400" />
          <h2 className="text-slate-100 text-xs font-bold uppercase tracking-wider">
            Mission Steps
          </h2>
        </div>
        <ol className="p-2 space-y-1 max-h-[340px] overflow-y-auto custom-scroll">
          {tasks.map((t, i) => (
            <TaskRow key={t.id} task={t} index={i} />
          ))}
        </ol>
      </div>

      {/* Next action — the single most important clarity element */}
      {activeTask && phase !== "quiz" && phase !== "dawn" && (
        <div className="rounded-xl bg-amber-950/40 border border-amber-700/50 shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-900/40 border-b border-amber-700/40">
            <Hand className="w-4 h-4 text-amber-300" />
            <span className="text-amber-100 text-xs font-bold uppercase tracking-wider">
              Next Action
            </span>
          </div>
          <div className="p-4">
            <p className="text-amber-50 text-sm font-semibold leading-snug mb-3">
              {activeTask.label}
            </p>
            <p className="text-amber-200/80 text-xs leading-snug mb-3">
              {activeTask.hint}
            </p>
            <AnimatePresence initial={false}>
              <motion.p
                key={assistantText}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-slate-300 text-xs italic leading-snug border-l-2 border-amber-600/50 pl-2.5"
              >
                {assistantText}
              </motion.p>
            </AnimatePresence>
            {phase === "greenhouse" && <button className="mt-3 w-full rounded-md bg-amber-400 p-3 font-bold text-slate-900" onClick={() => openModal("greenhouse")}>Open greenhouse</button>}
            {/* Action button when the active task is to check the plan */}
            {activeTaskId === "check-plan" && canCheckPlan && (
              <button
                onClick={startPlanCheck}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-sm shadow-lg transition-colors"
              >
                <ClipboardCheck className="w-4 h-4" />
                Check Plan
              </button>
            )}
          </div>
        </div>
      )}

      {/* Score & Badges */}
      <div className="rounded-xl bg-slate-900 border border-slate-700/60 shadow-lg overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700/60">
          <Award className="w-4 h-4 text-amber-400" />
          <h2 className="text-slate-100 text-xs font-bold uppercase tracking-wider">
            Score & Badges
          </h2>
        </div>
        <div className="p-4">
          <div className="flex items-end gap-1.5 mb-3">
            <span className="text-3xl font-mono font-black text-amber-300">{score}</span>
            <span className="text-slate-500 text-xs font-mono mb-1">pts</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {BADGE_META.map((b) => {
              const earned = badges.includes(b.id);
              return (
                <div
                  key={b.id}
                  title={b.label}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono font-bold border transition-all ${
                    earned
                      ? "bg-amber-500/20 border-amber-500/60 text-amber-200"
                      : "bg-slate-800/60 border-slate-700/40 text-slate-600 opacity-50"
                  }`}
                >
                  <span>{earned ? b.icon : "🔒"}</span>
                  <span>{b.short}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Science button */}
      <button
        onClick={() => openModal("science")}
        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-200 text-xs font-semibold transition-colors"
      >
        <BookOpen className="w-4 h-4 text-amber-400" />
        NASA Science & Sources
      </button>
    </aside>
  );
}

function TaskRow({ task, index }: { task: MissionTask; index: number }) {
  const isActive = task.state === "active";
  const isDone = task.state === "done";
  const isSkipped = task.state === "skipped";

  return (
    <li
      className={`flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors ${
        isActive
          ? "bg-amber-500/10 border border-amber-600/40"
          : isDone
          ? "bg-emerald-950/30 border border-transparent"
          : isSkipped
          ? "opacity-50 border border-transparent"
          : "border border-transparent"
      }`}
    >
      <div className="shrink-0 mt-0.5">
        {isDone ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        ) : isSkipped ? (
          <SkipForward className="w-5 h-5 text-slate-500" />
        ) : isActive ? (
          <div className="w-5 h-5 rounded-full border-2 border-amber-400 flex items-center justify-center">
            <motion.div
              className="w-2 h-2 rounded-full bg-amber-400"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        ) : (
          <Circle className="w-5 h-5 text-slate-600" />
        )}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-mono ${
              isActive ? "text-amber-400" : isDone ? "text-emerald-500" : "text-slate-600"
            }`}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <span
            className={`text-sm font-medium leading-tight ${
              isActive
                ? "text-amber-50"
                : isDone
                ? "text-slate-300"
                : "text-slate-400"
            }`}
          >
            {task.label}
          </span>
        </div>
      </div>
    </li>
  );
}

const BADGE_META: { id: Badge; label: string; short: string; icon: string }[] = [
  { id: "first-night", label: "Completed the First Night", short: "FIRST NIGHT", icon: "🌙" },
  { id: "shelter-pro", label: "Built full water shielding (NASA-STD-3001)", short: "SHIELD PRO", icon: "🛡" },
  { id: "green-thumb", label: "Grew plants in the Mars greenhouse", short: "GREEN THUMB", icon: "🌱" },
  { id: "speed-runner", label: "Finished the mission fast", short: "SPEED RUN", icon: "⚡" },
  { id: "nasa-scientist", label: "Master engineer of Mars", short: "SCIENTIST", icon: "🔬" },
];
