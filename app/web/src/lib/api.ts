const BASE = "/api";

async function http<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Erro ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

export interface ProjectType {
  id: number;
  name: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Snippet {
  id: number;
  title: string;
  description: string | null;
  filePath: string | null;
  typeId: number;
  folderId: number | null;
  createdAt: string;
}

export interface CreateSnippetBody {
  title: string;
  description?: string;
  content: string;
  type_id: number;
  tags: number[];
  mermaid_flow?: string;
  folder_id?: number | null;
}

export interface SnippetFilters {
  typeId?: number;
  tagId?: number;
  folderId?: number;
  search?: string;
}

// ---- Gamificação ----
export type Rank = "Bronze" | "Prata" | "Ouro" | "Platina" | "Diamante";

export interface Profile {
  id: number;
  username: string | null;
  xp: number;
  level: number;
  rank: Rank;
}

export interface AchievementView {
  id: number;
  code: string;
  name: string;
  description: string | null;
  xpReward: number;
  unlocked: boolean;
}

export interface ProfileView {
  profile: Profile;
  xpToNextLevel: number;
  achievements: AchievementView[];
}

export interface UnlockedView {
  code: string;
  name: string;
  xpReward: number;
}

export interface GamificationOutcome {
  xpGained: number;
  level: number;
  rank: Rank;
  leveledUp: boolean;
  rankChanged: boolean;
  unlocked: UnlockedView[];
}

// ---- Inventário ----
export interface Folder {
  id: number;
  name: string;
  parentId: number | null;
  createdAt: string;
}

type CreatedSnippet = { id: number; filePath: string; gamification?: GamificationOutcome };
type CreatedFolder = Folder & { gamification?: GamificationOutcome };

export const api = {
  // Tipos
  listTypes: () => http<ProjectType[]>("/types"),
  createType: (name: string) =>
    http<ProjectType>("/types", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  deleteType: (id: number) => http<void>(`/types/${id}`, { method: "DELETE" }),

  // Tags
  listTags: () => http<Tag[]>("/tags"),
  createTag: (name: string) =>
    http<Tag>("/tags", { method: "POST", body: JSON.stringify({ name }) }),
  deleteTag: (id: number) => http<void>(`/tags/${id}`, { method: "DELETE" }),

  // Snippets
  listSnippets: (filters?: SnippetFilters) => {
    const query = new URLSearchParams();
    if (filters?.typeId) query.set("typeId", String(filters.typeId));
    if (filters?.tagId) query.set("tagId", String(filters.tagId));
    if (filters?.folderId) query.set("folderId", String(filters.folderId));
    if (filters?.search) query.set("search", filters.search);
    const qs = query.toString();
    return http<Snippet[]>(`/snippets${qs ? `?${qs}` : ""}`);
  },
  createSnippet: (body: CreateSnippetBody) =>
    http<CreatedSnippet>("/snippets", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  deleteSnippet: (id: number) =>
    http<void>(`/snippets/${id}`, { method: "DELETE" }),

  // Gamificação
  getProfile: () => http<ProfileView>("/profile"),

  // Inventário
  listFolders: () => http<Folder[]>("/folders"),
  createFolder: (name: string, parentId: number | null = null) =>
    http<CreatedFolder>("/folders", {
      method: "POST",
      body: JSON.stringify({ name, parent_id: parentId }),
    }),
};
