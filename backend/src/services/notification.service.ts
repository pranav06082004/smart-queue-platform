import { prisma } from "../config/prisma";

export async function createNotificationIfNew(params: {
  userId: string;
  type: string;
  message: string;
  dedupeKey: string;
}) {
  try {
    const notification = await prisma.notification.create({
      data: params,
    });
    return notification;
  } catch (err: any) {
    // P2002 = unique constraint violation — this exact notification already exists.
    // This is the expected, safe outcome of a redelivered message. Not an error.
    if (err?.code === "P2002") {
      console.log(`[notifications] duplicate suppressed for dedupeKey "${params.dedupeKey}"`);
      return null;
    }
    throw err;
  }
}

export async function getMyNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function markAsRead(notificationId: string, userId: string) {
  const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notification || notification.userId !== userId) {
    throw new Error("NOTIFICATION_NOT_FOUND");
  }
  return prisma.notification.update({ where: { id: notificationId }, data: { read: true } });
}

export async function markAllAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}