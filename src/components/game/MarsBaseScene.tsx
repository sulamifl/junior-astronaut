"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGame, type TimeOfDay } from "@/lib/game-store";

/**
 * MarsBaseScene — a playful, game-like cutaway of a Mars base for kids.
 *
 * Design goals (from user feedback):
 *  - Look like a real game, not a website or flat schematic
 *  - Cute, expressive characters that react to events
 *  - Living atmosphere: animated sun rays, drifting dust, glowing windows
 *  - Bright but grounded palette (Mars warmth + cool tech)
 *  - Interactive objects are visually inviting (bouncy hover, glow)
 *  - NASA storm intensity shows as a real animated solar flare mid-sky
 */

function skyStops(tod: TimeOfDay) {
  switch (tod) {
    case "Evening":
      return { from: "#f4b878", mid: "#e89560", to: "#c97050" };
    case "Sunset":
      return { from: "#e89560", mid: "#c95a3e", to: "#7a3a5e" };
    case "Night":
      return { from: "#1a2042", mid: "#2a2858", to: "#3a2a52" };
    case "Dawn":
      return { from: "#e8a878", mid: "#d88858", to: "#a86848" };
  }
}

function terrainColors(tod: TimeOfDay) {
  if (tod === "Night") return { ground: "#7a4830", groundDark: "#5a3018", rock: "#6a3a22", shadow: "#3a1e10" };
  if (tod === "Sunset") return { ground: "#b85a30", groundDark: "#8a3a1e", rock: "#9a4a26", shadow: "#5a2a16" };
  if (tod === "Dawn") return { ground: "#d07a4a", groundDark: "#a05a2e", rock: "#b8683a", shadow: "#7a3a1e" };
  return { ground: "#d07a4a", groundDark: "#a05a2e", rock: "#b8683a", shadow: "#7a3a1e" };
}

export default function MarsBaseScene() {
  const {
    discovery, previewDark, buildPanel, wirePanel, openWorkshop, connectBase, chargeStorage,
    battery,
    batteryMax,
    baseConnected,
    robotStatus,
    timeOfDay,
    phase,
    nightStage,
    stormEvent,
    stormResolved,
    activeTaskId,
    plantGrowth,
    openModal,
  } = useGame();

  const building = discovery !== "ready";
  const panelBuilt = discovery !== "base";
  const storageBuilt = ["storage", "charged", "ready"].includes(discovery);
  const powered = building ? (["wired", "problem", "storage", "charged"].includes(discovery) && (!previewDark || discovery === "charged")) : baseConnected;
  const viewTime = previewDark ? "Night" : timeOfDay;
  const sky = skyStops(viewTime);
  const tc = terrainColors(viewTime);
  const isNight = viewTime === "Night";
  const isSunset = viewTime === "Sunset";
  const showSun = viewTime === "Evening" || isSunset;
  const showMoon = isNight || viewTime === "Dawn";

  const batterySegments = Array.from({ length: batteryMax }, (_, i) => i < battery);
  const roverCharged = robotStatus === "charged";

  const highlightBattery = !building && activeTaskId === "connect-battery";
  const highlightRover = activeTaskId === "plan-rover";
  const highlightSolar = activeTaskId === "top-up";
  const highlightGreenhouse = activeTaskId === "grow-plants";

  const sunX = isSunset ? 110 : 80;
  const sunY = isSunset ? 220 : 130;

  // storm intensity from real NASA data (0..100) -> drives a visible solar flare
  const stormIntensity = stormEvent?.intensity ?? 0;
  const stormVisible = (phase === "night" && stormEvent && !stormResolved) || phase === "storm-decision";

  return (
    <div className="relative w-full h-full overflow-hidden">
      <svg
        viewBox="0 0 1000 560"
        className="w-full h-full block"
        preserveAspectRatio="xMidYMid meet"
        role="group"
        aria-label="Cutaway view of a Mars habitat base"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={sky.from} />
            <stop offset="55%" stopColor={sky.mid} />
            <stop offset="100%" stopColor={sky.to} />
          </linearGradient>
          <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={tc.ground} />
            <stop offset="100%" stopColor={tc.groundDark} />
          </linearGradient>
          <linearGradient id="panelGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3a5a9e" />
            <stop offset="50%" stopColor="#2a4078" />
            <stop offset="100%" stopColor="#1a2c5a" />
          </linearGradient>
          <linearGradient id="habGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f8f4ec" />
            <stop offset="100%" stopColor="#d8d0c2" />
          </linearGradient>
          <linearGradient id="interiorGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isNight ? "#ffd070" : "#ffe8a8"} stopOpacity="0.95" />
            <stop offset="100%" stopColor="#f5a850" stopOpacity="0.4" />
          </linearGradient>
          <radialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#fff4c8" stopOpacity="1" />
            <stop offset="55%" stopColor="#ffc870" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ffa040" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="moonGlow" cx="0.4" cy="0.4" r="0.5">
            <stop offset="0%" stopColor="#fdfcf0" stopOpacity="1" />
            <stop offset="100%" stopColor="#d8d0c0" stopOpacity="0.95" />
          </radialGradient>
          <linearGradient id="domeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a8e8a8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#5aa870" stopOpacity="0.5" />
          </linearGradient>
          <pattern id="panelGrid" width="14" height="20" patternUnits="userSpaceOnUse">
            <rect width="14" height="20" fill="url(#panelGrad)" />
            <path d="M0 0 L14 0 M0 10 L14 10 M7 0 L7 20" stroke="#6a8abe" strokeWidth="0.6" opacity="0.6" />
          </pattern>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#2a0c08" floodOpacity="0.4" />
          </filter>
          <filter id="highlight" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feFlood floodColor="#fbbf24" floodOpacity="0.9" />
            <feComposite in2="b" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Sky */}
        <rect width="1000" height="560" fill="url(#skyGrad)" />

        {/* Drifting dust particles (daytime) */}
        {!isNight && (
          <g opacity="0.5">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <circle key={i} cx={(i * 137) % 1000} cy={120 + (i * 53) % 200} r="1.5" fill="#ffe8c8">
                <animate
                  attributeName="cx"
                  values={`${(i * 137) % 1000};${((i * 137) % 1000) + 60};${(i * 137) % 1000}`}
                  dur={`${8 + i}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="cy"
                  values={`${120 + (i * 53) % 200};${130 + (i * 53) % 200};${120 + (i * 53) % 200}`}
                  dur={`${4 + i}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ))}
          </g>
        )}

        {/* Stars at night */}
        {isNight && (
          <g opacity="0.9">
            {STARS.map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fdfcf0" opacity={s.o}>
                <animate
                  attributeName="opacity"
                  values={`${s.o};${s.o * 0.3};${s.o}`}
                  dur={`${2 + (i % 5)}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ))}
          </g>
        )}

        {/* Distant mesas (parallax) */}
        <g opacity="0.8">
          <path d="M0 360 L70 320 L150 348 L220 300 L300 340 L0 380 Z" fill={tc.rock} opacity="0.55" />
          <path d="M300 340 L380 296 L460 330 L560 290 L680 332 L300 372 Z" fill={tc.rock} opacity="0.7" />
          <path d="M680 332 L780 296 L880 330 L1000 300 L1000 380 L680 380 Z" fill={tc.rock} opacity="0.6" />
        </g>

        {/* Sun with animated rays */}
        {showSun && (
          <g>
            <circle cx={sunX} cy={sunY} r="75" fill="url(#sunGlow)" />
            {/* animated rays */}
            <g opacity="0.5">
              {Array.from({ length: 8 }, (_, i) => {
                const a = (i / 8) * Math.PI * 2;
                const x1 = sunX + Math.cos(a) * 38;
                const y1 = sunY + Math.sin(a) * 38;
                const x2 = sunX + Math.cos(a) * 60;
                const y2 = sunY + Math.sin(a) * 60;
                return (
                  <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffe490" strokeWidth="3" strokeLinecap="round">
                    <animate
                      attributeName="opacity"
                      values="0.3;0.9;0.3"
                      dur="2s"
                      begin={`${i * 0.25}s`}
                      repeatCount="indefinite"
                    />
                  </line>
                );
              })}
            </g>
            <circle cx={sunX} cy={sunY} r="28" fill="#ffe9a8" />
            <circle cx={sunX} cy={sunY} r="18" fill="#fff5d0" />
            {/* cute sun face */}
            <circle cx={sunX - 8} cy={sunY - 4} r="2.5" fill="#c97030" />
            <circle cx={sunX + 8} cy={sunY - 4} r="2.5" fill="#c97030" />
            <path d={`M${sunX - 7} ${sunY + 4} q7 7 14 0`} stroke="#c97030" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        )}

        {/* Moon */}
        {showMoon && (
          <g>
            <circle cx="840" cy="105" r="22" fill="url(#moonGlow)" />
            <circle cx="832" cy="99" r="4" fill="#b8b0a0" opacity="0.5" />
            <circle cx="846" cy="113" r="3" fill="#b8b0a0" opacity="0.4" />
            {/* moon face */}
            <circle cx="834" cy="100" r="1.5" fill="#9a9080" />
            <circle cx="846" cy="100" r="1.5" fill="#9a9080" />
            <path d="M834 110 q6 4 12 0" stroke="#9a9080" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <circle cx="170" cy="85" r="12" fill="#e8e2cc" opacity="0.85" />
          </g>
        )}

        {/* SOLAR STORM — animated flare driven by real NASA intensity */}
        {stormVisible && (
          <g>
            {/* big fiery corona top-right */}
            <motion.g
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <circle cx="860" cy="70" r={20 + stormIntensity * 0.4} fill="#ff5a2a" opacity="0.6" />
              <circle cx="860" cy="70" r={14 + stormIntensity * 0.25} fill="#ff8a3a" opacity="0.85" />
              <circle cx="860" cy="70" r="10" fill="#ffd070" />
              {/* angry face */}
              <line x1="852" y1="64" x2="856" y2="68" stroke="#5a1010" strokeWidth="2" strokeLinecap="round" />
              <line x1="856" y1="64" x2="852" y2="68" stroke="#5a1010" strokeWidth="2" strokeLinecap="round" />
              <line x1="864" y1="64" x2="868" y2="68" stroke="#5a1010" strokeWidth="2" strokeLinecap="round" />
              <line x1="868" y1="64" x2="864" y2="68" stroke="#5a1010" strokeWidth="2" strokeLinecap="round" />
              <path d="M853 76 q7 -4 14 0" stroke="#5a1010" strokeWidth="2" fill="none" strokeLinecap="round" />
              {/* radiation particles flying toward base */}
              {Array.from({ length: 6 }, (_, i) => {
                const angle = Math.PI / 2 + (i - 2.5) * 0.25;
                return (
                  <circle key={i} cx="860" cy="70" r="2.5" fill="#ffd070">
                    <animate
                      attributeName="cx"
                      values="860;600"
                      dur={`${1.5 + i * 0.2}s`}
                      begin={`${i * 0.15}s`}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="cy"
                      values="70;380"
                      dur={`${1.5 + i * 0.2}s`}
                      begin={`${i * 0.15}s`}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="1;0.2"
                      dur={`${1.5 + i * 0.2}s`}
                      begin={`${i * 0.15}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                );
              })}
            </motion.g>
          </g>
        )}

        {/* Ground */}
        <path d="M0 402 L1000 384 L1000 560 L0 560 Z" fill="url(#groundGrad)" />
        <g fill={tc.shadow} opacity="0.65">
          <ellipse cx="120" cy="472" rx="46" ry="14" />
          <ellipse cx="780" cy="492" rx="62" ry="16" />
          <ellipse cx="420" cy="512" rx="82" ry="18" />
        </g>
        <g fill={tc.rock}>
          <path d="M70 458 q20 -22 42 -6 q14 10 6 22 z" />
          <path d="M820 478 q26 -20 48 -2 q10 12 2 22 z" />
          <path d="M560 504 q30 -24 56 -4 q12 14 2 26 z" />
        </g>

        {panelBuilt && <>
{/* ===== Solar panels (left) ===== */}
        <motion.g
          className="cursor-pointer"
          role="button" tabIndex={0} aria-label="Solar panel" onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.currentTarget.dispatchEvent(new MouseEvent("click", { bubbles: true })); } }}
          onClick={() => building ? wirePanel() : openModal("solar")}
          filter={highlightSolar ? "url(#highlight)" : undefined}
          whileHover={{ scale: 1.04 }}
          style={{ transformOrigin: "220px 360px" }}
        >
          <rect x="178" y="362" width="6" height="50" fill="#7a6a4a" />
          <rect x="248" y="362" width="6" height="50" fill="#7a6a4a" />
          <g transform="rotate(-18 220 360)" filter="url(#softShadow)">
            <rect x="150" y="338" width="140" height="44" rx="4" fill="url(#panelGrid)" stroke="#7a9ace" strokeWidth="1.5" />
            <rect x="150" y="338" width="140" height="6" fill="#aeb8d8" opacity="0.5" />
          </g>
          <g transform="rotate(-18 270 350)" filter="url(#softShadow)">
            <rect x="200" y="300" width="140" height="44" rx="4" fill="url(#panelGrid)" stroke="#7a9ace" strokeWidth="1.5" />
            <rect x="200" y="300" width="140" height="6" fill="#aeb8d8" opacity="0.5" />
          </g>
          {/* bouncing label tag */}
          {highlightSolar && (
            <motion.g
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <rect x="184" y="306" width="78" height="20" rx="10" fill="#fbbf24" />
              <text x="223" y="320" textAnchor="middle" fontSize="10" fill="#1a1a1a" fontWeight="800">
                TAP ME!
              </text>
            </motion.g>
          )}
        </motion.g>

        </>}

        {storageBuilt && <>
{/* Energy cable solar -> battery */}
        <path
          d="M300 358 Q 330 396 380 408"
          stroke={(showSun && baseConnected) ? "#ffd07a" : "#6a5a4a"}
          strokeWidth="3"
          strokeDasharray="6 6"
          fill="none"
          opacity={(showSun && baseConnected) ? 0.85 : 0.5}
        >
          {showSun && baseConnected && (
            <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="1.2s" repeatCount="indefinite" />
          )}
        </path>

        </>}

        {storageBuilt && <>
{/* ===== Battery (left-center) — cute robot-battery ===== */}
        <motion.g
          className="cursor-pointer"
          role="button" tabIndex={0} aria-label="Battery storage" onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.currentTarget.dispatchEvent(new MouseEvent("click", { bubbles: true })); } }}
          onClick={() => building ? (baseConnected ? chargeStorage() : connectBase()) : openModal("battery")}
          filter={highlightBattery ? "url(#highlight)" : undefined}
          whileHover={{ scale: 1.04 }}
          style={{ transformOrigin: "402px 408px" }}
        >
          <g filter="url(#softShadow)">
            <rect x="358" y="370" width="88" height="78" rx="10" fill="#5a5e68" />
            <rect x="358" y="370" width="88" height="16" rx="10" fill="#3a3e48" />
            <rect x="392" y="360" width="20" height="12" rx="3" fill="#7a7e88" />
            {/* segment display */}
            {batterySegments.map((on, i) => (
              <rect
                key={i}
                x={366 + i * 13}
                y={392}
                width="10"
                height="42"
                rx="2"
                fill={on ? "#ffc24a" : "#2a2e38"}
                stroke={on ? "#ffd870" : "#222"}
                strokeWidth="0.8"
              >
                {on && (
                  <animate
                    attributeName="opacity"
                    values="1;0.75;1"
                    dur="2s"
                    begin={`${i * 0.2}s`}
                    repeatCount="indefinite"
                  />
                )}
              </rect>
            ))}
            {/* cute battery face */}
            <circle cx="392" cy="380" r="2.5" fill="#1a1a1a" />
            <circle cx="412" cy="380" r="2.5" fill="#1a1a1a" />
            <path d="M390 384 q6 4 12 0" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </g>
          {highlightBattery && (
            <motion.g
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <rect x="368" y="318" width="68" height="20" rx="10" fill="#fbbf24" />
              <text x="402" y="332" textAnchor="middle" fontSize="10" fill="#1a1a1a" fontWeight="800">
                TAP ME!
              </text>
            </motion.g>
          )}
        </motion.g>

        </>}

        {storageBuilt && <>
{/* Connection cable battery -> habitat */}
        <path
          d="M446 408 Q 470 408 488 410"
          stroke={baseConnected && powered ? "#5aba6a" : "#6a5a4a"}
          strokeWidth="4"
          strokeDasharray="6 6"
          fill="none"
        >
          {baseConnected && powered && (
            <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="1.1s" repeatCount="indefinite" />
          )}
        </path>

        </>}

        {panelBuilt && (!storageBuilt || !baseConnected) && <path d="M300 358 Q 380 460 488 410" fill="none" stroke={baseConnected && powered ? "#74ed96" : "#655a55"} strokeWidth="5" strokeDasharray="8 5">
          {powered && <animate attributeName="stroke-dashoffset" from="0" to="-26" dur="1s" repeatCount="indefinite" />}
        </path>}
        {discovery === "base" && <g role="button" tabIndex={0} aria-label="Build solar panel" onClick={buildPanel} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); buildPanel(); } }} className="cursor-pointer">
          <rect x="150" y="330" width="190" height="70" rx="12" fill="#263a45" stroke="#ffe092" strokeWidth="3" strokeDasharray="7 4" />
          <text x="245" y="360" textAnchor="middle" fill="white" fontSize="18">+ Solar panel</text>
          <text x="245" y="383" textAnchor="middle" fill="#ffe092" fontSize="13">Build from landing supplies</text>
        </g>}
        {discovery === "problem" && <g role="button" tabIndex={0} aria-label="Open build site" onClick={openWorkshop} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openWorkshop(); } }} className="cursor-pointer">
          <rect x="345" y="365" width="110" height="85" rx="10" fill="#263a45" stroke="#ffe092" strokeDasharray="7 4" />
          <text x="400" y="405" textAnchor="middle" fill="white" fontSize="18">+ Build</text>
        </g>}
        <g><rect x="490" y="230" width="220" height="40" rx="12" fill="#172a38" /><text x="600" y="255" textAnchor="middle" fill={powered ? "#8af3aa" : "#ffce87"} fontSize="15">{powered ? "Lamp ON · Fan running" : "Lamp OFF · Fan stopped"}</text></g>
        {/* ===== Habitat module (center) — cutaway with crew ===== */}
        <g filter="url(#softShadow)">
          <rect x="486" y="312" width="224" height="100" rx="36" fill="url(#habGrad)" stroke="#b0a89a" strokeWidth="2" />
          {/* panel lines */}
          <line x1="540" y1="312" x2="540" y2="412" stroke="#c0b8a8" strokeWidth="0.8" opacity="0.4" />
          <line x1="656" y1="312" x2="656" y2="412" stroke="#c0b8a8" strokeWidth="0.8" opacity="0.4" />
          {/* cutaway window */}
          <rect x="508" y="328" width="182" height="68" rx="10" fill={isNight ? "#1a1208" : "#3a2418"} />
          <rect x="508" y="328" width="182" height="68" rx="10" fill={powered ? "url(#interiorGlow)" : "#283641"} opacity={isNight ? 0.92 : 0.65} />
          <line x1="508" y1="374" x2="690" y2="374" stroke="#b8744a" strokeWidth="1.5" opacity="0.5" />
          {/* interior: desk + shelf */}
          <rect x="518" y="366" width="44" height="9" fill="#7a5a3a" opacity="0.85" />
          <rect x="664" y="336" width="16" height="32" fill="#7a5a3a" opacity="0.7" />

          {/* ===== CUTE ANIMATED CREW ===== */}
          {/* Crew 1: at desk (working/typing) */}
          <g>
            <motion.g
              animate={{ y: [0, -1.5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <circle cx="538" cy="352" r="7" fill="#f0c090" />
              {/* helmet */}
              <path d="M531 350 q7 -8 14 0 v4 q-7 -3 -14 0 z" fill="#5a8abe" opacity="0.8" />
              <circle cx="535" cy="352" r="1.5" fill="#1a1a1a" />
              <circle cx="541" cy="352" r="1.5" fill="#1a1a1a" />
              <path d="M535 356 q3 2 6 0" stroke="#1a1a1a" strokeWidth="0.8" fill="none" strokeLinecap="round" />
              <path d="M530 362 q8 -4 16 0 v14 h-16 z" fill="#e85a3a" />
            </motion.g>
          </g>
          {/* Crew 2: standing (waving) */}
          <g>
            <motion.g
              animate={{ rotate: [0, 8, 0] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              style={{ transformOrigin: "582px 358px" }}
            >
              <circle cx="582" cy="346" r="7" fill="#f0c090" />
              <path d="M575 344 q7 -8 14 0 v4 q-7 -3 -14 0 z" fill="#5aa8c0" opacity="0.8" />
              <circle cx="579" cy="346" r="1.5" fill="#1a1a1a" />
              <circle cx="585" cy="346" r="1.5" fill="#1a1a1a" />
              <path d="M579 350 q3 2 6 0" stroke="#1a1a1a" strokeWidth="0.8" fill="none" strokeLinecap="round" />
              <path d="M575 356 q7 -4 14 0 v22 h-14 z" fill="#e8a82a" />
              {/* waving arm */}
              <line x1="588" y1="362" x2="596" y2="350" stroke="#f0c090" strokeWidth="2.5" strokeLinecap="round" />
            </motion.g>
          </g>
          {/* Crew 3: sitting */}
          <g>
            <motion.g
              animate={{ y: [0, 1, 0] }}
              transition={{ duration: 2.4, repeat: Infinity }}
            >
              <circle cx="610" cy="352" r="7" fill="#f0c090" />
              <path d="M603 350 q7 -8 14 0 v4 q-7 -3 -14 0 z" fill="#7a5aa0" opacity="0.8" />
              <circle cx="607" cy="352" r="1.5" fill="#1a1a1a" />
              <circle cx="613" cy="352" r="1.5" fill="#1a1a1a" />
              <path d="M607 356 q3 2 6 0" stroke="#1a1a1a" strokeWidth="0.8" fill="none" strokeLinecap="round" />
              <path d="M604 360 q7 -4 14 0 v18 h-14 z" fill="#5aa870" />
            </motion.g>
          </g>
          {/* Crew 4: kid (smaller) */}
          <g>
            <motion.g
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            >
              <circle cx="640" cy="358" r="5.5" fill="#f0c090" />
              <path d="M634 357 q6 -7 12 0 v3 q-6 -2 -12 0 z" fill="#d85a8a" opacity="0.85" />
              <circle cx="637" cy="358" r="1.2" fill="#1a1a1a" />
              <circle cx="642" cy="358" r="1.2" fill="#1a1a1a" />
              <path d="M637 361 q2.5 1.5 5 0" stroke="#1a1a1a" strokeWidth="0.7" fill="none" strokeLinecap="round" />
              <path d="M634 364 q6 -3 12 0 v14 h-12 z" fill="#c84a4a" />
            </motion.g>
          </g>

          <g transform="translate(675 345)">
            <circle r="10" fill="#23323d" stroke="#92a5aa" />
            <g><path d="M0 -8 Q8 -7 2 0 Q8 8 0 2 Q-8 8 -2 0 Q-8 -8 0 -2Z" fill="#b1c7c9" />
              {powered && <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="1s" repeatCount="indefinite" />}
            </g>
          </g>
          {/* warm lamp */}
          <circle cx="598" cy="336" r="5" fill="#ffe39a" opacity={powered ? 1 : 0.08}>
            {isNight && <animate attributeName="opacity" values="1;0.7;1" dur="3s" repeatCount="indefinite" />}
          </circle>
          {/* window frame */}
          <rect x="508" y="328" width="182" height="68" rx="10" fill="none" stroke="#c8b8a0" strokeWidth="3" opacity="0.7" />
          {/* antenna */}
          <line x1="600" y1="312" x2="600" y2="280" stroke="#9a9088" strokeWidth="2.5" />
          <circle cx="600" cy="278" r="5" fill="#c8b8a0" />
          <path d="M592 282 q8 -8 16 0" stroke="#9a9088" strokeWidth="1.5" fill="none" />
          {/* status badge */}
          {powered && (
            <motion.g
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <rect x="640" y="288" width="62" height="20" rx="10" fill="#3a9a5a" />
              <circle cx="650" cy="298" r="3.5" fill="#aaffaa">
                <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
              </circle>
              <text x="688" y="302" textAnchor="end" fontSize="9" fill="#eafff0" fontWeight="800">
                READY!
              </text>
            </motion.g>
          )}
        </g>

        {(phase === "greenhouse" || phase === "quiz") && <>
{/* ===== Greenhouse dome (right) — interactive, plants grow ===== */}
        <motion.g
          className="cursor-pointer"
          onClick={() => openModal("greenhouse")}
          filter={highlightGreenhouse ? "url(#highlight)" : undefined}
          whileHover={{ scale: 1.03 }}
          style={{ transformOrigin: "762px 388px" }}
        >
          <g filter="url(#softShadow)">
            <path d="M712 388 q0 -52 52 -52 q52 0 52 52 z" fill="url(#domeGrad)" stroke="#bfe0c0" strokeWidth="2" />
            <path d="M712 388 q0 -52 52 -52 q52 0 52 50" fill="none" stroke="#cdeed0" strokeWidth="1.5" opacity="0.7" />
            <path d="M762 336 v52 M712 360 h104 M730 344 q34 -14 68 0" fill="none" stroke="#cdeed0" strokeWidth="1.2" opacity="0.6" />
            {/* plants — taller as they grow */}
            {[
              { cx: 730, base: 372, h: 6 + plantGrowth * 0.18 },
              { cx: 746, base: 368, h: 7 + plantGrowth * 0.22 },
              { cx: 762, base: 370, h: 8 + plantGrowth * 0.25 },
              { cx: 782, base: 368, h: 6 + plantGrowth * 0.20 },
              { cx: 800, base: 372, h: 7 + plantGrowth * 0.18 },
            ].map((p, i) => (
              <g key={i}>
                <rect x={p.cx - 1} y={p.base - p.h} width="2" height={p.h} fill="#4a7a3a" />
                <circle cx={p.cx} cy={p.base - p.h} r={3 + plantGrowth * 0.04} fill={plantGrowth > 50 ? "#5aba5a" : "#6a9a4a"} />
                {plantGrowth > 70 && (
                  <circle cx={p.cx - 2} cy={p.base - p.h - 2} r="2" fill="#ff8a8a" />
                )}
              </g>
            ))}
            <rect x="712" y="386" width="104" height="6" fill="#7a6a5a" />
          </g>
          {highlightGreenhouse && (
            <motion.g
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <rect x="728" y="318" width="68" height="20" rx="10" fill="#fbbf24" />
              <text x="762" y="332" textAnchor="middle" fontSize="10" fill="#1a1a1a" fontWeight="800">
                GROW!
              </text>
            </motion.g>
          )}
        </motion.g>

        </>}

        {!building && <>
{/* ===== Airlock ===== */}
        <g filter="url(#softShadow)">
          <rect x="826" y="358" width="58" height="56" rx="14" fill="url(#habGrad)" stroke="#b0a89a" strokeWidth="2" />
          <rect x="836" y="372" width="38" height="40" rx="8" fill="#7aa0c8" opacity="0.9" />
          <circle cx="855" cy="392" r="5" fill="#3a5a78" />
          <path d="M850 392 h10" stroke="#9ac0e0" strokeWidth="2" />
        </g>

        </>}

        {!building && <>
{/* ===== Rover (far right) — cute mascot robot ===== */}
        <motion.g
          className="cursor-pointer"
          role="button" tabIndex={0} aria-label="Scout rover" onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.currentTarget.dispatchEvent(new MouseEvent("click", { bubbles: true })); } }}
          onClick={() => openModal("robot")}
          filter={highlightRover ? "url(#highlight)" : undefined}
          whileHover={{ scale: 1.05 }}
          style={{ transformOrigin: "937px 450px" }}
          animate={roverCharged ? { y: [0, -3, 0] } : {}}
          transition={roverCharged ? { duration: 1.5, repeat: Infinity } : {}}
        >
          <g filter="url(#softShadow)">
            <rect x="900" y="438" width="74" height="26" rx="8" fill="#e8e2d4" stroke="#9a9088" strokeWidth="1.5" />
            {/* cute camera head with face */}
            <rect x="918" y="424" width="36" height="16" rx="5" fill="#3a3e48" />
            {/* eyes glowing */}
            <circle cx="928" cy="432" r="3.5" fill="#6fe0e8">
              <animate attributeName="r" values="3.5;2.8;3.5" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="944" cy="432" r="3.5" fill="#6fe0e8">
              <animate attributeName="r" values="3.5;2.8;3.5" dur="2s" begin="0.5s" repeatCount="indefinite" />
            </circle>
            {/* happy mouth when charged */}
            {roverCharged && (
              <path d="M932 438 q4 3 8 0" stroke="#6fe0e8" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            )}
            {/* antenna */}
            <line x1="958" y1="438" x2="966" y2="420" stroke="#9a9088" strokeWidth="1.5" />
            <circle cx="966" cy="420" r="2" fill="#ff5a5a">
              <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
            </circle>
            {/* wheels */}
            <circle cx="908" cy="468" r="9" fill="#1a1e22" />
            <circle cx="908" cy="468" r="3.5" fill="#ff9a2a" />
            <circle cx="936" cy="468" r="9" fill="#1a1e22" />
            <circle cx="936" cy="468" r="3.5" fill="#ff9a2a" />
            <circle cx="962" cy="468" r="9" fill="#1a1e22" />
            <circle cx="962" cy="468" r="3.5" fill="#ff9a2a" />
          </g>
          {/* status badge */}
          {roverCharged && (
            <motion.g
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <circle cx="970" cy="422" r="9" fill="#3a9a5a" />
              <path d="M966 422 l3 3 l5 -6" stroke="#eafff0" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </motion.g>
          )}
          {!roverCharged && robotStatus !== "charge-in-morning" && (
            <g>
              <circle cx="970" cy="422" r="9" fill="#c84a2a" opacity="0.9" />
              <text x="970" y="426" textAnchor="middle" fontSize="11" fill="#fff" fontWeight="900">!</text>
            </g>
          )}
          {robotStatus === "charge-in-morning" && (
            <g>
              <circle cx="970" cy="422" r="9" fill="#d8a82a" />
              <path d="M970 418 v-3 M970 426 v3 M966 422 h-3 M974 422 h3" stroke="#fff" strokeWidth="1.5" />
            </g>
          )}
          {highlightRover && (
            <motion.g
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <rect x="853" y="408" width="68" height="20" rx="10" fill="#fbbf24" />
              <text x="887" y="422" textAnchor="middle" fontSize="10" fill="#1a1a1a" fontWeight="800">
                TAP ME!
              </text>
            </motion.g>
          )}
        </motion.g>

        </>}

        {/* Night progress badge */}
        {isNight && phase === "night" && (
          <g>
            <rect x="30" y="30" width="180" height="40" rx="20" fill="#1a1a2e" opacity="0.9" />
            <text x="42" y="50" fontSize="10" fill="#8a9098" fontWeight="700" letterSpacing="1">
              NIGHT PHASE
            </text>
            <text x="190" y="58" textAnchor="end" fontSize="18" fill="#ffc870" fontWeight="800" fontFamily="monospace">
              {Math.min(nightStage + 1, 4)}/4
            </text>
          </g>
        )}
      </svg>

      {/* Sunset waiting overlay */}
      <AnimatePresence>
        {phase === "sunset-wait" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="px-6 py-3 rounded-full bg-amber-500/95 text-white font-black text-sm shadow-2xl flex items-center gap-2"
            >
              <span className="text-xl">☀</span> SUNSET CHARGING · +2 ENERGY
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const STARS = [
  { x: 80, y: 60, r: 1.4, o: 0.9 },
  { x: 180, y: 40, r: 1.1, o: 0.7 },
  { x: 260, y: 90, r: 1.6, o: 1 },
  { x: 340, y: 50, r: 1, o: 0.6 },
  { x: 430, y: 80, r: 1.3, o: 0.85 },
  { x: 520, y: 36, r: 1.5, o: 0.95 },
  { x: 600, y: 70, r: 1, o: 0.55 },
  { x: 690, y: 48, r: 1.4, o: 0.8 },
  { x: 780, y: 90, r: 1.2, o: 0.75 },
  { x: 120, y: 130, r: 1, o: 0.5 },
  { x: 240, y: 160, r: 1.3, o: 0.7 },
  { x: 470, y: 140, r: 1, o: 0.6 },
  { x: 620, y: 170, r: 1.5, o: 0.85 },
  { x: 740, y: 150, r: 1.1, o: 0.65 },
  { x: 60, y: 200, r: 1, o: 0.5 },
  { x: 300, y: 220, r: 0.9, o: 0.45 },
];
