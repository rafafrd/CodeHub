import { Request, Response } from "express";

import { eventBus, GAMIFICATION_EVENT } from "../events/event-bus";

/**
 * Endpoint SSE (`GET /api/events`): mantém a conexão aberta e empurra os
 * resultados de gamificação em tempo real para a UI (CU03).
 */
export function gamificationSse(req: Request, res: Response): void {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no", // Nginx: desliga buffering para este stream
  });
  res.write(": connected\n\n");

  const onEvent = (payload: unknown): void => {
    res.write(`event: gamification\ndata: ${JSON.stringify(payload)}\n\n`);
  };
  eventBus.on(GAMIFICATION_EVENT, onEvent);

  // Heartbeat para proxies não derrubarem a conexão ociosa.
  const heartbeat = setInterval(() => res.write(": ping\n\n"), 25_000);

  req.on("close", () => {
    clearInterval(heartbeat);
    eventBus.off(GAMIFICATION_EVENT, onEvent);
    res.end();
  });
}
