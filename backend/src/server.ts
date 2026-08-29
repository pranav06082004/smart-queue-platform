import http from "http";
import { createApp } from "./app";
import { env } from "./config/env";
import { initSocket } from "./realtime/socket";

const app = createApp();
const httpServer = http.createServer(app);

initSocket(httpServer);

httpServer.listen(env.port, () => {
  console.log(`Backend running on http://localhost:${env.port}`);
});