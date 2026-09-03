import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import { publishQueueEvent, registerLocalDeliverer, startQueueEventSubscriber } from "./pubsub";
import { redisSubscriber } from "../config/redis";
import { USER_NOTIFICATION_CHANNEL } from "./notifyUser";

let io: SocketIOServer | null = null;

export function initSocket(httpServer: HTTPServer) {
  io = new SocketIOServer(httpServer, {
  cors: { origin: "http://localhost:5173" },
});

  io.on("connection", (socket) => {
    console.log(`[socket] connected: ${socket.id}`);

    socket.on("join-queue", (queueId: string) => {
      socket.join(`queue:${queueId}`);
    });

    socket.on("leave-queue", (queueId: string) => {
      socket.leave(`queue:${queueId}`);
    });

    // New: users join their own personal room to receive notifications
    // pushed from anywhere — including the worker process.
    socket.on("join-user-room", (userId: string) => {
      socket.join(`user:${userId}`);
    });

    socket.on("disconnect", () => {
      console.log(`[socket] disconnected: ${socket.id}`);
    });
  });

  registerLocalDeliverer((queueId, event, payload) => {
    io?.to(`queue:${queueId}`).emit(event, payload);
  });

  startQueueEventSubscriber();

  // Separate subscription: listens for notifications pushed by the WORKER process,
  // delivers them to the correct user's personal room on THIS instance.
  redisSubscriber.subscribe(USER_NOTIFICATION_CHANNEL, (err) => {
    if (err) {
      console.warn("[socket] failed to subscribe to notification channel:", err.message);
    }
  });

  redisSubscriber.on("message", (channel, raw) => {
    if (channel !== USER_NOTIFICATION_CHANNEL) return;
    try {
      const { userId, notification } = JSON.parse(raw);
      io?.to(`user:${userId}`).emit("NOTIFICATION_CREATED", notification);
    } catch (err) {
      console.warn("[socket] failed to parse notification message:", (err as Error).message);
    }
  });

  return io;
}

export async function emitToQueue(queueId: string, event: string, payload: unknown) {
  await publishQueueEvent(queueId, event, payload);
}