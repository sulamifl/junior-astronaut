"use client";

import { create } from "zustand";

/**
 * Game state for "Mars Base Commander — First Night".
 *
 * Key NASA integrations driving real gameplay (not just links):
 *  - DONKI: storm intensity (0..100) derived from REAL CME speed / flare class.
 *    Drives a countdown timer and radiation risk in the storm minigame.
 *  - RAD: Curiosity surface reference (~0.67 mSv/day) feeds a live radiation meter
 *    that reacts to the player's shelter decision.
 *  - OSDR: plant-growth minigame references real Arabidopsis/gravimetry experiments.
 *  - NASA-STD-3001: water-shielding recommendation (10 g/cm²) sets the shelter bonus.
 */

export type Phase =
  | "intro"
  | "evening"
  | "sunset-wait"
  | "plan-check"
  | "storm-decision"
  | "night"
  | "greenhouse"
  | "dawn"
  | "quiz"
  | "complete";

export type TimeOfDay = "Evening" | "Sunset" | "Night" | "Dawn";
export type RobotStatus = "uncharged" | "charged" | "charge-in-morning";
export type BaseStatus = "disconnected" | "ready" | "low-power";
export type Modal = null | "battery" | "robot" | "solar" | "storm" | "plan" | "science" | "greenhouse";

export type StormEventData = {
  id: string;
  kind: "CME" | "FLR" | "SEP";
  startTime: string;
  classType?: string;
  speedKmS?: number;
  sourceLocation?: string;
  note?: string;
  isReal: boolean;
  sourceUrl: string;
  source: string;
  intensity: number; // 0..100 from real NASA data
  hoursToImpact?: number;
  summary: string;
};

export type StormChoice = "none" | "shelter" | "ignore";
export type QuizAnswer = "battery" | "panels" | "antenna" | null;

export type TaskId =
  | "connect-battery"
  | "plan-rover"
  | "top-up"
  | "check-plan"
  | "survive-night"
  | "handle-storm"
  | "grow-plants"
  | "complete";

export type TaskState = "pending" | "active" | "done" | "skipped";
export type MissionTask = { id: TaskId; label: string; hint: string; state: TaskState };

export type Badge = "first-night" | "shelter-pro" | "green-thumb" | "speed-runner" | "nasa-scientist";

export type DiscoveryStage = "base" | "panel" | "wired" | "problem" | "storage" | "charged" | "ready";

export interface GameState {
  discovery: DiscoveryStage;
  previewDark: boolean;
  workshopOpen: boolean;
  buildPanel: () => void;
  wirePanel: () => void;
  previewSunset: () => void;
  restoreDaylight: () => void;
  openWorkshop: () => void;
  buildStorage: () => void;
  chargeStorage: () => void;
  finishDiscovery: () => void;
  // resources
  battery: number;
  batteryMax: number;
  water: number;
  air: number;
  crew: number;
  radiationLevel: number; // mSv/day, Curiosity RAD reference = 0.67

  // planning
  baseConnected: boolean;
  eveningRefillUsed: boolean;
  robotStatus: RobotStatus;
  baseStatus: BaseStatus;

  // night
  nightStage: number;
  nightPaused: boolean;
  nightEnergyUsed: number;

  // storm (NASA-integrated)
  stormEvent: StormEventData | null;
  stormChoice: StormChoice;
  stormResolved: boolean;
  stormCountdown: number; // seconds to impact (UI timer)
  stormShieldStrength: number; // 0..100 water shielding built by player

  // greenhouse (OSDR-integrated plant growth minigame)
  plantGrowth: number; // 0..100
  plantWatered: boolean;
  plantLightOn: boolean;

  // flow
  phase: Phase;
  timeOfDay: TimeOfDay;
  modal: Modal;
  assistantText: string;
  tasks: MissionTask[];
  activeTaskId: TaskId | null;

  // quiz + score
  quizAnswer: QuizAnswer;
  quizRetries: number;
  quizDone: boolean;
  score: number;
  badges: Badge[];

  // provenance
  donkiSource: string;
  donkiMessage: string;

  // actions
  setPhase: (p: Phase) => void;
  setTimeOfDay: (t: TimeOfDay) => void;
  openModal: (m: Exclude<Modal, null>) => void;
  closeModal: () => void;
  setAssistant: (t: string) => void;
  setBattery: (n: number) => void;
  connectBase: () => void;
  chargeRobotNow: () => void;
  chargeRobotMorning: () => void;
  waitSunset: () => void;
  startPlanCheck: () => void;
  beginNight: () => void;
  advanceNight: () => void;
  toggleNightPause: () => void;
  setStormEvent: (e: StormEventData) => void;
  tickStorm: () => void;
  buildShield: (amount: number) => void;
  resolveStorm: (choice: StormChoice) => void;
  deferGreenhouse: () => void;
  startGreenhouse: () => void;
  waterPlant: () => void;
  togglePlantLight: () => void;
  growPlantTick: () => void;
  submitQuiz: (a: Exclude<QuizAnswer, null>) => void;
  restart: () => void;
  initFromDonki: (payload: { source: string; message: string; events: StormEventData[] }) => void;
}

const INITIAL_TASKS: MissionTask[] = [
  {
    id: "connect-battery",
    label: "Connect battery to base",
    hint: "Tap the battery, then connect it so the base can draw power at night.",
    state: "active",
  },
  {
    id: "plan-rover",
    label: "Plan rover charging",
    hint: "Tap the rover and choose: charge now or in the morning.",
    state: "pending",
  },
  {
    id: "top-up",
    label: "Top up at sunset",
    hint: "You charged the rover from the battery. Tap the solar panels to refill before night.",
    state: "pending",
  },
  {
    id: "check-plan",
    label: "Check your plan",
    hint: "Review the checklist, then start the night.",
    state: "pending",
  },
  {
    id: "survive-night",
    label: "Survive the night",
    hint: "Watch the battery power the base through 4 night stages.",
    state: "pending",
  },
  {
    id: "handle-storm",
    label: "Handle the solar storm",
    hint: "A practice storm! Stack sealed water tanks, then move the crew into shelter. The water stays in the tanks.",
    state: "pending",
  },
  {
    id: "grow-plants",
    label: "Grow plants in the greenhouse",
    hint: "Grow fresh food for the crew. Plants need water and light powered by electricity.",
    state: "pending",
  },
  {
    id: "complete",
    label: "Review what you learned",
    hint: "Answer the final question to finish the mission.",
    state: "pending",
  },
];

const INITIAL = {
  discovery: "base" as DiscoveryStage,
  previewDark: false,
  workshopOpen: false,
  battery: 0,
  batteryMax: 6,
  water: 100,
  air: 100,
  crew: 4,
  radiationLevel: 0,
  baseConnected: false,
  eveningRefillUsed: false,
  robotStatus: "uncharged" as RobotStatus,
  baseStatus: "disconnected" as BaseStatus,
  nightStage: 0,
  nightPaused: false,
  nightEnergyUsed: 0,
  stormEvent: null as StormEventData | null,
  stormChoice: "none" as StormChoice,
  stormResolved: false,
  stormCountdown: 30,
  stormShieldStrength: 0,
  plantGrowth: 0,
  plantWatered: false,
  plantLightOn: false,
  phase: "evening" as Phase,
  timeOfDay: "Evening" as TimeOfDay,
  modal: null as Modal,
  assistantText: "",
  tasks: INITIAL_TASKS.map((t) => ({ ...t })),
  activeTaskId: "connect-battery" as TaskId | null,
  quizAnswer: null as QuizAnswer,
  quizRetries: 0,
  quizDone: false,
  score: 0,
  badges: [] as Badge[],
  donkiSource: "",
  donkiMessage: "",
};

function updateTasks(tasks: MissionTask[], doneId: TaskId, nextId?: TaskId): MissionTask[] {
  return tasks.map((t) => {
    if (t.id === doneId) return { ...t, state: "done" };
    if (t.id === nextId) return { ...t, state: "active" };
    return t;
  });
}

export const useGame = create<GameState>((set, get) => ({
  ...INITIAL,

  buildPanel: () => {
    if (get().discovery !== "base") return;
    set({ discovery: "panel", assistantText: "The panel catches sunlight. Its cable still needs a home." });
  },
  wirePanel: () => {
    if (get().discovery !== "panel") return;
    set({ discovery: "wired", assistantText: "The fan is turning and the lamp is on. What happens when the sunlight goes away?" });
  },
  previewSunset: () => {
    const s = get();
    if (!["wired", "problem", "charged"].includes(s.discovery)) return;
    set({ previewDark: true, discovery: s.discovery === "charged" ? "charged" : "problem", assistantText: s.discovery === "charged" ? "The panel stopped, but the lamp is still on. Follow the electricity from your storage to the base!" : "The panel stopped. The lamp and fan have no electricity. How could we keep some daytime energy for later?" });
  },
  restoreDaylight: () => set({ previewDark: false }),
  openWorkshop: () => set({ workshopOpen: true }),
  buildStorage: () => {
    if (get().discovery !== "problem") return;
    set({ discovery: "storage", previewDark: false, workshopOpen: false, battery: 0, baseConnected: false, assistantText: "Your battery is empty. Connect it between the panel and the base, then collect spare sunlight." });
  },
  chargeStorage: () => {
    const s = get();
    if (s.discovery !== "storage" || !s.baseConnected) return;
    set({ discovery: "charged", battery: 4, assistantText: "Four units saved while the panel powers the base. Try sunset again and watch the cable." });
  },
  finishDiscovery: () => {
    const s = get();
    if (s.discovery !== "charged" || !s.previewDark) return;
    set({ discovery: "ready", previewDark: false, tasks: updateTasks(s.tasks, "connect-battery", "plan-rover"), activeTaskId: "plan-rover", assistantText: "Your base has power for the night. A rover has arrived to explore rocks. Open it to plan its charge." });
  },

  setPhase: (p) => set({ phase: p }),
  setTimeOfDay: (t) => set({ timeOfDay: t }),
  openModal: (m) => {
    if (get().discovery !== "ready") return;
    if (m === "greenhouse" && get().phase !== "greenhouse") {
      set({ assistantText: "First keep the crew warm through the night. We will grow food after sunrise." });
      return;
    }
    set({ modal: m });
  },
  closeModal: () => set({ modal: null }),
  setAssistant: (t) => set({ assistantText: t }),
  setBattery: (n) => set((s) => ({ battery: Math.max(0, Math.min(s.batteryMax, n)) })),

  connectBase: () => {
    const s = get();
    if (s.baseConnected) return;
    if (s.discovery === "storage") {
      set({ baseConnected: true, assistantText: "Cable connected. Now store spare sunlight in the empty battery." });
      return;
    }
    set({
      baseConnected: true,
      baseStatus: s.battery >= 4 ? "ready" : "low-power",
      modal: null,
      score: s.score + 100,
      assistantText: "Power cable connected! The base will draw electricity from the battery after sunset.",
      tasks: updateTasks(s.tasks, "connect-battery", "plan-rover"),
      activeTaskId: "plan-rover",
    });
  },

  chargeRobotNow: () => {
    const s = get();
    if (s.robotStatus !== "uncharged" || s.phase !== "evening" || !s.baseConnected) return;
    const newBattery = Math.max(0, s.battery - 2);
    set({
      battery: newBattery,
      robotStatus: "charged",
      baseStatus: newBattery >= 4 ? "ready" : "low-power",
      modal: null,
      score: s.score + 50,
      assistantText: "Rover charged! The battery dropped to 2 — not enough for the night. Tap the solar panels to top up before sunset.",
      tasks: updateTasks(s.tasks, "plan-rover", "top-up"),
      activeTaskId: "top-up",
    });
  },

  chargeRobotMorning: () => {
    const s = get();
    if (s.robotStatus !== "uncharged" || s.phase !== "evening" || !s.baseConnected) return;
    set({
      robotStatus: "charge-in-morning",
      modal: null,
      score: s.score + 50,
      assistantText: "Good plan — keep the reserve for the base. The rover will charge in the morning. Ready to check the plan.",
      tasks: s.tasks.map((t) =>
        t.id === "plan-rover" ? { ...t, state: "done" }
        : t.id === "top-up" ? { ...t, state: "skipped" }
        : t.id === "check-plan" ? { ...t, state: "active" }
        : t
      ),
      activeTaskId: "check-plan",
    });
  },

  waitSunset: () => {
    const s = get();
    if (s.eveningRefillUsed || s.phase !== "evening" || s.robotStatus === "uncharged") return;
    set({
      eveningRefillUsed: true,
      phase: "sunset-wait",
      timeOfDay: "Sunset",
      modal: null,
      assistantText: "Waiting for sunset… the solar panels collect the last energy.",
    });
    setTimeout(() => {
      const st = get();
      if (st.phase !== "sunset-wait" || !st.eveningRefillUsed) return;
      const target = Math.min(st.batteryMax, st.battery + 2);
      set({
        battery: target,
        phase: "evening",
        baseStatus: "ready",
        score: st.score + 75,
        assistantText:
          target === 6
            ? "Sunset. Battery is full (6/6). The rover will charge in the morning."
            : "Sunset. Battery is back to 4/6 — just enough for the night, rover is ready too.",
        tasks: updateTasks(st.tasks, "top-up", "check-plan"),
        activeTaskId: "check-plan",
      });
    }, 2600);
  },

  startPlanCheck: () => set({ phase: "plan-check", modal: "plan" }),

  beginNight: () => {
    const s = get();
    if (!s.baseConnected || s.battery < 4 || s.robotStatus === "uncharged" || s.phase !== "plan-check") return;
    set({
      phase: "night",
      modal: null,
      timeOfDay: "Night",
      nightStage: 0,
      nightEnergyUsed: 0,
      nightPaused: false,
      assistantText: "Night falls. The battery powers the base while the crew rests.",
      tasks: updateTasks(get().tasks, "check-plan", "survive-night"),
      activeTaskId: "survive-night",
    });
  },

  advanceNight: () => {
    const s = get();
    if (s.nightPaused || s.phase !== "night") return;
    if (s.nightStage >= 4) return;
    const next = s.nightStage + 1;
    const newBattery = Math.max(0, s.battery - 1);
    const triggerStorm = next === 3 && s.stormEvent && !s.stormResolved;
    set({ nightStage: next, battery: newBattery, nightEnergyUsed: s.nightEnergyUsed + 1 });
    if (triggerStorm) {
      // start the storm countdown from the real NASA event's hoursToImpact (scaled to seconds)
      const cd = 90;
      set({
        phase: "storm-decision",
        modal: "storm",
        stormCountdown: cd,
        tasks: get().tasks.map((t) => t.id === "handle-storm" ? { ...t, state: "active" } : t),
        activeTaskId: "handle-storm",
      });
    } else if (next >= 4) {
      const tasks: MissionTask[] = s.stormResolved
        ? get().tasks
        : get().tasks.map((t) =>
            t.id === "survive-night" ? { ...t, state: "done" }
            : t.id === "handle-storm" ? { ...t, state: "skipped" }
            : t
          );
      set({
        phase: "dawn",
        timeOfDay: "Dawn",
        tasks: updateTasks(tasks, "survive-night", "grow-plants"),
        assistantText: "The crew is safe! Next, grow fresh food in the greenhouse.",
        activeTaskId: s.plantGrowth > 0 ? "complete" : "grow-plants",
      });
    }
  },

  toggleNightPause: () => set((s) => ({ nightPaused: !s.nightPaused })),

  setStormEvent: (e) => set({ stormEvent: e }),

  tickStorm: () => {
    const s = get();
    if (s.phase !== "storm-decision" || s.stormCountdown <= 0) return;
    const nc = s.stormCountdown - 1;
    set({ stormCountdown: nc });
    if (nc <= 0 && !s.stormResolved) {
      // storm hits — resolve automatically if the player hasn't decided
      get().resolveStorm(s.stormShieldStrength > 0 ? "shelter" : "ignore");
    }
  },

  buildShield: (amount) => {
    const s = get();
    if (s.phase !== "storm-decision" || s.stormShieldStrength >= 100) return;
    set({
      stormShieldStrength: Math.min(100, s.stormShieldStrength + amount),
      score: s.score + 5,
    });
  },

  resolveStorm: (choice) => {
    const s = get();
    if (s.phase !== "storm-decision" || s.stormResolved) return;
    // Game model: storm intensity (0..100) drives radiation dose.
    // Sheltering with ~10 g/cm² water shield (NASA-STD-3001) cuts dose sharply.
    const intensity = s.stormEvent?.intensity ?? 50;
    const shield = s.stormShieldStrength;
    const protected_ = choice === "shelter";
    // Base dose bump from storm (intensity ~ mSv extra over the night)
    const stormDose = (intensity / 100) * 2.5;
    // Shielding cuts it up to ~80% if fully built
    const reduction = protected_ ? Math.min(0.8, (shield / 100) * 0.85) : 0;
    const finalDose = stormDose * (1 - reduction);
    const newRad = s.radiationLevel + finalDose;
    const scoreBonus = protected_ ? Math.round(150 + shield * 1.5) : 40;
    set({
      stormChoice: choice,
      stormResolved: true,
      modal: null,
      phase: "night",
      radiationLevel: Math.min(8, newRad),
      score: s.score + scoreBonus,
      badges: protected_ && shield >= 80 ? Array.from(new Set([...s.badges, "shelter-pro" as Badge])) : s.badges,
      assistantText: protected_
        ? `Crew sheltered! Your water shield blocked ${Math.round(reduction * 100)}% of the storm's radiation. This is a simplified game result.`
        : "Crew stayed outside the shelter. Radiation exposure this night was much higher.",
      tasks: updateTasks(get().tasks, "handle-storm", "survive-night"),
      activeTaskId: "survive-night",
    });
  },

  deferGreenhouse: () => {
    const s = get();
    if (s.phase !== "dawn") return;
    set({ phase: "quiz", modal: null, activeTaskId: "complete",
      tasks: s.tasks.map(t => t.id === "grow-plants" ? { ...t, state: "skipped" } : t.id === "complete" ? { ...t, state: "active" } : t),
    });
  },
  startGreenhouse: () => {
    const s = get();
    if (s.phase !== "dawn") return;
    const roverCost = s.robotStatus === "charge-in-morning" ? 2 : 0;
    set({
      phase: "greenhouse", modal: "greenhouse",
      battery: Math.min(6, s.battery + 4) - roverCost,
      robotStatus: "charged",
      assistantText: `Morning sunlight added 4 energy units. ${roverCost ? "The rover used 2 to charge. " : ""}Use 1 unit and 5% water to grow fresh food.`,
    });
  },

  waterPlant: () => {
    const s = get();
    if (s.plantWatered || s.phase !== "greenhouse" || s.water < 5) return;
    set({ plantWatered: true, water: s.water - 5, score: s.score + 20 });
  },

  togglePlantLight: () => {
    const s = get();
    if (s.phase !== "greenhouse" || s.plantGrowth >= 100) return;
    if (!s.plantLightOn && s.plantGrowth === 0) {
      if (!s.plantWatered || s.battery < 1) return;
      set({ battery: s.battery - 1, plantGrowth: 1 });
    }
    set({ plantLightOn: !s.plantLightOn });
  },

  growPlantTick: () => {
    const s = get();
    if (s.phase !== "greenhouse" || !s.plantWatered || !s.plantLightOn) return;
    if (s.plantGrowth >= 100) return;
    const next = Math.min(100, s.plantGrowth + 8);
    const justDone = next >= 100 && s.plantGrowth < 100;
    set({ plantGrowth: next });
    if (justDone) {
      set({
        plantLightOn: false,
        score: get().score + 100,
        badges: Array.from(new Set([...get().badges, "green-thumb" as Badge])),
        tasks: updateTasks(get().tasks, "grow-plants", "complete"),
        activeTaskId: "complete",
        assistantText: "Fresh food is ready! Water and powered light helped the plants grow. Now finish your mission review.",
      });
    }
  },

  submitQuiz: (a) => {
    const s = get();
    if (s.quizDone || s.phase !== "quiz") return;
    if (a === "battery") {
      set({
        quizAnswer: a,
        quizDone: true,
        score: s.score + 200,
        badges: Array.from(new Set([...s.badges, "first-night" as Badge])),
        assistantText: "Correct! The battery stored the electricity collected earlier — that's what kept the base running after sunset.",
        tasks: updateTasks(get().tasks, "complete"),
        activeTaskId: null,
      });
    } else {
      set({
        quizAnswer: a,
        quizRetries: s.quizRetries + 1,
        assistantText: "Not quite. Follow the power path at night: it comes from the battery, not the panels. Try again!",
      });
    }
  },

  restart: () =>
    set({
      ...INITIAL,
      stormEvent: get().stormEvent,
      donkiSource: get().donkiSource,
      donkiMessage: get().donkiMessage,
      phase: "evening",
      timeOfDay: "Evening",
      tasks: INITIAL_TASKS.map((t) => ({ ...t })),
      activeTaskId: "connect-battery",
    }),

  initFromDonki: ({ source, message, events }) => {
    const pick =
      events.find((e) => e.kind === "CME") ??
      events.find((e) => e.classType?.startsWith("X")) ??
      events.find((e) => e.classType?.startsWith("M")) ??
      events[0];
    if (!pick) return;
    set({ donkiSource: source, donkiMessage: message, stormEvent: { ...pick, source } });
  },
}));
