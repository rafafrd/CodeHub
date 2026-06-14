import { Html } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { LogOut } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { DashboardPanel } from "../components/DashboardPanel";
import { Drawer } from "../components/Drawer";
import { InventoryPanel } from "../components/InventoryPanel";
import { SettingsPanel } from "../components/SettingsPanel";
import { SnippetsPanel } from "../components/SnippetsPanel";
import { TaxonomyPanel } from "../components/TaxonomyPanel";
import { api } from "../lib/api";
import { useSettings } from "../theme/SettingsContext";
import {
  buildAvatarTextures,
  buildFloorTexture,
  buildObjectTexture,
  Direction,
  ObjectKind,
} from "./sprites";
import { useKeyboard } from "./useKeyboard";

type Tab = "snippets" | "tags" | "settings" | "inventory" | "profile";

interface RoomObject {
  id: Tab;
  label: string;
  kind: ObjectKind;
  pos: [number, number];
}

const OBJECTS: RoomObject[] = [
  { id: "snippets", label: "Snippets", kind: "computer", pos: [-4.4, 1.5] },
  { id: "tags", label: "Tags", kind: "board", pos: [0, 2.5] },
  { id: "settings", label: "Config", kind: "shelf", pos: [4.4, 1.5] },
  { id: "inventory", label: "Inventário", kind: "cabinet", pos: [4.6, -1.7] },
  { id: "profile", label: "Perfil", kind: "desk", pos: [-4.4, -1.7] },
];

const LABELS: Record<Tab, string> = {
  snippets: "Snippets",
  tags: "Tags",
  settings: "Configurações",
  inventory: "Inventário",
  profile: "Perfil",
};

const ROOM = { x: 6, y: 3.2 };
const SPEED = 5;
const INTERACT_DIST = 1.7;
const IDLE_MS = 30_000;

function rgbVar(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value ? `rgb(${value.split(/\s+/).join(",")})` : fallback;
}

function SpeechBubble({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}): JSX.Element {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const tween = gsap.to(ref.current, {
      y: -7,
      duration: 1.1,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    return () => {
      tween.kill();
    };
  }, []);
  return (
    <Html position={[0, 1.15, 0]} center zIndexRange={[20, 0]}>
      <button
        ref={ref}
        onClick={onClick}
        className={`pointer-events-auto whitespace-nowrap rounded-md border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider shadow-neon transition ${
          active
            ? "border-neon bg-neon/20 text-neon"
            : "border-neon/40 bg-surface/90 text-fg/80"
        }`}
      >
        {label}
      </button>
    </Html>
  );
}

function Scene({
  onOpen,
  onNearChange,
}: {
  onOpen: (tab: Tab) => void;
  onNearChange: (tab: Tab | null) => void;
}): JSX.Element {
  const { theme } = useSettings();
  const neon = useMemo(() => rgbVar("--c-neon", "#00f0b5"), [theme]);

  const textures = useMemo(buildAvatarTextures, []);
  const floor = useMemo(() => {
    const tex = buildFloorTexture(neon);
    tex.repeat.set(14, 8);
    return tex;
  }, [neon]);
  const objectTextures = useMemo(
    () =>
      OBJECTS.reduce<Record<Tab, THREE.CanvasTexture>>(
        (acc, o) => {
          acc[o.id] = buildObjectTexture(o.kind, neon);
          return acc;
        },
        {} as Record<Tab, THREE.CanvasTexture>,
      ),
    [neon],
  );

  const avatarRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const pos = useRef({ x: 0, y: -0.6 });
  const dir = useRef<Direction>("down");
  const frame = useRef(0);
  const frameTimer = useRef(0);
  const lastActivity = useRef(performance.now());
  const sleeping = useRef(false);
  const nearRef = useRef<Tab | null>(null);
  const [sleepingState, setSleepingState] = useState(false);

  const activity = useCallback(() => {
    lastActivity.current = performance.now();
    if (sleeping.current) {
      sleeping.current = false;
      setSleepingState(false);
    }
  }, []);
  const interact = useCallback(() => {
    if (nearRef.current) onOpen(nearRef.current);
  }, [onOpen]);

  const pressed = useKeyboard(activity, interact);

  useEffect(() => {
    const click = (): void => activity();
    window.addEventListener("pointerdown", click);
    return () => window.removeEventListener("pointerdown", click);
  }, [activity]);

  useFrame((_, delta) => {
    const p = pressed.current;
    let vx = (p.right ? 1 : 0) - (p.left ? 1 : 0);
    let vy = (p.up ? 1 : 0) - (p.down ? 1 : 0);

    if (vx !== 0 || vy !== 0) {
      const len = Math.hypot(vx, vy);
      vx /= len;
      vy /= len;
      pos.current.x = THREE.MathUtils.clamp(
        pos.current.x + vx * SPEED * delta,
        -ROOM.x,
        ROOM.x,
      );
      pos.current.y = THREE.MathUtils.clamp(
        pos.current.y + vy * SPEED * delta,
        -ROOM.y,
        ROOM.y,
      );
      dir.current =
        Math.abs(vx) > Math.abs(vy)
          ? vx > 0
            ? "right"
            : "left"
          : vy > 0
            ? "up"
            : "down";
      frameTimer.current += delta;
      if (frameTimer.current > 0.16) {
        frame.current = frame.current === 0 ? 1 : 0;
        frameTimer.current = 0;
      }
      lastActivity.current = performance.now();
    } else {
      frame.current = 0;
    }

    if (
      !sleeping.current &&
      performance.now() - lastActivity.current > IDLE_MS
    ) {
      sleeping.current = true;
      setSleepingState(true);
    }

    if (avatarRef.current) {
      avatarRef.current.position.x = pos.current.x;
      avatarRef.current.position.y = pos.current.y;
    }
    if (matRef.current) {
      const tex = sleeping.current
        ? textures.sleeping
        : textures.walk[dir.current][frame.current];
      if (matRef.current.map !== tex) {
        matRef.current.map = tex;
        matRef.current.needsUpdate = true;
      }
    }

    let near: Tab | null = null;
    let best = INTERACT_DIST;
    for (const o of OBJECTS) {
      const d = Math.hypot(o.pos[0] - pos.current.x, o.pos[1] - pos.current.y);
      if (d < best) {
        best = d;
        near = o.id;
      }
    }
    if (near !== nearRef.current) {
      nearRef.current = near;
      onNearChange(near);
    }
  });

  return (
    <>
      <mesh position={[0, 0, -1]}>
        <planeGeometry args={[18, 11]} />
        <meshBasicMaterial color="#090c13" />
      </mesh>
      {/* janela cyber (skyline) */}
      <mesh position={[0, 3.9, -0.9]}>
        <planeGeometry args={[15, 1.7]} />
        <meshBasicMaterial color="#0b1b2c" />
      </mesh>
      {/* piso */}
      <mesh position={[0, -0.3, 0]}>
        <planeGeometry args={[14, 8]} />
        <meshBasicMaterial map={floor} />
      </mesh>

      {OBJECTS.map((o) => (
        <group key={o.id} position={[o.pos[0], o.pos[1], 0.2]}>
          <mesh onClick={() => onOpen(o.id)}>
            <planeGeometry args={[1.7, 1.7]} />
            <meshBasicMaterial map={objectTextures[o.id]} transparent />
          </mesh>
          <SpeechBubble
            label={o.label}
            active={nearRef.current === o.id}
            onClick={() => onOpen(o.id)}
          />
        </group>
      ))}

      <mesh ref={avatarRef} position={[0, -0.6, 1]}>
        <planeGeometry args={[1.5, 1.5]} />
        <meshBasicMaterial ref={matRef} transparent map={textures.walk.down[0]} />
        {sleepingState && (
          <Html position={[0.45, 0.95, 0]} center>
            <span className="game-zzz">zzZ</span>
          </Html>
        )}
      </mesh>
    </>
  );
}

function GamePanel({ tab }: { tab: Tab }): JSX.Element {
  switch (tab) {
    case "snippets":
      return <SnippetsPanel />;
    case "profile":
      return <DashboardPanel />;
    case "inventory":
      return <InventoryPanel />;
    case "settings":
      return <SettingsPanel />;
    case "tags":
      return (
        <TaxonomyPanel
          title="Tags"
          kicker="// taxonomy"
          placeholder="Ex.: docker, nginx…"
          list={api.listTags}
          create={api.createTag}
          remove={api.deleteTag}
        />
      );
  }
}

export default function GameMode(): JSX.Element {
  const { setGameMode } = useSettings();
  const [active, setActive] = useState<Tab | null>(null);
  const [near, setNear] = useState<Tab | null>(null);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-base">
      <Canvas
        orthographic
        camera={{ position: [0, 0, 10], zoom: 56 }}
        dpr={[1, 2]}
        gl={{ antialias: false }}
      >
        <Scene onOpen={setActive} onNearChange={setNear} />
      </Canvas>

      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
        <p className="rounded-md border border-line/70 bg-surface/80 px-3 py-1.5 font-mono text-[11px] text-muted backdrop-blur">
          <span className="text-neon">WASD / setas</span> para andar ·{" "}
          <span className="text-neon">[E]</span> ou clique no balão para
          interagir
        </p>
      </div>

      {near && (
        <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
          <p className="animate-pulse-neon rounded-md border border-neon/50 bg-surface/90 px-3 py-1.5 font-mono text-xs text-neon shadow-neon">
            [E] abrir {LABELS[near]}
          </p>
        </div>
      )}

      <button
        onClick={() => setGameMode(false)}
        className="absolute right-4 top-4 flex items-center gap-2 rounded-md border border-line bg-surface/80 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-fg/80 backdrop-blur transition hover:border-neon/50 hover:text-neon"
      >
        <LogOut size={14} /> sair do modo jogo
      </button>

      <Drawer
        open={active !== null}
        onClose={() => setActive(null)}
        kicker="// modo jogo"
        title={active ? LABELS[active] : ""}
      >
        {active && <GamePanel tab={active} />}
      </Drawer>
    </div>
  );
}
