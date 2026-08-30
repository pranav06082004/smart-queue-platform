import { getChannel } from "../config/rabbitmq";
import { MAIN_QUEUE } from "./events";

export async function publishEvent(eventType: string, payload: unknown) {
  try {
    const channel = await getChannel();
    const message = { eventType, payload, attempts: 0 };

    channel.sendToQueue(MAIN_QUEUE, Buffer.from(JSON.stringify(message)), {
      persistent: true, // survive a RabbitMQ restart, not just stay in memory
    });
  } catch (err) {
    // Fail open, same philosophy as Redis: a broker hiccup should never
    // break the actual queue operation that triggered this side-effect.
    console.warn(`[producer] failed to publish "${eventType}", continuing without it:`, (err as Error).message);
  }
}