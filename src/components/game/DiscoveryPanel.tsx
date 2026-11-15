"use client";

import { useState } from "react";
import { useGame } from "@/lib/game-store";

export default function DiscoveryPanel() {
  const g = useGame();
  const [idea, setIdea] = useState("");
  const button = "w-full rounded-xl bg-amber-400 p-3 text-left font-bold text-slate-950 hover:bg-amber-300 focus-visible:outline-2 focus-visible:outline-white";
  const titles = {
    base: "Our home needs power.",
    panel: "Sunlight caught. Where does it go?",
    wired: "The lights are on!",
    problem: "How can we keep the lights on?",
    storage: "A place to save electricity.",
    charged: "Will our idea work after sunset?",
    ready: "Ready to explore.",
  };
  return <aside className="w-full lg:w-80 xl:w-96 rounded-xl border border-slate-700 bg-slate-900 p-5 text-white space-y-4">
    <p className="text-xs text-amber-300 font-bold">BUILD YOUR FIRST POWER SYSTEM</p>
    <h2 className="text-xl font-bold">{titles[g.discovery]}</h2>
    <p className="text-sm leading-relaxed text-slate-200" aria-live="polite">{g.assistantText || "The crew has just arrived. They need electricity for a lamp, warm air and a fan. There is sunlight outside. Tap the empty plot to build a solar panel from our supplies."}</p>
    {g.discovery === "base" && <p className="text-sm text-slate-400">The crew can wait safely in the landing shelter while you build.</p>}
    {g.discovery === "panel" && <button className={button} onClick={g.wirePanel}>Connect panel to base</button>}
    {(["wired", "problem", "charged"].includes(g.discovery)) && <>
      <div className="rounded-lg bg-slate-800 p-3 text-sm">
        <strong>{g.previewDark ? "SUNSET PREVIEW" : "DAYLIGHT"}</strong>
        <p>{g.previewDark ? "Try your design safely. This preview uses no stored energy." : "Watch the cable and the base lamp as the sunlight changes."}</p>
      </div>
      <button className={button} onClick={g.previewDark ? g.restoreDaylight : g.previewSunset}>{g.previewDark ? "Return to daylight" : "Preview sunset"}</button>
    </>}
    {g.discovery === "problem" && <>
      <button className={button} onClick={g.openWorkshop}>Explore building supplies</button>
      {g.workshopOpen && <div className="space-y-3">
        <p className="text-sm">Choose what your new plot needs.</p>
        <button className={button} onClick={() => setIdea("Another panel also needs sunlight. Try switching back to daylight, then preview sunset again. What could save electricity for later?")}>Another solar panel<span className="block text-xs font-normal">Makes electricity while the Sun shines.</span></button>
        <button className={button} onClick={() => setIdea("A cable carries electricity. When the panel stops, there is nothing for it to carry.")}>Longer cable<span className="block text-xs font-normal">Carries electricity between buildings.</span></button>
        <button className={button} onClick={g.buildStorage}>Build battery storage<span className="block text-xs font-normal">Saves spare electricity for later. Starts empty.</span></button>
        <p className="text-sm text-amber-200" role="status">{idea}</p>
      </div>}
    </>}
    {g.discovery === "storage" && <>
      <p>Stored energy: <strong>{g.battery}/6</strong></p>
      <button className={button} onClick={g.baseConnected ? g.chargeStorage : g.connectBase}>{g.baseConnected ? "Collect spare sunlight · +4 stored" : "Connect panel → storage → base"}</button>
    </>}
    {g.discovery === "charged" && <p className="text-amber-200">Stored for the real night: {g.battery}/6 units</p>}
    {g.discovery === "charged" && g.previewDark && <button className={button} onClick={g.finishDiscovery}>It works! Explore the rover →</button>}
    <p className="text-xs text-slate-400">Buildings use the kits delivered with the crew. Time moves only when you choose to test it.</p>
  </aside>;
}
