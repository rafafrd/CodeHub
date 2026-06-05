import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { useSettings } from "../theme/SettingsContext";

const LINES = [
  "> booting dedsec runtime…",
  "> bypassing ctOS firewall…",
  "> mounting /codehub volume…",
  "> sync :: snippets · types · tags…",
  "> ACCESS GRANTED",
];

const TOTAL_MS = 2800;

export function BootIntro() {
  const { animations } = useSettings();
  const [done, setDone] = useState<boolean>(() => !animations);
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (!animations) {
      setDone(true);
      return;
    }
    const perLine = TOTAL_MS / (LINES.length + 1);
    const timers = LINES.map((_, i) =>
      window.setTimeout(() => setVisibleLines(i + 1), perLine * (i + 1)),
    );
    const end = window.setTimeout(() => setDone(true), TOTAL_MS);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(end);
    };
  }, [animations]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="boot"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-base"
        >
          <div className="boot-scan pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-neon/20 to-transparent" />

          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md px-6"
          >
            <p className="mb-6 text-center font-display text-4xl font-bold">
              <span className="glitch neon-text" data-text="DedSec">
                DedSec
              </span>
              <span className="ml-2 text-fg">// CodeHub</span>
            </p>

            <div className="rounded-md border border-neon/30 bg-surface/70 p-4 font-mono text-xs text-neon shadow-neon">
              {LINES.slice(0, visibleLines).map((line) => (
                <p key={line} className="animate-fade-up">
                  {line}
                </p>
              ))}
              <span className="inline-block h-3 w-2 animate-pulse-neon bg-neon align-middle" />
            </div>
          </motion.div>

          <button
            onClick={() => setDone(true)}
            className="absolute bottom-6 right-6 font-mono text-[10px] uppercase tracking-widest text-muted transition hover:text-neon"
          >
            pular &gt;&gt;
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
