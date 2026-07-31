import { useEffect, useRef } from "react";

const KEY_MAP: Record<string, keyof typeof PRESSED> = {
  arrowup: "up",
  w: "up",
  arrowdown: "down",
  s: "down",
  arrowleft: "left",
  a: "left",
  arrowright: "right",
  d: "right",
};

const PRESSED = { up: false, down: false, left: false, right: false };

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  );
}

/**
 * Captura WASD/Setas e o "interagir" (Espaço/Enter). Retorna um ref lido no
 * useFrame (sem re-render por tecla). Ignora teclas quando o foco está num
 * campo de formulário (ex.: Drawer de uma estação aberto sobre a cena) —
 * só o keydown é filtrado; o keyup sempre limpa o estado para não deixar
 * uma direção "presa" caso o foco mude enquanto a tecla ainda está pressionada.
 */
export function useKeyboard(
  onInteract: () => void,
): React.MutableRefObject<typeof PRESSED> {
  const pressed = useRef({ ...PRESSED });

  useEffect(() => {
    const down = (e: KeyboardEvent): void => {
      if (isTypingTarget(e.target)) return;
      const key = e.key.toLowerCase();
      if (key === "e" || key === " " || key === "enter") {
        onInteract();
        e.preventDefault();
        return;
      }
      const dir = KEY_MAP[key];
      if (dir) {
        pressed.current[dir] = true;
        e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent): void => {
      const dir = KEY_MAP[e.key.toLowerCase()];
      if (dir) pressed.current[dir] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [onInteract]);

  return pressed;
}
