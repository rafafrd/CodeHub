import clsx from "clsx";
import { Award, Lock, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

import { api, ProfileView, Rank } from "../lib/api";
import { Badge, ErrorText, Panel, SectionHeading } from "./ui";

const RANK_COLOR: Record<Rank, string> = {
  Bronze: "#cd7f32",
  Prata: "#c0c0c0",
  Ouro: "#ffd700",
  Platina: "#5fd3c4",
  Diamante: "#7fd4ff",
};

export function DashboardPanel() {
  const [data, setData] = useState<ProfileView | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api
      .getProfile()
      .then((view) => {
        if (active) setData(view);
      })
      .catch((err) => {
        if (active) setError((err as Error).message);
      });
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <Panel className="mx-auto max-w-3xl">
        <ErrorText>{error}</ErrorText>
      </Panel>
    );
  }

  if (!data) {
    return (
      <Panel className="mx-auto max-w-3xl">
        <p className="font-mono text-xs text-muted">// carregando perfil…</p>
      </Panel>
    );
  }

  const { profile, xpToNextLevel, achievements } = data;
  const pct = profile.xp % 100; // curva de 100 XP por nível
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const rankColor = RANK_COLOR[profile.rank];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neon/80">
              // operador
            </p>
            <h2 className="text-2xl font-bold text-fg">
              @{profile.username ?? "anon"}
            </h2>
          </div>
          <div className="text-right">
            <span
              className="inline-flex items-center gap-2 rounded-md border px-3 py-1 font-display font-semibold"
              style={{ borderColor: rankColor, color: rankColor }}
            >
              <Award size={16} /> {profile.rank}
            </span>
            <p className="mt-1 font-mono text-xs text-muted">
              nível {profile.level}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-1 flex justify-between font-mono text-xs text-muted">
            <span>XP {profile.xp}</span>
            <span>
              faltam {xpToNextLevel} p/ o nível {profile.level + 1}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full border border-line bg-base">
            <div
              className="h-full bg-neon shadow-neon transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </Panel>

      <Panel>
        <SectionHeading
          kicker="// trophies"
          title="Conquistas"
          action={
            <Badge tone="muted">
              {unlockedCount}/{achievements.length}
            </Badge>
          }
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={clsx(
                "flex items-start gap-3 rounded-md border p-3 transition",
                a.unlocked
                  ? "border-neon/40 bg-neon/5"
                  : "border-line opacity-60",
              )}
            >
              <span
                className={clsx(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded",
                  a.unlocked ? "bg-neon/15 text-neon" : "bg-panel text-muted",
                )}
              >
                {a.unlocked ? <Trophy size={18} /> : <Lock size={16} />}
              </span>
              <div className="min-w-0">
                <p className="font-display font-semibold text-fg">{a.name}</p>
                {a.description && (
                  <p className="text-xs text-muted">{a.description}</p>
                )}
                <p className="mt-1 font-mono text-[10px] text-neon">
                  +{a.xpReward} XP
                </p>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
