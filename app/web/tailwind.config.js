/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "rgb(var(--c-base) / <alpha-value>)",
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        panel: "rgb(var(--c-panel) / <alpha-value>)",
        line: "rgb(var(--c-line) / <alpha-value>)",
        fg: "rgb(var(--c-fg) / <alpha-value>)",
        muted: "rgb(var(--c-muted) / <alpha-value>)",
        neon: "rgb(var(--c-neon) / <alpha-value>)",
        neon2: "rgb(var(--c-neon2) / <alpha-value>)",
        danger: "rgb(var(--c-danger) / <alpha-value>)",
      },
      fontFamily: {
        display: ["Rajdhani", "system-ui", "sans-serif"],
        mono: ['"Share Tech Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        neon: "0 0 4px rgb(var(--c-neon) / 0.7), 0 0 18px rgb(var(--c-neon) / 0.35)",
        "neon-sm": "0 0 3px rgb(var(--c-neon) / 0.6)",
        neon2:
          "0 0 5px rgb(var(--c-neon2) / 0.7), 0 0 20px rgb(var(--c-neon2) / 0.3)",
      },
      keyframes: {
        flicker: {
          "0%, 18%, 22%, 25%, 53%, 57%, 100%": { opacity: "1" },
          "20%, 24%, 55%": { opacity: "0.45" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-neon": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        flicker: "flicker 4s linear infinite",
        "fade-up": "fade-up 0.45s ease both",
        "pulse-neon": "pulse-neon 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
