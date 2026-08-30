import { getChannel } from "./config/rabbitmq";
import { MAIN_QUEUE, RETRY_QUEUE, DEAD_LETTER_QUEUE, QUEUE_ENTRY_COMPLETED, QUEUE_ENTRY_SKIPPED } from "./messaging/events";
import type { ConsumeMessage, Channel } from "amqplib";

const MAX_ATTEMPTS = 3;

async function processMessage(eventType: string, payload: unknown) {
  // This is intentionally simple for Phase 9 — Phase 10 replaces this
  // with real notification creation/delivery logic.
  switch (eventType) {
    case QUEUE_ENTRY_COMPLETED:
      console.log(`[worker] processing: entry completed →`, payload);
      break;
    case QUEUE_ENTRY_SKIPPED:
      console.log(`[worker] processing: entry skipped →`, payload);
      break;
    default:
      console.log(`[worker] unknown event type "${eventType}", ignoring`);
  }
}

function handleFailure(channel: Channel, msg: ConsumeMessage, attempts: number) {
  if (attempts >= MAX_ATTEMPTS) {
    console.warn(`[worker] message failed ${attempts} times, sending to dead-letter queue`);
    channel.sendToQueue(
      DEAD_LETTER_QUEUE,
      msg.content,
      { persistent: true }
    );
  } else {
    console.warn(`[worker] message failed (attempt ${attempts}), scheduling retry in 10s`);
    const retried = JSON.parse(msg.content.toString());
    retried.attempts = attempts;
    channel.sendToQueue(
      RETRY_QUEUE,
      Buffer.from(JSON.stringify(retried)),
      { persistent: true }
    );
  }
  channel.ack(msg); // remove the original message either way — we've re-routed it ourselves
}

async function startWorker() {
  const channel = await getChannel();

  // Only pull one message at a time before requiring an ack —
  // prevents one worker from grabbing a huge batch and hoarding messages
  // if we ever run multiple worker instances.
  channel.prefetch(1);

  console.log(`[worker] listening on "${MAIN_QUEUE}"...`);

  channel.consume(MAIN_QUEUE, async (msg) => {
    if (!msg) return;

    let parsed: { eventType: string; payload: unknown; attempts: number };
    try {
      parsed = JSON.parse(msg.content.toString());
    } catch {
      console.warn("[worker] received unparseable message, discarding");
      channel.ack(msg);
      return;
    }

    try {
      await processMessage(parsed.eventType, parsed.payload);
      channel.ack(msg); // success — RabbitMQ can now permanently remove this message
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