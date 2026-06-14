import { AnimatePresence, motion } from "framer-motion";
import { Award, TrendingUp, Trophy, Zap } from "lucide-react";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { GamificationOutcome, subscribeGamification } from "../lib/api";

type ToastKind = "xp" | "level" | "rank" | "achievement";

interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  subtitle?: string;
}

interface GamificationContextValue {
  notify: (outcome: GamificationOutcome) => void;
}

const GamificationContext = createContext<GamificationContextValue | null>(null);

const ICONS: Record<ToastKind, typeof Zap> = {
  xp: Zap,
  level: TrendingUp,
  rank: Award,
  achievement: Trophy,
};

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function push(toast: Omit<Toast, "id">): void {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }

  function notify(outcome: GamificationOutcome): void {
    if (outcome.xpGained > 0) {
      push({ kind: "xp", title: `+${outcome.xpGained} XP` });
    }
    if (outcome.leveledUp) {
      push({ kind: "level", title: "LEVEL UP!", subtitle: `Nível ${outcome.level}` });
    }
    if (outcome.rankChanged) {
      push({ kind: "rank", title: "Nova patente", subtitle: outcome.rank });
    }
    outcome.unlocked.forEach((a) =>
      push({ kind: "achievement", title: "Conquista desbloqueada", subtitle: a.name }),
    );
  }

  // Fonte única dos toasts: o stream SSE do backend (CU03). `notifyRef` evita
  // recriar a assinatura a cada render.
  const notifyRef = useRef(notify);
  notifyRef.current = notify;
  useEffect(() => {
    return subscribeGamification((outcome) => notifyRef.current(outcome));
  }, []);

  return (
    <GamificationContext.Provider value={{ notify }}>
      {children}

      <div className="pointer-events-none fixed bottom-6 right-6 z-[90] flex w-72 flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = ICONS[toast.kind];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 60, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="pointer-events-auto flex items-center gap-3 rounded-md border border-neon/50 bg-surface/95 p-3 shadow-neon backdrop-blur"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded bg-neon/15 text-neon">
                  <Icon size={18} />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-sm font-semibold text-fg">
                    {toast.title}
                  </p>
                  {toast.subtitle && (
                    <p className="truncate font-mono text-xs text-neon">
                      {toast.subtitle}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </GamificationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGamification(): GamificationContextValue {
  const ctx = useContext(GamificationContext);
  if (!ctx) {
    throw new Error("useGamification deve ser usado dentro de <GamificationProvider>");
  }
  return ctx;
}
