import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { ReactNode } from "react";

/**
 * Painel lateral deslizante (Drawer). Abre por cima do conteúdo sem perder o
 * contexto da lista — fricção zero para criar/visualizar artefatos.
 */
export function Drawer({
  open,
  onClose,
  title,
  kicker,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  kicker?: string;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed right-0 top-0 z-[81] flex h-full w-full max-w-xl flex-col border-l border-neon/30 bg-surface shadow-neon"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            role="dialog"
            aria-modal="true"
          >
            <header className="flex items-start justify-between gap-3 border-b border-line/70 p-5">
              <div className="min-w-0">
                {kicker && (
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neon/80">
                    {kicker}
                  </p>
                )}
                <h2 className="truncate text-xl font-semibold text-fg">
                  {title}
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="fechar"
                className="rounded-md border border-line p-1.5 text-muted transition hover:border-neon/50 hover:text-neon"
              >
                <X size={16} />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
