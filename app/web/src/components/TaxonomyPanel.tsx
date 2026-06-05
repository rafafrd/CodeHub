import { Plus, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { Badge, Button, ErrorText, Input, Panel, SectionHeading } from "./ui";

interface Entity {
  id: number;
  name: string;
}

interface TaxonomyPanelProps {
  title: string;
  kicker: string;
  placeholder: string;
  list: () => Promise<Entity[]>;
  create: (name: string) => Promise<Entity>;
  remove: (id: number) => Promise<void>;
}

export function TaxonomyPanel({
  title,
  kicker,
  placeholder,
  list,
  create,
  remove,
}: TaxonomyPanelProps) {
  const [items, setItems] = useState<Entity[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function reload(): Promise<void> {
    setError(null);
    try {
      setItems(await list());
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  async function handleCreate(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await create(name.trim());
      setName("");
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
      await remove(id);
      await reload();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <Panel className="mx-auto max-w-2xl">
      <SectionHeading
        kicker={kicker}
        title={title}
        action={<Badge tone="muted">{items.length} registros</Badge>}
      />

      <form onSubmit={handleCreate} className="mb-5 flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={placeholder}
        />
        <Button type="submit" disabled={busy}>
          <Plus size={14} /> Add
        </Button>
      </form>

      {error && <div className="mb-3">{<ErrorText>{error}</ErrorText>}</div>}

      <ul className="divide-y divide-line/60">
        {items.length === 0 && (
          <li className="py-3 font-mono text-xs text-muted">
            // nenhum registro ainda
          </li>
        )}
        {items.map((item) => (
          <li
            key={item.id}
            className="group flex items-center justify-between py-2.5 text-sm"
          >
            <span className="flex items-center gap-3">
              <span className="font-mono text-xs text-muted">
                {String(item.id).padStart(3, "0")}
              </span>
              <span className="text-fg">{item.name}</span>
            </span>
            <button
              onClick={() => void handleDelete(item.id)}
              className="text-muted opacity-0 transition group-hover:opacity-100 hover:text-danger"
              aria-label={`remover ${item.name}`}
            >
              <Trash2 size={15} />
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
