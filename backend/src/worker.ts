import { getChannel } from "./config/rabbitmq";
import {
  MAIN_QUEUE,
  RETRY_QUEUE,
  DEAD_LETTER_QUEUE,
  QUEUE_ENTRY_COMPLETED,
  QUEUE_ENTRY_SKIPPED,
  QUEUE_ENTRY_JOINED,
  QUEUE_ENTRY_CALLED,
  QUEUE_ENTRY_TURN_APPROACHING,
  QUEUE_STATUS_CHANGED,
} from "./messaging/events";
import { createNotificationIfNew } from "./services/notification.service";
import { pushNotificationToUser } from "./realtime/notifyUser";
import type { ConsumeMessage, Channel } from "amqplib";

const MAX_ATTEMPTS = 3;

function buildNotification(eventType: string, payload: any): { type: string; message: string; dedupeKey: string } | null {
  switch (eventType) {
    case QUEUE_ENTRY_JOINED:
      return {
        type: "QUEUE_JOINED",
        message: `You joined the queue. Your token is #${payload.tokenNumber}.`,
        dedupeKey: `joined:${payload.entryId}`,
      };
    case QUEUE_ENTRY_CALLED:
      return {
        type: "YOUR_TURN",
        message: `It's your turn now! Token #${payload.tokenNumber}.`,
        dedupeKey: `called:${payload.entryId}`,
      };
    case QUEUE_ENTRY_TURN_APPROACHING:
      return {
        type: "TURN_APPROACHING",
        message: `Your turn is coming up soon — token #${payload.tokenNumber}.`,
        dedupeKey: `approaching:${payload.entryId}`,
      };
    case QUEUE_ENTRY_COMPLETED:
      return {
        type: "SERVICE_COMPLETED",
        message: `Your service is complete. Thank you!`,
        dedupeKey: `completed:${payload.entryId}`,
      };
    case QUEUE_ENTRY_SKIPPED:
      return {
        type: "SKIPPED",
        message: `You were skipped. Please check with staff.`,
        dedupeKey: `skipped:${payload.entryId}`,
      };
    case QUEUE_STATUS_CHANGED:
      return {
        type: "QUEUE_STATUS_CHANGED",
        message: `The queue status changed to ${payload.newStatus}.`,
        dedupeKey: `status:${payload.entryId}:${payload.newStatus}`,
      };
    default:
      return null;
  }
}

async function processMessage(eventType: string, payload: any) {
  const built = buildNotification(eventType, payload);
  if (!built || !payload.userId) {
    console.log(`[worker] no notification mapping for "${eventType}", skipping`);
    return;
  }

  const notification = await createNotificationIfNew({
    userId: payload.userId,
    type: built.type,
    message: built.message,
    dedupeKey: built.dedupeKey,
  });

  if (notification) {
    console.log(`[worker] created notification: ${built.type} for user ${payload.userId}`);
    pushNotificationToUser(payload.userId, notification);
  }
  // If notification is null, it was a safely-suppressed duplicate — nothing more to do.
}

function handleFailure(channel: Channel, msg: ConsumeMessage, attempts: number) {
  if (attempts >= MAX_ATTEMPTS) {
    console.warn(`[worker] message failed ${attempts} times, sending to dead-letter queue`);
    channel.sendToQueue(DEAD_LETTER_QUEUE, msg.content, { persistent: true });
  } else {
    console.warn(`[worker] message failed (attempt ${attempts}), scheduling retry in 10s`);
    const retried = JSON.parse(msg.content.toString());
    retried.attempts = attempts;
    channel.sendToQueue(RETRY_QUEUE, Buffer.from(JSON.stringify(retried)), { persistent: true });
  }
  channel.ack(msg);
}

async function startWorker() {
  const channel = await getChannel();
  channel.prefetch(1);

  console.log(`[worker] listening on "${MAIN_QUEUE}"...`);

  channel.consume(MAIN_QUEUE, async (msg) => {
    if (!msg) return;

    let parsed: { eventType: string; payload: any; attempts: number };
    try {
      parsed = JSON.parse(msg.content.toString());
    } catch {
      console.warn("[worker] received unparseable message, discarding");
      channel.ack(msg);
      return;
    }

    try {
      await processMessage(parsed.eventType, parsed.payload);
      channel.ack(msg);
    } catch (err) {
      console.warn(`[worker] processing failed:`, (err as Error).message);
      handleFailure(channel, msg, (parsed.attempts ?? 0) + 1);
    }
  });
}

startWorker().catch((err) => {
  console.error("[worker] fatal startup error:", err);
  process.exit(1);
});