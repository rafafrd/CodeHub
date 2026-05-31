import { useState } from "react";

import { SnippetsPanel } from "./components/SnippetsPanel";
import { TaxonomyPanel } from "./components/TaxonomyPanel";
import { api } from "./lib/api";

type Tab = "snippets" | "types" | "tags";

const tabs: { id: Tab; label: string }[] = [
  { id: "snippets", label: "Snippets" },
  { id: "types", label: "Tipos" },
  { id: "tags", label: "Tags" },
];

export function App() {
  const [tab, setTab] = useState<Tab>("snippets");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <h1 className="text-xl font-bold">
            🚀 CodeHub
            <span className="ml-2 text-sm font-normal text-slate-500">
              inventário de snippets e configs
            </span>
          </h1>
        </div>
      </header>

      <nav className="mx-auto max-w-5xl px-6 pt-6">
        <div className="flex gap-1 border-b border-slate-200">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
                tab === t.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-6">
        {tab === "snippets" && <SnippetsPanel />}
        {tab === "types" && (
          <TaxonomyPanel
            title="Tipos de projeto"
            placeholder="Ex.: DevSecOps, Node.js…"
            list={api.listTypes}
            create={api.createType}
            remove={api.deleteType}
          />
        )}
        {tab === "tags" && (
          <TaxonomyPanel
            title="Tags"
            placeholder="Ex.: docker, nginx, security…"
            list={api.listTags}
            create={api.createTag}
            remove={api.deleteTag}
          />
        )}
      </main>
    </div>
  );
}
