import { Plus, Search, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { api, ProjectType, Snippet, Tag } from "../lib/api";
import {
  Badge,
  Button,
  ErrorText,
  Input,
  Panel,
  SectionHeading,
  Select,
  Textarea,
} from "./ui";

const EMPTY_FORM = {
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
  const [form, setForm] = useState(EMPTY_FORM);
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
      setForm(EMPTY_FORM);
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
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Form */}
      <Panel className="lg:col-span-2">
        <SectionHeading kicker="// new entry" title="Novo snippet" />
        <form onSubmit={handleCreate} className="space-y-3">
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Título"
          />
          <Input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Descrição (opcional)"
          />
          <Select
            value={form.typeId}
            onChange={(e) =>
              setForm({ ...form, typeId: Number(e.target.value) })
            }
          >
            <option value={0}>Selecione um tipo…</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
          <Textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Conteúdo (código / config)…"
            rows={6}
          />
          <Textarea
            value={form.mermaidFlow}
            onChange={(e) => setForm({ ...form, mermaidFlow: e.target.value })}
            placeholder="Fluxo Mermaid (opcional)…"
            rows={2}
          />

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const active = selectedTags.includes(tag.id);
                return (
                  <button
                    type="button"
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={
                      active
                        ? "rounded-full border border-neon/60 bg-neon/10 px-3 py-1 font-mono text-xs text-neon shadow-neon-sm"
                        : "rounded-full border border-line px-3 py-1 font-mono text-xs text-muted hover:border-neon/40 hover:text-fg"
                    }
                  >
                    #{tag.name}
                  </button>
                );
              })}
            </div>
          )}

          <Button type="submit" disabled={busy} className="w-full">
            <Plus size={14} /> Salvar snippet
          </Button>
          {error && <ErrorText>{error}</ErrorText>}
        </form>
      </Panel>

      {/* List */}
      <Panel className="lg:col-span-3">
        <SectionHeading
          kicker="// inventory"
          title="Snippets"
          action={<Badge tone="muted">{snippets.length}</Badge>}
        />

        <div className="mb-4 flex gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void reload();
            }}
            placeholder="Buscar por título / descrição…"
          />
          <Button variant="ghost" onClick={() => void reload()}>
            <Search size={14} /> Buscar
          </Button>
        </div>

        <ul className="space-y-2">
          {snippets.length === 0 && (
            <li className="font-mono text-xs text-muted">
              // nenhum snippet encontrado — crie um ao lado
            </li>
          )}
          {snippets.map((s) => (
            <li
              key={s.id}
              className="group rounded-md border border-line/70 bg-panel/50 p-3 transition hover:border-neon/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-fg">{s.title}</p>
                  {s.description && (
                    <p className="truncate text-sm text-muted">
                      {s.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <Badge tone="neon2">{typeName(s.typeId)}</Badge>
                    <span className="font-mono text-[10px] text-muted">
                      {s.createdAt?.slice(0, 10)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => void handleDelete(s.id)}
                  className="text-muted opacity-0 transition group-hover:opacity-100 hover:text-danger"
                  aria-label={`remover ${s.title}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
