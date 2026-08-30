import { redisPublisher, redisSubscriber } from "../config/redis";

const CHANNEL = "queue-events";

type QueueEventMessage = {
  queueId: string;
  event: string;
  payload: unknown;
};

// The function every backend instance registers to actually deliver
// a received message to its own locally-connected WebSocket clients.
type LocalDeliverFn = (queueId: string, event: string, payload: unknown) => void;

let localDeliver: LocalDeliverFn | null = null;

export function registerLocalDeliverer(fn: LocalDeliverFn) {
  localDeliver = fn;
}

export async function publishQueueEvent(queueId: string, event: string, payload: unknown) {
  const message: QueueEventMessage = { queueId, event, payload };
  try {
    await redisPublisher.publish(CHANNEL, JSON.stringify(message));
  } catch (err) {
    console.warn("[pubsub] publish failed, event may not reach other instances:", (err as Error).message);
    // Fail open: still try to deliver locally, so at least THIS instance's
    // connected clients get the update even if Redis is down.
    localDeliver?.(queueId, event, payload);
  }
}

export function startQueueEventSubscriber() {
  redisSubscriber.subscribe(CHANNEL, (err) => {
    if (err) {
      console.warn("[pubsub] failed to subscribe:", err.message);
      return;
    }
    console.log(`[pubsub] subscribed to "${CHANNEL}"`);
  });

  redisSubscriber.on("message", (channel, raw) => {
    if (channel !== CHANNEL) return;
    try {
      const message: QueueEventMessage = JSON.parse(raw);
      localDeliver?.(message.queueId, message.event, message.payload);
    } catch (err) {
      console.warn("[pubsub] failed to parse message:", (err as Error).message);
    }
  });
}