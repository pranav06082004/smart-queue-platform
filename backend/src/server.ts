import http from "http";
import { createApp } from "./app";
import { env } from "./config/env";
import { initSocket } from "./realtime/socket";
import { startWorker } from "./worker";

const app = createApp();
const httpServer = http.createServer(app);

initSocket(httpServer);

httpServer.listen(env.port, () => {
  console.log(`Backend running on http://localhost:${env.port}`);
});

// Deployment note: on free-tier hosting without background worker support,
// we run the worker in-process alongside the API server. Locally and in a
// proper deployment, `npm run worker` still runs it as a fully separate
// process (see worker.ts) — this is a deliberate, documented trade-off
// for constrained free-tier hosting only.
startWorker().catch((err) => {
  console.error("[worker] failed to start alongside backend:", err);
});