import { FormEvent, useEffect, useState } from "react";

import { api, ProjectType, Snippet, Tag } from "../lib/api";

const emptyForm = {
  title: "",
  description: "",
  content: "",
  typeId: 0,
  mermaidFlow: "",
};

export function SnippetsPanel() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [types, setTypes] = useState<ProjectType[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function reload(): Promise<void> {
    setError(null);
    try {
      const [snips, ts, tg] = await Promise.all([
        api.listSnippets(search ? { search } : undefined),
        api.listTypes(),
        api.listTags(),
      ]);
      setSnippets(snips);
      setTypes(ts);
      setTags(tg);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  function typeName(id: number): string {
    return types.find((t) => t.id === id)?.name ?? `#${id}`;
  }

  function toggleTag(id: number): void {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  }

  async function handleCreate(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!form.title.trim() || !form.content.trim() || !form.typeId) {
      setError("Título, conteúdo e tipo são obrigatórios.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.createSnippet({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        content: form.content,
        type_id: form.typeId,
        tags: selectedTags,
        mermaid_flow: form.mermaidFlow.trim() || undefined,
      });
      setForm(emptyForm);
      setSelectedTags([]);
      await reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number): Promise<void> {
    setError(null);
    try {
      await api.deleteSnippet(id);
      await reload();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Formulário de criação */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          Novo snippet
        </h2>
        <form onSubmit={handleCreate} className="space-y-3">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Título"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Descrição (opcional)"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
          <select
            value={form.typeId}
            onChange={(e) =>
              setForm({ ...form, typeId: Number(e.target.value) })
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          >
            <option value={0}>Selecione um tipo…</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Conteúdo (código/config)…"
            rows={5}
            className="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-xs focus:border-indigo-500 focus:outline-none"
          />
          <textarea
            value={form.mermaidFlow}
            onChange={(e) => setForm({ ...form, mermaidFlow: e.target.value })}
            placeholder="Fluxo Mermaid (opcional)…"
            rows={2}
            className="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-xs focus:border-indigo-500 focus:outline-none"
          />

          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <label
                key={tag.id}
                className={`cursor-pointer rounded-full border px-3 py-1 text-xs ${
                  selectedTags.includes(tag.id)
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-300 text-slate-600"
                }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={selectedTags.includes(tag.id)}
                  onChange={() => toggleTag(tag.id)}
                />
                {tag.name}
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Salvar snippet
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </section>

      {/* Lista */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título/descrição…"
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
          <button
            onClick={() => void reload()}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Buscar
          </button>
        </div>

        <ul className="space-y-2">
          {snippets.length === 0 && (
            <li className="text-sm text-slate-400">Nenhum snippet encontrado.</li>
          )}
          {snippets.map((s) => (
            <li
              key={s.id}
              className="rounded-md border border-slate-100 p-3 text-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-slate-800">{s.title}</p>
                  {s.description && (
                    <p className="text-slate-500">{s.description}</p>
                  )}
                  <span className="mt-1 inline-block rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                    {typeName(s.typeId)}
                  </span>
                </div>
                <button
                  onClick={() => void handleDelete(s.id)}
                  className="text-xs font-medium text-red-500 hover:text-red-700"
                >
                  remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
