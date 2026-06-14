import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renderiza Markdown (GFM: tabelas, listas de tarefas, ~~strike~~) com o estilo
 * do tema atual (classe `.ch-md` em index.css). Usado em descrições e no
 * conteúdo dos artefatos (CU04).
 */
export function Markdown({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={clsx("ch-md", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
