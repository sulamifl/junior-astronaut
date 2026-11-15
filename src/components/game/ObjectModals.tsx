"use client";

import { useGame } from "@/lib/game-store";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Battery as BatteryIcon, Sun, Bot, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft } from "lucide-react";

export default function ObjectModals() {
  const { modal, closeModal } = useGame();
  return (
    <AnimatePresence>
      {modal && modal !== "storm" && modal !== "science" && modal !== "greenhouse" && (
        <Backdrop>{renderModal(modal, closeModal)}</Backdrop>
      )}
    </AnimatePresence>
  );
}

function Backdrop({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm"
    >
      {children}
    </motion.div>
  );
}

function Card({
  title,
  icon,
  onClose,
  children,
  accent = "amber",
}: {
  title: string;
  icon: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  accent?: "amber" | "sky" | "emerald" | "rose";
}) {
  const head =
    accent === "amber" ? "from-amber-600 to-orange-700"
    : accent === "sky" ? "from-sky-700 to-blue-800"
    : accent === "emerald" ? "from-emerald-700 to-teal-800"
    : "from-rose-700 to-red-800";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: 8 }}
      className="w-full max-w-md bg-slate-50 rounded-lg overflow-hidden shadow-2xl border border-slate-300"
    >
      <div className={`flex items-center justify-between px-4 py-3 bg-gradient-to-r ${head}`}>
        <div className="flex items-center gap-2 text-white">
          {icon}
          <h3 className="font-bold text-sm tracking-wide uppercase">{title}</h3>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </motion.div>
  );
}

function renderModal(modal: string, close: () => void) {
  switch (modal) {
    case "battery":
      return <BatteryModal close={close} />;
    case "robot":
      return <RobotModal close={close} />;
    case "solar":
      return <SolarModal close={close} />;
    case "plan":
      return <PlanModal close={close} />;
    default:
      return null;
  }
}

function StatBox({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone: "neutral" | "amber" }) {
  return (
    <div className={`rounded-md border p-3 ${tone === "amber" ? "bg-amber-50 border-amber-200" : "bg-slate-100 border-slate-200"}`}>
      <div className={`text-[10px] font-mono font-bold tracking-widest uppercase ${tone === "amber" ? "text-amber-700" : "text-slate-500"}`}>
        {label}
      </div>
      <div className={`text-2xl font-mono font-black mt-0.5 ${tone === "amber" ? "text-amber-700" : "text-slate-800"}`}>
        {value}
      </div>
      {sub && <div className={`text-[10px] mt-0.5 ${tone === "amber" ? "text-amber-600" : "text-slate-500"}`}>{sub}</div>}
    </div>
  );
}

function BatteryModal({ close }: { close: () => void }) {
  const { battery, batteryMax, baseConnected, connectBase } = useGame();
  const need = 4;
  return (
    <Card title="Base Battery" icon={<BatteryIcon className="w-5 h-5" />} onClose={close} accent="amber">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatBox label="Current" value={`${battery}/${batteryMax}`} sub="divisions" tone="neutral" />
        <StatBox label="Need for night" value={`${need}`} sub="divisions" tone="amber" />
      </div>
      <div className="flex gap-1.5 mb-4">
        {Array.from({ length: batteryMax }, (_, i) => (
          <div key={i} className={`flex-1 h-7 rounded-sm border ${i < battery ? "bg-amber-500 border-amber-400" : "bg-slate-200 border-slate-300"}`} />
        ))}
      </div>
      <p className="text-sm text-slate-700 mb-4 leading-relaxed">
        Solar panels make electricity in daylight. The battery saves it for night, when the panels stop. Heat and air circulation need 4 units to keep the crew safe. Connect the battery to power them.
      </p>
      {baseConnected ? (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4" /> Connected — base ready for night.
        </div>
      ) : (
        <button
          onClick={() => { connectBase(); close(); }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold shadow-lg transition-colors"
        >
          <Zap className="w-4 h-4" /> Connect to Base
        </button>
      )}
      <p className="mt-3 text-[11px] text-slate-500 leading-snug">
        Game units. NASA concept: ~15 kW for critical life support, 4-person station.
      </p>
    </Card>
  );
}

function RobotModal({ close }: { close: () => void }) {
  const { robotStatus, battery, chargeRobotNow, chargeRobotMorning } = useGame();
  const disabled = robotStatus !== "uncharged";
  return (
    <Card title="Scout Rover" icon={<Bot className="w-5 h-5" />} onClose={close} accent="sky">
      <p className="text-sm text-slate-700 mb-3 leading-relaxed">
        Tomorrow the rover drives out to photograph rocks. It needs charging too.
      </p>
      <div className="rounded-md bg-sky-50 border border-sky-200 p-3 mb-4 text-sm text-sky-900">
        <div className="font-semibold mb-1">When do we charge the rover?</div>
        Night needs <b>4</b> divisions. Rover needs <b>2</b> more. Charge now, then collect 2 more units from the panels. Or save the reserve and charge the rover after sunrise.
      </div>

      {robotStatus === "charged" && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4" /> Rover charged — ready for the trip.
        </div>
      )}
      {robotStatus === "charge-in-morning" && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4" /> Charging planned for morning.
        </div>
      )}

      {disabled ? (
        <button onClick={close} className="mt-4 w-full px-4 py-2.5 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-sm">
          Close
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={chargeRobotNow}
            disabled={battery < 2}
            className="flex flex-col items-center gap-1 px-3 py-3 rounded-md bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg transition-colors"
          >
            <Zap className="w-5 h-5" /> Charge Now
            <span className="text-[10px] font-mono opacity-90">−2 FROM BATTERY</span>
          </button>
          <button
            onClick={chargeRobotMorning}
            className="flex flex-col items-center gap-1 px-3 py-3 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-sm shadow-lg transition-colors"
          >
            <Sun className="w-5 h-5" /> In the Morning
            <span className="text-[10px] font-mono opacity-80">KEEP RESERVE</span>
          </button>
        </div>
      )}
    </Card>
  );
}

function SolarModal({ close }: { close: () => void }) {
  const { eveningRefillUsed, waitSunset, timeOfDay, battery } = useGame();
  const canWait = !eveningRefillUsed && timeOfDay === "Evening";
  return (
    <Card title="Solar Array" icon={<Sun className="w-5 h-5" />} onClose={close} accent="amber">
      <p className="text-sm text-slate-700 mb-3 leading-relaxed">
        The sun is still up. We can collect a bit more energy before sunset.
      </p>
      <div className="rounded-md bg-amber-50 border border-amber-200 p-3 mb-4 text-sm text-amber-900">
        <div className="font-semibold mb-1 text-[10px] font-mono tracking-widest uppercase">Before sunset you can add</div>
        <div className="text-2xl font-mono font-black">+2 divisions</div>
        <div className="text-xs text-amber-700 mt-1">One-time. Won't repeat.</div>
      </div>
      {eveningRefillUsed ? (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Refill used. Battery: {battery}/6
        </div>
      ) : canWait ? (
        <button onClick={waitSunset} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold shadow-lg transition-colors">
          <Sun className="w-4 h-4" /> Wait Until Sunset
        </button>
      ) : (
        <div className="text-sm text-slate-500">It is {timeOfDay.toLowerCase()} — refill moment has passed.</div>
      )}
      <p className="mt-3 text-[11px] text-slate-500 leading-snug">
        Real generation depends on dust, latitude, panel angle (NASA Mars Trek).
      </p>
    </Card>
  );
}

function PlanModal({ close }: { close: () => void }) {
  const g = useGame();
  const energyOk = g.battery >= 4;
  const canStart = g.baseConnected && energyOk;
  return (
    <Card title="Plan Check" icon={<CheckCircle2 className="w-5 h-5" />} onClose={close} accent="emerald">
      <ul className="space-y-2 mb-4">
        <CheckRow ok={g.baseConnected} label="Battery connected to base" />
        <CheckRow ok={energyOk} label={`Enough energy for night (${g.battery}/4)`} />
        <CheckRow
          ok={g.robotStatus !== "uncharged"}
          label={
            g.robotStatus === "charged" ? "Rover charged (evening)"
            : g.robotStatus === "charge-in-morning" ? "Rover charging planned (morning)"
            : "Rover not planned"
          }
        />
      </ul>
      {canStart ? (
        <div className="space-y-3">
          <div className="rounded-md bg-emerald-50 border border-emerald-300 px-3 py-2.5 text-emerald-800 text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Energy will last until morning.
          </div>
          <button
            onClick={() => { close(); g.beginNight(); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg transition-colors"
          >
            Start Night <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-md bg-rose-50 border border-rose-300 px-3 py-2.5 text-rose-800 text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {!g.baseConnected ? "Connect the battery to the base first." : "Not enough energy. Tap the solar panels to top up before sunset."}
          </div>
          <button onClick={close} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Base
          </button>
        </div>
      )}
    </Card>
  );
}

function CheckRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <CheckCircle2 className={`w-4 h-4 ${ok ? "text-emerald-500" : "text-slate-300"}`} />
      <span className={ok ? "text-slate-800" : "text-slate-400"}>{label}</span>
    </li>
  );
}
