import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import {
  Boxes,
  FolderTree,
  HelpCircle,
  LayoutDashboard,
  type LucideIcon,
  Settings as SettingsIcon,
  Tags as TagsIcon,
  Terminal,
} from "lucide-react";
import { lazy, Suspense, useState } from "react";

import { BootIntro } from "./components/BootIntro";
import { DashboardPanel } from "./components/DashboardPanel";
import { HelpPanel } from "./components/HelpPanel";
import { InventoryPanel } from "./components/InventoryPanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { SnippetsPanel } from "./components/SnippetsPanel";
import { TaxonomyPanel } from "./components/TaxonomyPanel";
import { api } from "./lib/api";
import { useSettings } from "./theme/SettingsContext";

// Chunk separado: o three.js/R3F só carrega quando o Modo Jogo é ativado.
const GameMode = lazy(() => import("./game/GameMode"));

type Tab =
  | "profile"
  | "snippets"
  | "inventory"
  | "types"
  | "tags"
  | "help"
  | "settings";

interface NavItem {
  id: Tab;
  label: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { id: "profile", label: "Perfil", icon: LayoutDashboard },
  { id: "snippets", label: "Snippets", icon: Terminal },
  { id: "inventory", label: "Inventário", icon: FolderTree },
  { id: "types", label: "Tipos", icon: Boxes },
  { id: "tags", label: "Tags", icon: TagsIcon },
  { id: "help", label: "Ajuda", icon: HelpCircle },
  { id: "settings", label: "Config", icon: SettingsIcon },
];

function Brand({ small }: { small?: boolean }) {
  return (
    <div
      className={clsx(
        "font-display font-bold leading-none",
        small ? "text-lg" : "text-xl",
      )}
    >
      <span className="glitch neon-text" data-text="DedSec">
        DedSec
      </span>
      <span className="ml-2 text-fg">// CodeHub</span>
    </div>
  );
}

function NavButton({
  item,
  active,
  onClick,
  compact,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-3 rounded-md px-3 py-2 font-mono text-xs uppercase tracking-wider transition",
        compact ? "shrink-0" : "w-full",
        active
          ? "border border-neon/50 bg-neon/10 text-neon shadow-neon-sm"
          : "border border-transparent text-muted hover:bg-panel hover:text-fg",
      )}
    >
      <Icon size={16} />
      {item.label}
    </button>
  );
}

export function App() {
  const { gameMode } = useSettings();
  const [tab, setTab] = useState<Tab>("profile");

  if (gameMode) {
    return (
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center bg-base font-mono text-sm text-neon">
            carregando o quarto cibernético…
          </div>
        }
      >
        <GameMode />
      </Suspense>
    );
  }

  return (
    <div className="flex min-h-screen">
      <BootIntro />

      {/* Sidebar (desktop) */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line/70 bg-surface/60 p-5 md:flex">
        <Brand />
        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              active={tab === item.id}
              onClick={() => setTab(item.id)}
            />
          ))}
        </nav>
        <div className="mt-auto pt-6 font-mono text-[10px] text-muted">
          <p>
            v1.0.0 · <span className="text-neon">online</span>
          </p>
          <p className="mt-1 opacity-60">// stay anonymous</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar (mobile) */}
        <header className="border-b border-line/70 bg-surface/60 md:hidden">
          <div className="px-5 py-3">
            <Brand small />
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-2">
            {NAV.map((item) => (
              <NavButton
                key={item.id}
                item={item}
                active={tab === item.id}
                onClick={() => setTab(item.id)}
                compact
              />
            ))}
          </nav>
        </header>

        <main className="flex-1 px-5 py-6 md:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {tab === "profile" && <DashboardPanel />}
              {tab === "snippets" && <SnippetsPanel />}
              {tab === "inventory" && <InventoryPanel />}
              {tab === "types" && (
                <TaxonomyPanel
                  title="Tipos de projeto"
                  kicker="// taxonomy"
                  placeholder="Ex.: DevSecOps, Node.js…"
                  list={api.listTypes}
                  create={api.createType}
                  remove={api.deleteType}
                />
              )}
              {tab === "tags" && (
                <TaxonomyPanel
                  title="Tags"
                  kicker="// taxonomy"
                  placeholder="Ex.: docker, nginx, security…"
                  list={api.listTags}
                  create={api.createTag}
                  remove={api.deleteTag}
                />
              )}
              {tab === "help" && <HelpPanel />}
              {tab === "settings" && <SettingsPanel />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
