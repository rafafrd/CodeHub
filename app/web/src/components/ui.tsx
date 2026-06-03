import clsx from "clsx";
import {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

type ButtonVariant = "neon" | "ghost" | "danger";

export function Button({
  variant = "neon",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      {...props}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 font-mono text-xs uppercase tracking-widest transition",
        "disabled:cursor-not-allowed disabled:opacity-50",
        {
          "border border-neon/50 bg-neon/10 text-neon hover:bg-neon/20 hover:shadow-neon":
            variant === "neon",
          "border border-line text-fg/80 hover:border-neon/50 hover:text-neon":
            variant === "ghost",
          "border border-danger/50 text-danger hover:bg-danger/10":
            variant === "danger",
        },
        className,
      )}
    />
  );
}

export function Panel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <section className={clsx("panel p-5", className)}>{children}</section>;
}

export function SectionHeading({
  kicker,
  title,
  action,
}: {
  kicker?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        {kicker && (
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neon/80">
            {kicker}
          </p>
        )}
        <h2 className="text-xl font-semibold text-fg">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx("field", className)} />;
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={clsx("field", className)} />;
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={clsx("field", className)}>
      {children}
    </select>
  );
}

export function Badge({
  children,
  tone = "neon",
}: {
  children: ReactNode;
  tone?: "neon" | "neon2" | "muted";
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
        {
          "border-neon/40 bg-neon/10 text-neon": tone === "neon",
          "border-neon2/40 bg-neon2/10 text-neon2": tone === "neon2",
          "border-line bg-panel text-muted": tone === "muted",
        },
      )}
    >
      {children}
    </span>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 text-sm text-fg"
    >
      <span
        className={clsx(
          "relative h-6 w-11 rounded-full border transition",
          checked
            ? "border-neon/60 bg-neon/20 shadow-neon-sm"
            : "border-line bg-panel",
        )}
      >
        <span
          className={clsx(
            "absolute top-0.5 h-4 w-4 rounded-full transition-all",
            checked ? "left-6 bg-neon" : "left-1 bg-muted",
          )}
        />
      </span>
      {label}
    </button>
  );
}

export function CodeBlock({ children }: { children: ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-md border border-line bg-base/80 p-4 font-mono text-xs leading-relaxed text-fg/90">
      <code>{children}</code>
    </pre>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-xs text-danger">
      <span className="mr-1">!</span>
      {children}
    </p>
  );
}
