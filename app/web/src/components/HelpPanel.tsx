import { Boxes, FileCode2, Tags as TagsIcon } from "lucide-react";
import { ReactNode } from "react";

import { Badge, CodeBlock, Panel, SectionHeading } from "./ui";

function Step({
  n,
  icon,
  title,
  children,
}: {
  n: number;
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <li className="flex gap-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-neon/50 bg-neon/10 font-mono text-sm text-neon">
        {String(n).padStart(2, "0")}
      </span>
      <div>
        <p className="flex items-center gap-2 font-display text-base font-semibold text-fg">
          {icon}
          {title}
        </p>
        <div className="mt-1 text-sm text-muted">{children}</div>
      </div>
    </li>
  );
}

export function HelpPanel() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Panel>
        <SectionHeading kicker="// manual" title="Como usar o CodeHub" />
        <p className="text-sm text-muted">
          O CodeHub é o seu <span className="text-fg">inventário</span> de
          snippets e configurações reutilizáveis. Os metadados ficam no MySQL e
          o conteúdo de cada item é salvo como um arquivo{" "}
          <code className="text-neon">.md</code> (com Frontmatter e suporte a
          Mermaid). Organize tudo por <span className="text-neon2">tipo</span> de
          projeto e <span className="text-neon2">tags</span>.
        </p>
      </Panel>

      <Panel>
        <SectionHeading title="Fluxo recomendado" />
        <ol className="space-y-5">
          <Step n={1} icon={<Boxes size={16} className="text-neon" />} title="Crie um Tipo">
            Vá na aba <Badge tone="muted">Tipos</Badge> e cadastre uma categoria
            de projeto — ex.: <code className="text-neon">DevSecOps</code>,{" "}
            <code className="text-neon">Node.js</code>, <code className="text-neon">Frontend</code>.
          </Step>
          <Step n={2} icon={<TagsIcon size={16} className="text-neon" />} title="Crie Tags">
            Na aba <Badge tone="muted">Tags</Badge>, adicione rótulos
            descritivos — ex.: <code className="text-neon">docker</code>,{" "}
            <code className="text-neon">nginx</code>, <code className="text-neon">security</code>.
          </Step>
          <Step n={3} icon={<FileCode2 size={16} className="text-neon" />} title="Crie o Snippet">
            Na aba <Badge tone="muted">Snippets</Badge>, preencha título,
            conteúdo, escolha o tipo e marque as tags. Opcionalmente, cole um
            fluxo Mermaid. Pronto — fica salvo e pesquisável.
          </Step>
        </ol>
      </Panel>

      <Panel>
        <SectionHeading title="Exemplo — Nginx security headers" />
        <CodeBlock>{`# --- Cabeçalhos de Segurança (OWASP) ---
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Content-Security-Policy "default-src 'self';" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;`}</CodeBlock>
        <p className="mt-2 text-xs text-muted">
          Tipo: <code className="text-neon">DevSecOps</code> · Tags:{" "}
          <code className="text-neon">nginx</code>,{" "}
          <code className="text-neon">security</code>
        </p>
      </Panel>

      <Panel>
        <SectionHeading title="Exemplo — Fluxo Mermaid" />
        <p className="mb-2 text-sm text-muted">
          Cole no campo “Fluxo Mermaid” para documentar arquiteturas:
        </p>
        <CodeBlock>{`graph TD
  Client --> Nginx
  Nginx --> API
  API --> MySQL`}</CodeBlock>
      </Panel>

      <Panel>
        <SectionHeading title="Dicas" />
        <ul className="space-y-2 text-sm text-muted">
          <li>
            <span className="text-neon">›</span> Use a busca nos Snippets para
            filtrar por título/descrição (Enter dispara a busca).
          </li>
          <li>
            <span className="text-neon">›</span> Troque o visual em{" "}
            <Badge tone="muted">Config → Tema</Badge> (DedSec, Midnight ou
            Light).
          </li>
          <li>
            <span className="text-neon">›</span> Pode desligar animações e
            scanlines em Config, se preferir uma interface mais sóbria.
          </li>
          <li>
            <span className="text-neon">›</span> O guia completo em Markdown está
            em <code className="text-neon">docs/GUIA-DE-USO.md</code>.
          </li>
        </ul>
      </Panel>
    </div>
  );
}
