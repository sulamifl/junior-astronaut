/**
 * NASA-sourced reference data for the Mars Base educational game.
 *
 * IMPORTANT: Every factual claim here is attributed to a specific NASA source.
 * Game balance numbers (battery "divisions", night length) are explicitly labeled
 * as simplified gameplay values — they are NOT presented as real engineering norms.
 *
 * Sources verified during research (see MARS_GAME_RESEARCH_HANDOFF.md):
 *  - DONKI (CCMC) — space weather events
 *  - OSDR — biological experiments
 *  - RadLab / MSL RAD — surface radiation on Mars
 *  - Mars Trek — surface terrain
 *  - NASA NTRS — engineering reports (power, life support)
 */

export type NasaFact = {
  id: string;
  title: string;
  text: string;
  sourceLabel: string;
  sourceUrl: string;
  category: "energy" | "radiation" | "life-support" | "weather" | "terrain";
};

export const NASA_FACTS: NasaFact[] = [
  {
    id: "rad-surface",
    title: "Radiation on the Martian surface",
    text:
      "NASA's Curiosity rover (RAD instrument) measured an average of about 0.67 mSv per day on the surface in Gale Crater (Aug 2012 – Jun 2013). This is a historical measurement for one location, not a constant for all of Mars.",
    sourceLabel: "NASA — Curiosity RAD results",
    sourceUrl:
      "https://www.nasa.gov/news-release/nasa-rover-results-include-first-age-measurement-on-mars-and-help-for-human-exploration/",
    category: "radiation",
  },
  {
    id: "shielding-surface",
    title: "Storm shelter on the surface",
    text:
      "NASA-STD-3001 recommends about 10 g/cm² of water-equivalent shielding around crew on a planetary surface during solar particle events, accounting for the body's own shielding. 10 g/cm² equals ~10 cm of liquid water.",
    sourceLabel: "NASA-STD-3001, table 4.8-4",
    sourceUrl: "https://www.nasa.gov/reference/4-0-human-performance/",
    category: "radiation",
  },
  {
    id: "solar-storm-2024",
    title: "A real solar storm reached Mars",
    text:
      "On 20 May 2024, a major solar event was observed at Mars — NASA reported Mars 'lighting up' during the epic solar storm. Such events drive the game's storm-shelter decisions.",
    sourceLabel: "NASA — Mars during the 2024 solar storm",
    sourceUrl:
      "https://www.nasa.gov/solar-system/planets/mars/nasa-watches-mars-light-up-during-epic-solar-storm/",
    category: "weather",
  },
  {
    id: "power-baseline",
    title: "How much power a base needs",
    text:
      "A 2017 NASA Johnson concept estimated ~15 kW for critical life support and ~40 kW for full operations of a 4-person Mars surface station. This is a concept estimate, not a measured Mars base.",
    sourceLabel: "NASA NTRS — Human Mars Surface Mission Power",
    sourceUrl:
      "https://ntrs.nasa.gov/api/citations/20170006519/downloads/20170006519.pdf",
    category: "energy",
  },
  {
    id: "crew-consumables",
    title: "What one crew member needs per day",
    text:
      "Per NASA Ames baseline (24 h): ~0.84 kg oxygen, ~3.52 kg drinking/food water, ~0.62 kg dry food for one person. For four crew that is ~3.36 kg oxygen and ~14 kg water per day (calculated).",
    sourceLabel: "NASA Ames — life support baseline",
    sourceUrl:
      "https://ntrs.nasa.gov/api/citations/20160005782/downloads/20160005782.pdf",
    category: "life-support",
  },
  {
    id: "water-recovery",
    title: "Recycling water on the ISS",
    text:
      "In 2023 NASA demonstrated 98% water recovery on the ISS American segment with a brine processor. This is a specific system result, not a guarantee for every base design.",
    sourceLabel: "NASA — ISS water recovery milestone",
    sourceUrl:
      "https://www.nasa.gov/missions/station/nasa-achieves-water-recovery-milestone-on-international-space-station/",
    category: "life-support",
  },
  {
    id: "moxie",
    title: "Making oxygen on Mars",
    text:
      "NASA's MOXIE on Mars produced ~12 g of oxygen per hour at ≥98% purity. A crew of four needs ~140 g/h on average — MOXIE is an experiment, not a full crew supply system.",
    sourceLabel: "NASA — MOXIE completes Mars mission",
    sourceUrl:
      "https://www.nasa.gov/solar-system/nasas-oxygen-generating-experiment-moxie-completes-mars-mission/",
    category: "life-support",
  },
  {
    id: "donki",
    title: "Space weather database (DONKI)",
    text:
      "NASA CCMC's DONKI tracks solar flares (FLR), coronal mass ejections (CME) and solar energetic particle (SEP) events. This game pulls real recent events to trigger storm decisions.",
    sourceLabel: "NASA CCMC — DONKI",
    sourceUrl: "https://ccmc.gsfc.nasa.gov/tools/DONKI/",
    category: "weather",
  },
  {
    id: "natural-shield",
    title: "Terrain as natural shielding",
    text:
      "At Murray Buttes, Curiosity measured ~4% reduction in total dose from terrain. Natural rock helps, but the effect depends on local geometry — you cannot assume any rock gives the same protection.",
    sourceLabel: "NASA — Curiosity natural shielding",
    sourceUrl:
      "https://www.nasa.gov/missions/mars-science-laboratory/how-nasas-curiosity-rover-is-making-mars-safer-for-astronauts/",
    category: "radiation",
  },
  {
    id: "mars-trek",
    title: "Choosing where to land",
    text:
      "NASA's Mars Trek lets engineers study terrain, slopes, lighting and elevation profiles when selecting a base site. Terrain affects power generation and radiation exposure.",
    sourceLabel: "NASA — Mars Trek",
    sourceUrl: "https://trek.nasa.gov/mars/",
    category: "terrain",
  },
];

/** A compact list used in the in-game "Science" panel. */
export function getFactsByCategory(category: NasaFact["category"]) {
  return NASA_FACTS.filter((f) => f.category === category);
}

/**
 * Radiation reference (Curiosity RAD, Gale Crater, 2012–2013 average).
 * Used only as an educational reference number — NOT as a live measurement.
 */
export const RADIATION_REFERENCE = {
  label: "Curiosity RAD surface average (2012–2013)",
  valueMillisievertsPerDay: 0.67,
  sourceUrl:
    "https://www.nasa.gov/news-release/nasa-rover-results-include-first-age-measurement-on-mars-and-help-for-human-exploration/",
};

/**
 * Storm-shelter recommendation (NASA-STD-3001, surface).
 * 10 g/cm² water-equivalent ≈ 10 cm liquid water ≈ 100 kg/m².
 */
export const SHIELDING_REFERENCE = {
  label: "NASA-STD-3001 surface storm shelter",
  waterEquivalentGramPerCm2: 10,
  sourceUrl: "https://www.nasa.gov/reference/4-0-human-performance/",
};

export type GameBalanceNote = {
  id: string;
  text: string;
};

/**
 * Gameplay-only balance notes. These are NOT NASA data — they are simplified
 * for a children's prototype and labeled as such in the UI.
 */
export const GAMEPLAY_NOTES: GameBalanceNote[] = [
  {
    id: "battery-units",
    text: "Battery 'divisions' are a simplified game unit, not real kWh capacity.",
  },
  {
    id: "night-length",
    text: "The 4-stage night is a teaching simplification. Real Mars nights last about 12 hours.",
  },
  {
    id: "no-death",
    text: "There is no crew death in this mission. A failed plan lets you revise and try again.",
  },
];
