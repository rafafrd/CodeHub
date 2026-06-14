import * as THREE from "three";

/**
 * Sprites em "pixel art" desenhados proceduralmente num <canvas> e expostos
 * como THREE.CanvasTexture com NearestFilter (nitidez 32-bits, sem PNGs).
 */
type Ctx = CanvasRenderingContext2D;
export type Direction = "down" | "up" | "left" | "right";

const GRID = 16; // grade lógica do sprite do avatar
const SCALE = 4; // cada "pixel" lógico = 4px no canvas (suaviza serrilhado)

export function makeTexture(
  logicalSize: number,
  draw: (ctx: Ctx, unit: number) => void,
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = logicalSize * SCALE;
  canvas.height = logicalSize * SCALE;
  const ctx = canvas.getContext("2d") as Ctx;
  ctx.imageSmoothingEnabled = false;
  draw(ctx, SCALE);
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  return texture;
}

function px(
  ctx: Ctx,
  u: number,
  x: number,
  y: number,
  color: string,
  w = 1,
  h = 1,
): void {
  ctx.fillStyle = color;
  ctx.fillRect(x * u, y * u, w * u, h * u);
}

// --- Avatar (inspirado no Link clássico, chibi 16x16) ----------------------
const PAL = {
  cap: "#2fa84f",
  capDark: "#1f7d3a",
  skin: "#f1c38e",
  hair: "#b9842f",
  eye: "#15151f",
  tunic: "#37b85e",
  tunicDark: "#268a45",
  belt: "#5a3b1e",
  boot: "#6b4a2a",
  zzz: "#9be8c8",
};

function drawLegs(ctx: Ctx, u: number, frame: number): void {
  const a = frame === 0 ? 0 : 1;
  px(ctx, u, 5 - a, 13, PAL.boot, 3, 2);
  px(ctx, u, 8 + a, 13, PAL.boot, 3, 2);
}

function drawAvatarSprite(
  ctx: Ctx,
  u: number,
  dir: Direction,
  frame: number,
  sleeping: boolean,
): void {
  if (sleeping) {
    // sentado/encolhido com olhos fechados
    px(ctx, u, 4, 8, PAL.cap, 8, 3);
    px(ctx, u, 4, 6, PAL.skin, 8, 3);
    px(ctx, u, 3, 5, PAL.cap, 10, 2);
    px(ctx, u, 5, 8, PAL.eye, 2, 1); // olho fechado (linha)
    px(ctx, u, 9, 8, PAL.eye, 2, 1);
    px(ctx, u, 3, 11, PAL.tunic, 10, 4);
    return;
  }

  // cabeça + gorro
  px(ctx, u, 4, 1, PAL.capDark, 8, 1);
  px(ctx, u, 3, 2, PAL.cap, 10, 3);
  px(ctx, u, 5, 5, PAL.skin, 6, 3);

  if (dir === "up") {
    px(ctx, u, 5, 5, PAL.hair, 6, 3); // nuca (sem rosto)
  } else if (dir === "left") {
    px(ctx, u, 5, 6, PAL.eye, 1, 1);
  } else if (dir === "right") {
    px(ctx, u, 10, 6, PAL.eye, 1, 1);
  } else {
    px(ctx, u, 6, 6, PAL.eye, 1, 1);
    px(ctx, u, 9, 6, PAL.eye, 1, 1);
  }

  // tronco (túnica) + cinto + braços
  px(ctx, u, 4, 8, PAL.tunic, 8, 5);
  px(ctx, u, 4, 11, PAL.belt, 8, 1);
  px(ctx, u, 3, 8, PAL.tunicDark, 1, 4);
  px(ctx, u, 12, 8, PAL.tunicDark, 1, 4);

  drawLegs(ctx, u, frame);
}

/** Gera as texturas do avatar: 4 direções × 2 frames + 1 dormindo. */
export function buildAvatarTextures(): {
  walk: Record<Direction, THREE.CanvasTexture[]>;
  sleeping: THREE.CanvasTexture;
} {
  const dirs: Direction[] = ["down", "up", "left", "right"];
  const walk = {} as Record<Direction, THREE.CanvasTexture[]>;
  for (const dir of dirs) {
    walk[dir] = [0, 1].map((frame) =>
      makeTexture(GRID, (ctx, u) => drawAvatarSprite(ctx, u, dir, frame, false)),
    );
  }
  const sleeping = makeTexture(GRID, (ctx, u) =>
    drawAvatarSprite(ctx, u, "down", 0, true),
  );
  return { walk, sleeping };
}

// --- Piso e parede ---------------------------------------------------------
export function buildFloorTexture(neon: string): THREE.CanvasTexture {
  const tex = makeTexture(GRID, (ctx, u) => {
    px(ctx, u, 0, 0, "#0c0f16", GRID, GRID);
    for (let i = 0; i <= GRID; i += 4) {
      px(ctx, u, i, 0, "#161b27", 1, GRID); // grade vertical
      px(ctx, u, 0, i, "#161b27", GRID, 1); // grade horizontal
    }
    px(ctx, u, 2, 2, neon, 1, 1); // ponto neon
    px(ctx, u, 11, 9, neon, 1, 1);
  });
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// --- Objetos interativos (silhuetas pixeladas) -----------------------------
export type ObjectKind =
  | "computer"
  | "board"
  | "shelf"
  | "cabinet"
  | "desk";

export function buildObjectTexture(
  kind: ObjectKind,
  neon: string,
): THREE.CanvasTexture {
  return makeTexture(GRID, (ctx, u) => {
    const body = "#1b2130";
    const edge = "#2c3550";
    switch (kind) {
      case "computer":
        px(ctx, u, 2, 2, edge, 12, 9);
        px(ctx, u, 3, 3, "#06121a", 10, 7); // tela
        px(ctx, u, 4, 4, neon, 8, 1);
        px(ctx, u, 4, 6, neon, 5, 1);
        px(ctx, u, 6, 11, body, 4, 2); // base
        break;
      case "board":
        px(ctx, u, 1, 2, "#0d3a2a", 14, 10);
        px(ctx, u, 2, 3, edge, 12, 8);
        px(ctx, u, 4, 5, neon, 6, 1);
        px(ctx, u, 4, 7, neon, 8, 1);
        break;
      case "shelf":
        px(ctx, u, 2, 1, body, 12, 14);
        px(ctx, u, 2, 5, edge, 12, 1);
        px(ctx, u, 2, 9, edge, 12, 1);
        px(ctx, u, 3, 2, neon, 2, 3);
        px(ctx, u, 6, 2, "#f9a", 2, 3);
        px(ctx, u, 9, 6, neon, 2, 3);
        break;
      case "cabinet":
        px(ctx, u, 3, 1, body, 10, 14);
        px(ctx, u, 4, 3, edge, 8, 3);
        px(ctx, u, 4, 7, edge, 8, 3);
        px(ctx, u, 7, 4, neon, 2, 1);
        px(ctx, u, 7, 8, neon, 2, 1);
        break;
      case "desk":
        px(ctx, u, 1, 6, body, 14, 3);
        px(ctx, u, 2, 9, edge, 2, 5);
        px(ctx, u, 12, 9, edge, 2, 5);
        px(ctx, u, 5, 3, neon, 6, 3); // monitor/holograma
        break;
    }
  });
}
