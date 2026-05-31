import { FormEvent, useEffect, useState } from "react";

interface Entity {
  id: number;
  name: string;
}

interface TaxonomyPanelProps {
  title: string;
  placeholder: string;
  list: () => Promise<Entity[]>;
  create: (name: string) => Promise<Entity>;
  remove: (id: number) => Promise<void>;
}

export function TaxonomyPanel({
  title,
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
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-800">{title}</h2>

      <form onSubmit={handleCreate} className="mb-4 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          Adicionar
        </button>
      </form>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <ul className="divide-y divide-slate-100">
        {items.length === 0 && (
          <li className="py-2 text-sm text-slate-400">Nenhum item ainda.</li>
        )}
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between py-2 text-sm"
          >
            <span className="text-slate-700">
              <span className="mr-2 text-slate-400">#{item.id}</span>
              {item.name}
            </span>
            <button
              onClick={() => void handleDelete(item.id)}
              className="text-xs font-medium text-red-500 hover:text-red-700"
            >
              remover
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
