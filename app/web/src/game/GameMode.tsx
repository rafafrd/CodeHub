import { Grid, Html } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
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
import { useKeyboard } from "./useKeyboard";

type Tab = "snippets" | "tags" | "settings" | "inventory" | "profile";

interface Station {
  id: Tab;
  label: string;
  /** posição no plano do chão (x, z) */
  pos: [number, number];
}

// Estações dispostas em pentágono ao redor do ponto de partida do jogador.
const STATIONS: Station[] = [
  { id: "snippets", label: "Snippets", pos: [0, -8] },
  { id: "tags", label: "Tags", pos: [7.6, -2.5] },
  { id: "settings", label: "Config", pos: [4.7, 6.5] },
  { id: "inventory", label: "Inventário", pos: [-4.7, 6.5] },
  { id: "profile", label: "Perfil", pos: [-7.6, -2.5] },
];

const LABELS: Record<Tab, string> = {
  snippets: "Snippets",
  tags: "Tags",
  settings: "Configurações",
  inventory: "Inventário",
  profile: "Perfil",
};

const PLAZA_LIMIT = 11; // limite de deslocamento nos eixos X/Z
const SPEED = 6;
const INTERACT_DIST = 2.3;
const RING_RADIUS = 1.7;
const TURN_LERP = 10; // velocidade de rotação do personagem ao virar
const CAMERA_LERP = 4; // suavização da câmera em 3ª pessoa

function rgbVar(name: string, fallback: string): THREE.Color {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return new THREE.Color(value ? `rgb(${value.split(/\s+/).join(",")})` : fallback);
}

/** Interpola um ângulo pelo caminho mais curto (evita "voltas" ao virar). */
function lerpAngle(a: number, b: number, t: number): number {
  let diff = (b - a) % (Math.PI * 2);
  if (diff > Math.PI) diff -= Math.PI * 2;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}

/** Placa flutuante + anel de luz + portal — a "estação" de uma opção do menu. */
function StationPortal({
  station,
  color,
  active,
  onSelect,
}: {
  station: Station;
  color: THREE.Color;
  active: boolean;
  onSelect: () => void;
}): JSX.Element {
  const ring = useRef<THREE.Mesh>(null);
  const portal = useRef<THREE.Mesh>(null);
  const labelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!labelRef.current) return;
    const tween = gsap.to(labelRef.current, {
      y: -6,
      duration: 1.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    return () => {
      tween.kill();
    };
  }, []);

  useFrame(({ clock }) => {
    const pulse = 0.5 + Math.sin(clock.elapsedTime * 2 + station.pos[0]) * 0.15;
    const ringMat = ring.current?.material as THREE.MeshStandardMaterial | undefined;
    if (ringMat) ringMat.emissiveIntensity = active ? 1.4 : pulse;
    if (ring.current) {
      const targetScale = active ? 1.12 : 1;
      ring.current.scale.setScalar(
        THREE.MathUtils.lerp(ring.current.scale.x, targetScale, 0.15),
      );
    }
    if (portal.current) portal.current.rotation.z += 0.006;
  });

  return (
    <group position={[station.pos[0], 0, station.pos[1]]}>
      {/* anel de luz no chão marcando o raio de interação */}
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[RING_RADIUS - 0.12, RING_RADIUS, 48]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* portal vertical (placeholder — pode virar um modelo .gltf/.glb) */}
      <mesh ref={portal} position={[0, 1.6, 0]} castShadow onClick={onSelect}>
        <torusGeometry args={[1, 0.08, 16, 48]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={active ? 1.3 : 0.7}
        />
      </mesh>

      {/* placa flutuante com o nome da opção */}
      <Html position={[0, 3.1, 0]} center zIndexRange={[20, 0]}>
        <button
          ref={labelRef}
          onClick={onSelect}
          className={`pointer-events-auto whitespace-nowrap rounded-md border px-3 py-1.5 font-mono text-xs uppercase tracking-wider shadow-neon transition ${
            active
              ? "border-neon bg-neon/20 text-neon"
              : "border-neon/40 bg-surface/90 text-fg/80"
          }`}
        >
          {station.label}
        </button>
      </Html>
    </group>
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
  const { camera } = useThree();

  const neon = useMemo(() => rgbVar("--c-neon", "#00f0b5"), [theme]);
  const neon2 = useMemo(() => rgbVar("--c-neon2", "#ff2e88"), [theme]);
  const base = useMemo(() => rgbVar("--c-base", "#07090c"), [theme]);

  const stationColors = useMemo(() => {
    const map = {} as Record<Tab, THREE.Color>;
    STATIONS.forEach((s, i) => {
      const c = (i % 2 === 0 ? neon : neon2).clone();
      c.offsetHSL((i * 0.13) % 1, 0, 0);
      map[s.id] = c;
    });
    return map;
  }, [neon, neon2]);

  // Estado imperativo do jogador (evita re-render do React a cada frame).
  const playerGroup = useRef<THREE.Group>(null);
  const playerPos = useRef(new THREE.Vector3(0, 0, 0));
  const playerRot = useRef(0);
  const nearRef = useRef<Tab | null>(null);
  const camOffset = useMemo(() => new THREE.Vector3(0, 5.2, 8.5), []);

  const interact = useCallback(() => {
    if (nearRef.current) onOpen(nearRef.current);
  }, [onOpen]);
  const pressed = useKeyboard(interact);

  useFrame((_, delta) => {
    const p = pressed.current;
    let vx = (p.right ? 1 : 0) - (p.left ? 1 : 0);
    let vz = (p.down ? 1 : 0) - (p.up ? 1 : 0); // "up" anda para longe da câmera (-Z)

    if (vx !== 0 || vz !== 0) {
      const len = Math.hypot(vx, vz);
      vx /= len;
      vz /= len;
      playerPos.current.x = THREE.MathUtils.clamp(
        playerPos.current.x + vx * SPEED * delta,
        -PLAZA_LIMIT,
        PLAZA_LIMIT,
      );
      playerPos.current.z = THREE.MathUtils.clamp(
        playerPos.current.z + vz * SPEED * delta,
        -PLAZA_LIMIT,
        PLAZA_LIMIT,
      );
      const targetAngle = Math.atan2(vx, vz);
      playerRot.current = lerpAngle(
        playerRot.current,
        targetAngle,
        Math.min(1, TURN_LERP * delta),
      );
    }

    if (playerGroup.current) {
      playerGroup.current.position.copy(playerPos.current);
      playerGroup.current.rotation.y = playerRot.current;
    }

    // câmera em 3ª pessoa: persegue o jogador com suavização (lerp)
    const desired = playerPos.current.clone().add(camOffset);
    camera.position.lerp(desired, Math.min(1, CAMERA_LERP * delta));
    camera.lookAt(playerPos.current.clone().add(new THREE.Vector3(0, 1.2, 0)));

    // proximidade com as estações (a mais próxima dentro do raio vence)
    let near: Tab | null = null;
    let best = INTERACT_DIST;
    for (const s of STATIONS) {
      const d = Math.hypot(
        s.pos[0] - playerPos.current.x,
        s.pos[1] - playerPos.current.z,
      );
      if (d < best) {
        best = d;
        near = s.id;
      }
    }
    if (near !== nearRef.current) {
      nearRef.current = near;
      onNearChange(near);
    }
  });

  return (
    <>
      <color attach="background" args={[base]} />
      <fog attach="fog" args={[base, 10, 32]} />

      <ambientLight intensity={0.55} />
      <directionalLight
        position={[10, 14, 6]}
        intensity={1.3}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
      />

      {/* chão (recebe sombra) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#0b0e15" roughness={0.9} />
      </mesh>
      {/* grade neon decorativa sobre o chão */}
      <Grid
        position={[0, 0.01, 0]}
        args={[30, 30]}
        cellColor={neon}
        sectionColor={neon2}
        cellSize={1}
        sectionSize={5}
        fadeDistance={26}
        fadeStrength={1.5}
      />

      {STATIONS.map((s) => (
        <StationPortal
          key={s.id}
          station={s}
          color={stationColors[s.id]}
          active={nearRef.current === s.id}
          onSelect={() => onOpen(s.id)}
        />
      ))}

      {/* jogador — cápsula estilizada, pronta para virar um modelo .gltf/.glb */}
      <group ref={playerGroup}>
        <mesh castShadow position={[0, 0.75, 0]}>
          <capsuleGeometry args={[0.4, 0.7, 4, 8]} />
          <meshStandardMaterial
            color="#e8fbff"
            emissive={neon}
            emissiveIntensity={0.35}
            roughness={0.35}
            metalness={0.15}
          />
        </mesh>
        {/* indicador de direção (frente do personagem) */}
        <mesh position={[0, 0.95, 0.4]} castShadow>
          <boxGeometry args={[0.16, 0.16, 0.14]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
        </mesh>
      </group>
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
        shadows
        camera={{ position: [0, 5.2, 8.5], fov: 55, near: 0.1, far: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <Scene onOpen={setActive} onNearChange={setNear} />
      </Canvas>

      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
        <p className="rounded-md border border-line/70 bg-surface/80 px-3 py-1.5 font-mono text-[11px] text-muted backdrop-blur">
          <span className="text-neon">WASD / setas</span> para andar ·{" "}
          <span className="text-neon">Espaço / Enter</span> para interagir num
          portal
        </p>
      </div>

      {near && (
        <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
          <p className="animate-pulse-neon rounded-md border border-neon/50 bg-surface/90 px-3 py-1.5 font-mono text-xs text-neon shadow-neon">
            [Espaço] entrar em {LABELS[near]}
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
