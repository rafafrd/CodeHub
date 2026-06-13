import { motion } from "framer-motion";
import { Loader2, Terminal, TriangleAlert } from "lucide-react";
import { FormEvent, ReactNode, useEffect, useState } from "react";

import { api } from "../lib/api";

type State = "checking" | "needs-setup" | "ready" | "error";

/**
 * Porteiro de primeira execução. Consulta `/api/setup`: se não houver conta
 * (arquivo .sqlite), pede o nome do usuário e cria o "Memory Card". Só libera
 * o app (children) quando há conta — antes disso o backend responde 503.
 */
export function SetupGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>("checking");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function check(): void {
    setState("checking");
    api
      .getSetupStatus()
      .then((status) => setState(status.configured ? "ready" : "needs-setup"))
      .catch(() => setState("error"));
  }

  useEffect(check, []);

  async function handleCreate(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await api.createAccount(name.trim());
      setState("ready");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (state === "ready") {
    return <>{children}</>;
  }

  return (
    <div className="scanlines flex min-h-screen items-center justify-center bg-base px-6 text-fg">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-lg border border-neon/40 bg-surface/80 p-6 shadow-neon backdrop-blur"
      >
        <p className="mb-1 text-center font-display text-3xl font-bold">
          <span className="glitch neon-text" data-text="DedSec">
            DedSec
          </span>
          <span className="ml-2 text-fg">// CodeHub</span>
        </p>
        <p className="mb-6 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
          memory card · v2.0
        </p>

        {state === "checking" && (
          <p className="flex items-center justify-center gap-2 py-6 font-mono text-sm text-muted">
            <Loader2 className="animate-spin" size={16} /> conectando ao memory
            card…
          </p>
        )}

        {state === "error" && (
          <div className="space-y-4 text-center">
            <p className="flex items-center justify-center gap-2 font-mono text-sm text-danger">
              <TriangleAlert size={16} /> backend offline
            </p>
            <p className="text-xs text-muted">
              Suba a API (<code className="text-neon">docker compose up -d</code>{" "}
              ou <code className="text-neon">npm run dev -w @codehub/api</code>)
              e tente de novo.
            </p>
            <button
              onClick={check}
              className="rounded-md border border-line px-4 py-2 font-mono text-xs uppercase tracking-widest text-fg/80 transition hover:border-neon/50 hover:text-neon"
            >
              tentar de novo
            </button>
          </div>
        )}

        {state === "needs-setup" && (
          <form onSubmit={handleCreate} className="space-y-4">
            <p className="font-mono text-sm text-neon">
              &gt; identify yourself_
            </p>
            <p className="text-xs text-muted">
              Nenhuma conta encontrada. Escolha um codinome — ele nomeia seu
              banco (<code className="text-neon">&lt;nome&gt;.sqlite</code>),
              versionado no Git como seu save.
            </p>
            <div className="flex items-center gap-2 rounded-md border border-line bg-panel/70 px-3 focus-within:border-neon focus-within:shadow-neon-sm">
              <Terminal size={16} className="text-neon" />
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                placeholder="seu codinome"
                className="w-full bg-transparent py-2 font-mono text-sm text-fg outline-none placeholder:text-muted/60"
              />
            </div>
            <button
              type="submit"
              disabled={busy || !name.trim()}
              className="w-full rounded-md border border-neon/50 bg-neon/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-neon transition hover:bg-neon/20 hover:shadow-neon disabled:opacity-50"
            >
              {busy ? "criando memory card…" : "iniciar"}
            </button>
            {error && (
              <p className="font-mono text-xs text-danger">! {error}</p>
            )}
          </form>
        )}
      </motion.div>
    </div>
  );
}
