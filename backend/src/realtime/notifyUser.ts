import { redisPublisher } from "../config/redis";

const USER_NOTIFICATION_CHANNEL = "user-notifications";

export async function pushNotificationToUser(userId: string, notification: unknown) {
  try {
    await redisPublisher.publish(
      USER_NOTIFICATION_CHANNEL,
      JSON.stringify({ userId, notification })
    );
  } catch (err) {
    console.warn("[notifyUser] publish failed:", (err as Error).message);
  }
}

export { USER_NOTIFICATION_CHANNEL };