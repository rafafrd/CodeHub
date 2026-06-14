import { useEffect, useRef } from "react";

export interface MoveVector {
  x: number;
  y: number;
}

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

/**
 * Captura WASD/Setas e o "interagir" (E/Espaço). Retorna refs lidos no
 * useFrame (sem re-render por tecla). `onActivity` é chamado a cada input
 * (acorda o avatar do modo Sleep).
 */
export function useKeyboard(
  onActivity: () => void,
  onInteract: () => void,
): React.MutableRefObject<typeof PRESSED> {
  const pressed = useRef({ ...PRESSED });

  useEffect(() => {
    const down = (e: KeyboardEvent): void => {
      const key = e.key.toLowerCase();
      onActivity();
      if (key === "e" || key === " ") {
        onInteract();
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
  }, [onActivity, onInteract]);

  return pressed;
}
