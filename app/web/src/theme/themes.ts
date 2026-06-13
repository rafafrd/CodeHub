export type ThemeId =
  | "dedsec"
  | "midnight"
  | "light"
  | "dracula"
  | "monokai"
  | "cyberpunk2077";

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
    id: "dracula",
    label: "Dracula",
    description: "O clássico roxo/rosa em fundo púrpura escuro.",
    swatch: ["#bd93f9", "#ff79c6", "#282a36"],
  },
  {
    id: "monokai",
    label: "Monokai",
    description: "Verde/rosa vibrante sobre cinza-quente do editor.",
    swatch: ["#a6e22e", "#f92672", "#272822"],
  },
  {
    id: "cyberpunk2077",
    label: "Cyberpunk 2077",
    description: "Amarelo Night City + ciano sobre preto.",
    swatch: ["#fcee0a", "#00f0ff", "#0a0a0f"],
  },
  {
    id: "light",
    label: "Light",
    description: "Claro, para ambientes iluminados.",
    swatch: ["#2563eb", "#db2777", "#ffffff"],
  },
];

export const DEFAULT_THEME: ThemeId = "dedsec";
