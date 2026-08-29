import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";

let io: SocketIOServer | null = null;

export function initSocket(httpServer: HTTPServer) {
  io = new SocketIOServer(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log(`[socket] connected: ${socket.id}`);

    socket.on("join-queue", (queueId: string) => {
      socket.join(`queue:${queueId}`);
    });

    socket.on("leave-queue", (queueId: string) => {
      socket.leave(`queue:${queueId}`);
    });

    socket.on("disconnect", () => {
      console.log(`[socket] disconnected: ${socket.id}`);
      // No cleanup needed here — Socket.IO automatically removes
      // this socket from every room it had joined.
    });
  });

  return io;
}

export function emitToQueue(queueId: string, event: string, payload: unknown) {
  if (!io) {
    console.warn("Socket.IO not initialized — skipping emit.");
    return;
  }
  io.to(`queue:${queueId}`).emit(event, payload);
}