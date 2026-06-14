import clsx from "clsx";
import { useEffect, useState } from "react";

import { useSettings } from "../theme/SettingsContext";
import { THEMES } from "../theme/themes";
import { Badge, Input, Panel, SectionHeading, Toggle } from "./ui";

type Health = "checking" | "online" | "offline";

export function SettingsPanel() {
  const {
    theme,
    setTheme,
    animations,
    setAnimations,
    scanlines,
    setScanlines,
    gameMode,
    setGameMode,
  } = useSettings();
  const [health, setHealth] = useState<Health>("checking");

  useEffect(() => {
    let active = true;
    fetch("/health")
      .then((r) => {
        if (active) setHealth(r.ok ? "online" : "offline");
      })
      .catch(() => {
        if (active) setHealth("offline");
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Panel>
        <SectionHeading kicker="// appearance" title="Tema" />
        <div className="grid gap-3 sm:grid-cols-3">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={clsx(
                "rounded-lg border p-4 text-left transition",
                theme === t.id
                  ? "border-neon shadow-neon"
                  : "border-line hover:border-neon/40",
              )}
            >
              <div className="mb-3 flex gap-1.5">
                {t.swatch.map((c, i) => (
                  <span
                    key={i}
                    className="h-5 w-5 rounded-full border border-white/10"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <p className="font-display text-base font-semibold text-fg">
                {t.label}
              </p>
              <p className="mt-0.5 text-xs text-muted">{t.description}</p>
              {theme === t.id && (
                <span className="mt-2 inline-block">
                  <Badge>ativo</Badge>
                </span>
              )}
            </button>
          ))}
        </div>
      </Panel>

      <Panel>
        <SectionHeading kicker="// interface" title="Interface" />
        <div className="space-y-4">
          <Toggle
            checked={animations}
            onChange={setAnimations}
            label="Animações (boot, transições e glitch)"
          />
          <Toggle
            checked={scanlines}
            onChange={setScanlines}
            label="Scanlines (efeito CRT)"
          />
        </div>
      </Panel>

      <Panel>
        <SectionHeading
          kicker="// experimental"
          title="Modo Jogo"
          action={<Badge tone="neon2">2D</Badge>}
        />
        <p className="mb-4 text-sm text-muted">
          Transforma a navegação num quarto cibernético em pixel art. Ande com{" "}
          <span className="text-neon">WASD/setas</span> e interaja com os objetos
          (computador = Snippets, lousa = Tags…).
        </p>
        <Toggle
          checked={gameMode}
          onChange={setGameMode}
          label="Habilitar Modo Jogo"
        />
      </Panel>

      <Panel>
        <SectionHeading
          kicker="// account"
          title="Conta"
          action={<Badge tone="muted">em breve</Badge>}
        />
        <p className="mb-4 text-sm text-muted">
          Autenticação e sincronização entre dispositivos chegam numa fase
          futura. Os campos abaixo são apenas um preview do que vem por aí.
        </p>
        <div className="grid gap-3 opacity-60 sm:grid-cols-2">
          <div>
            <label className="label">Usuário</label>
            <Input disabled placeholder="@dedsec" />
          </div>
          <div>
            <label className="label">E-mail</label>
            <Input disabled placeholder="voce@exemplo.com" />
          </div>
        </div>
      </Panel>

      <Panel>
        <SectionHeading kicker="// system" title="Status" />
        <div className="space-y-2 font-mono text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted">API backend</span>
            <span
              className={clsx({
                "text-neon": health === "online",
                "text-danger": health === "offline",
                "text-muted": health === "checking",
              })}
            >
              {health === "checking" && "verificando…"}
              {health === "online" && "● online"}
              {health === "offline" && "● offline"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">versão</span>
            <span className="text-fg">v0.1.0</span>
          </div>
        </div>
        {health === "offline" && (
          <p className="mt-3 text-xs text-muted">
            Backend fora do ar. Suba a stack com{" "}
            <code className="text-neon">docker compose up -d</code>.
          </p>
        )}
      </Panel>
    </div>
  );
}
