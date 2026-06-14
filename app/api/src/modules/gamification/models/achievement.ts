/** Gatilhos data-driven avaliados pelo CheckAchievementsService. */
export type TriggerKind =
  | "count_snippets_total"
  | "count_folders_total"
  | "count_tags_total"
  | "count_types_total"
  | "count_by_behavior"
  | "level_reached"
  | "time_window"
  | "streak_days"
  | "manual";

/** Conquista do catálogo (tabela `achievements`). */
export interface Achievement {
  id: number;
  code: string;
  name: string;
  description: string | null;
  xpReward: number;
  category: string;
  triggerKind: TriggerKind;
  /** Parâmetro do gatilho (ex.: behavior alvo ou janela "HH:MM-HH:MM"). */
  triggerParam: string | null;
  threshold: number;
}
