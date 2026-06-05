export type ThemeId = "dedsec" | "midnight" | "light";

export interface ThemeMeta {
  id: ThemeId;
  label: string;
  description: string;
  /** [neon, neon2, base] em hex, só para o preview de swatch nas Configurações. */
  swatch: [string, string, string];
}

export const THEMES: ThemeMeta[] = [
  {
    id: "dedsec",
    label: "DedSec",
    description: "Neon dark — vibe Watch Dogs 2 / ctOS.",
    swatch: ["#00f0b5", "#ff2e88", "#07090c"],
  },
  {
    id: "midnight",
    label: "Midnight",
    description: "Escuro sóbrio, azul e violeta.",
    swatch: ["#4f9dff", "#a78bfa", "#0b0f17"],
  },
  {
    id: "light",
    label: "Light",
    description: "Claro, para ambientes iluminados.",
    swatch: ["#2563eb", "#db2777", "#ffffff"],
  },
];

export const DEFAULT_THEME: ThemeId = "dedsec";
