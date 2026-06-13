import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { useSettings } from "../theme/SettingsContext";

const LINES = [
  "> booting dedsec runtime…",
  "> bypassing ctOS firewall…",
  "> mounting /codehub memory card…",
  "> sync :: snippets · types · tags · folders…",
  "> loading gamification core…",
  "> ACCESS GRANTED",
];

const TOTAL_MS = 3000;

export function BootIntro() {
  const { animations } = useSettings();
  const [done, setDone] = useState<boolean>(() => !animations);
  const [visibleLines, setVisibleLines] = useState(0);
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    if (!animations) {
      setDone(true);
      return;
    }
    const perLine = TOTAL_MS / (LINES.length + 1);
    const timers = LINES.map((_, i) =>
      window.setTimeout(() => {
        setVisibleLines(i + 1);
        if (i === LINES.length - 1) setGranted(true);
      }, perLine * (i + 1)),
    );
    const end = window.setTimeout(() => setDone(true), TOTAL_MS);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(end);
    };
  }, [animations]);

  const progress = Math.round((visibleLines / LINES.length) * 100);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="boot"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(8px)", scale: 1.04 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-base"
        >
          {/* varredura vertical contínua + brilho radial */}
          <div className="boot-scan pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-neon/20 to-transparent" />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 45%, rgb(var(--c-neon) / 0.10), transparent 60%)",
            }}
          />

          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md px-6"
          >
            <motion.p
              animate={granted ? { scale: [1, 1.06, 1] } : {}}
              transition={{ duration: 0.4 }}
              className="mb-6 text-center font-display text-4xl font-bold"
            >
              <span className="glitch neon-text" data-text="DedSec">
                DedSec
              </span>
              <span className="ml-2 text-fg">// CodeHub</span>
            </motion.p>

            <div className="rounded-md border border-neon/30 bg-surface/70 p-4 font-mono text-xs text-neon shadow-neon">
              <AnimatePresence initial={false}>
                {LINES.slice(0, visibleLines).map((line, i) => (
                  <motion.p
                    key={line}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className={
                      i === LINES.length - 1
                        ? "mt-1 font-bold tracking-widest"
                        : ""
                    }
                  >
                    {line}
                  </motion.p>
                ))}
              </AnimatePresence>
              <span className="ml-0.5 inline-block h-3 w-2 animate-pulse-neon bg-neon align-middle" />

              {/* barra de progresso */}
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-line/60">
                <motion.div
                  className="h-full bg-neon shadow-neon"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
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
