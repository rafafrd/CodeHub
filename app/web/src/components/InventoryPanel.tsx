import clsx from "clsx";
import { ChevronRight, Folder as FolderIcon, FolderPlus } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { useGamification } from "../gamification/GamificationProvider";
import { api, Folder } from "../lib/api";
import { Button, ErrorText, Input, Panel, SectionHeading, Select } from "./ui";

interface TreeNode extends Folder {
  children: TreeNode[];
}

function buildTree(folders: Folder[]): TreeNode[] {
  const map = new Map<number, TreeNode>();
  folders.forEach((f) => map.set(f.id, { ...f, children: [] }));

  const roots: TreeNode[] = [];
  map.forEach((node) => {
    const parent = node.parentId !== null ? map.get(node.parentId) : undefined;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

function FolderRow({ node, depth }: { node: TreeNode; depth: number }) {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <button
        onClick={() => hasChildren && setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition hover:bg-panel"
        style={{ paddingLeft: depth * 16 + 8 }}
      >
        <ChevronRight
          size={14}
          className={clsx(
            "text-muted transition",
            hasChildren ? (open ? "rotate-90" : "") : "opacity-0",
          )}
        />
        <FolderIcon size={16} className="text-neon" />
        <span className="text-fg">{node.name}</span>
        {hasChildren && (
          <span className="ml-auto font-mono text-[10px] text-muted">
            {node.children.length}
          </span>
        )}
      </button>
      {open &&
        node.children.map((child) => (
          <FolderRow key={child.id} node={child} depth={depth + 1} />
        ))}
    </div>
  );
}

export function InventoryPanel() {
  const { notify } = useGamification();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function reload(): Promise<void> {
    setError(null);
    try {
      setFolders(await api.listFolders());
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
      const result = await api.createFolder(name.trim(), parentId || null);
      if (result.gamification) notify(result.gamification);
      setName("");
      setParentId(0);
      await reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const tree = buildTree(folders);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Panel className="lg:col-span-2">
        <SectionHeading kicker="// new node" title="Nova pasta" />
        <form onSubmit={handleCreate} className="space-y-3">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da pasta"
          />
          <Select
            value={parentId}
            onChange={(e) => setParentId(Number(e.target.value))}
          >
            <option value={0}>Raiz (sem pasta pai)</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </Select>
          <Button type="submit" disabled={busy} className="w-full">
            <FolderPlus size={14} /> Criar pasta
          </Button>
          {error && <ErrorText>{error}</ErrorText>}
        </form>
      </Panel>

      <Panel className="lg:col-span-3">
        <SectionHeading kicker="// inventory tree" title="Explorador" />
        <div className="rounded-md border border-line/70 bg-base/40 p-2">
          {tree.length === 0 ? (
            <p className="p-2 font-mono text-xs text-muted">
              // inventário vazio
            </p>
          ) : (
            tree.map((node) => (
              <FolderRow key={node.id} node={node} depth={0} />
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}
