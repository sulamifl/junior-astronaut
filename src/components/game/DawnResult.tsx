"use client";

import { useGame } from "@/lib/game-store";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, RotateCcw, Award, ArrowRight } from "lucide-react";

export default function DawnResult() {
  const { phase, battery, robotStatus, stormChoice, setPhase, openModal, stormEvent, score, badges, startGreenhouse, deferGreenhouse } = useGame();

  return (
    <AnimatePresence>
      {phase === "dawn" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md bg-slate-50 rounded-lg overflow-hidden shadow-2xl border border-slate-300"
          >
            <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-700 to-teal-800 text-white">
              <Award className="w-5 h-5" />
              <h3 className="font-bold text-sm tracking-wide uppercase">First night survived</h3>
            </div>
            <div className="p-4 sm:p-5">
              <p className="text-sm text-slate-700 leading-relaxed mb-3">
                The base ran all night on stored energy. The sun is back and the solar
                panels can charge again. We have packed food for now. For a longer stay, a greenhouse can grow fresh food: the greenhouse keeps plants inside a protected space with water and light.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-md bg-slate-100 border border-slate-200 p-3">
                  <div className="text-[10px] text-slate-500 font-mono font-bold tracking-widest uppercase">Battery left</div>
                  <div className="text-2xl font-mono font-black text-slate-800 mt-0.5">{battery}/6</div>
                </div>
                <div className="rounded-md bg-slate-100 border border-slate-200 p-3">
                  <div className="text-[10px] text-slate-500 font-mono font-bold tracking-widest uppercase">Rover</div>
                  <div className="text-sm font-bold text-slate-800 leading-tight mt-1">
                    {robotStatus === "charged" ? "Ready for the trip" : "Needs morning charge"}
                  </div>
                </div>
              </div>

              {stormEvent && (
                <div
                  className={`rounded-md border p-3 mb-4 text-sm ${
                    stormChoice === "shelter"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                      : "bg-rose-50 border-rose-300 text-rose-800"
                  }`}
                >
                  <div className="font-semibold flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Storm decision: {stormChoice === "shelter" ? "You sheltered the crew" : "You continued as normal"}
                  </div>
                  <p className="text-xs leading-snug">
                    {stormChoice === "shelter"
                      ? "Following NASA-STD-3001, water-based shielding around the crew lowers their dose during the event."
                      : "Without sheltering the crew took a higher radiation dose this night. On a real mission this matters."}
                  </p>
                </div>
              )}

              {/* Score & badges earned */}
              <div className="rounded-xl bg-slate-900/70 border border-slate-700/60 p-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-[10px] font-mono font-bold tracking-widest">TOTAL SCORE</span>
                  <span className="text-amber-300 text-xl font-mono font-black">{score} pts</span>
                </div>
                {badges.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {badges.map((b) => (
                      <span key={b} className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/50 text-amber-200 text-[10px] font-mono font-bold">
                        {b.replace("-", " ").toUpperCase()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={startGreenhouse}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold shadow-lg transition-colors"
              >
                Build a greenhouse & grow food
                <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={deferGreenhouse} className="mt-3 w-full rounded-lg border border-slate-400 p-3 font-bold text-slate-800">Save the greenhouse for later · Finish mission</button>
              <button
                onClick={() => openModal("science")}
                className="mt-2 w-full text-xs text-slate-500 hover:text-slate-700 underline"
              >
                Review NASA sources
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function QuizScreen() {
  const { phase, quizAnswer, quizDone, submitQuiz, restart, quizRetries, plantGrowth } = useGame();
  if (phase !== "quiz") return null;

  const options: { id: "battery" | "panels" | "antenna"; label: string; sub: string }[] = [
    { id: "panels", label: "Solar panels under the dark sky", sub: "They worked at night" },
    { id: "battery", label: "A battery charged earlier", sub: "It stored electricity from before" },
    { id: "antenna", label: "The communications antenna", sub: "It beamed power down" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-slate-50 rounded-2xl overflow-hidden shadow-2xl border border-slate-200"
      >
        <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white">
          <Award className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-sm sm:text-base">Check your understanding</h3>
        </div>
        <div className="p-4 sm:p-5">
          <p className="text-sm text-slate-700 mb-3 font-semibold">
            What helped the base keep running after sunset?
          </p>
          <div className="space-y-2">
            {options.map((o) => {
              const selected = quizAnswer === o.id;
              const isCorrect = o.id === "battery";
              const showState = selected && quizAnswer !== null;
              return (
                <button
                  key={o.id}
                  disabled={quizDone}
                  onClick={() => submitQuiz(o.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border-2 transition-colors flex items-center gap-3 ${
                    showState
                      ? isCorrect
                        ? "bg-emerald-50 border-emerald-400"
                        : "bg-rose-50 border-rose-400"
                      : "bg-white border-slate-200 hover:border-amber-400"
                  } ${quizDone && !isCorrect ? "opacity-50" : ""}`}
                >
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      showState
                        ? isCorrect
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-rose-500 bg-rose-500"
                        : "border-slate-300"
                    }`}
                  >
                    {showState && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-800">{o.label}</span>
                    <span className="block text-[11px] text-slate-500">{o.sub}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {quizRetries > 0 && !quizDone && (
            <p className="mt-2 text-xs text-rose-600">Not quite — try again ({quizRetries} attempt(s)).</p>
          )}

          {quizDone && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800 mb-3">
                <div className="font-semibold mb-1">Mission complete!</div>
                You built a solar panel, connected storage, and kept the habitat powered through the night. The battery saved daytime electricity for heat and air.
                {plantGrowth >= 100 ? " Your fresh crop used 5% water and 1 energy unit." : " You chose to use packed food and save greenhouse construction for later."}
                {" "}All required steps are finished.
              </div>
              <button
                onClick={restart}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold shadow-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Play again with a new plan
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
