import { EventEmitter } from "node:events";

/**
 * Barramento de eventos in-process. Usado para empurrar os resultados de
 * gamificação para os clientes conectados via SSE (CU03).
 */
export const GAMIFICATION_EVENT = "gamification";

export const eventBus = new EventEmitter();
// Vários clientes SSE podem assinar simultaneamente.
eventBus.setMaxListeners(50);
