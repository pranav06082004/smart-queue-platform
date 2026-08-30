import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import { publishQueueEvent, registerLocalDeliverer, startQueueEventSubscriber } from "./pubsub";

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
    });
  });

  // This is the function that actually delivers to THIS instance's
  // locally-connected sockets, regardless of where the event originated.
  registerLocalDeliverer((queueId, event, payload) => {
    io?.to(`queue:${queueId}`).emit(event, payload);
  });

  startQueueEventSubscriber();

  return io;
}

// This is now called by controllers, same signature as Phase 6 —
// but internally it publishes to Redis instead of emitting directly.
export async function emitToQueue(queueId: string, event: string, payload: unknown) {
  await publishQueueEvent(queueId, event, payload);
}