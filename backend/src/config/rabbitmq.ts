import amqp, { Channel, ChannelModel } from "amqplib";
import { env } from "./env";
import { MAIN_QUEUE, RETRY_QUEUE, DEAD_LETTER_QUEUE } from "../messaging/events";

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

export async function getChannel(): Promise<Channel> {
  if (channel) return channel;

  connection = await amqp.connect(env.rabbitmqUrl);
  channel = await connection.createChannel();

  // Dead-letter queue: where messages end up after too many failed attempts.
  // No special routing needed here — it's just a normal queue we manually inspect/handle.
  await channel.assertQueue(DEAD_LETTER_QUEUE, { durable: true });

  // Retry queue: messages sit here briefly (via TTL) before being routed back to the main queue.
  // This is how we implement "wait a bit, then try again" without a separate scheduler.
  await channel.assertQueue(RETRY_QUEUE, {
    durable: true,
    arguments: {
      "x-message-ttl": 10000, // wait 10 seconds in the retry queue
      "x-dead-letter-exchange": "", // after TTL expires, route back to...
      "x-dead-letter-routing-key": MAIN_QUEUE, // ...the main queue, for another attempt
    },
  });

  // Main queue: where the worker actually consumes from.
  await channel.assertQueue(MAIN_QUEUE, { durable: true });

  connection.on("error", (err) => {
    console.warn("[rabbitmq] connection error:", err.message);
    channel = null;
    connection = null;
  });

  connection.on("close", () => {
    console.warn("[rabbitmq] connection closed");
    channel = null;
    connection = null;
  });

  console.log("[rabbitmq] connected, queues asserted");
  return channel;
}