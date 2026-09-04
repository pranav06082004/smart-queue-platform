import { prisma } from "../config/prisma";

export class QueueError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

export async function getQueueWithOwnerOrThrow(queueId: string) {
  const queue = await prisma.queue.findUnique({
    where: { id: queueId },
    include: { service: { include: { organization: true } } },
  });
  if (!queue) {
    throw new QueueError("QUEUE_NOT_FOUND", "Queue not found.");
  }
  return queue;
}

export function assertOwnership(
  queue: { service: { organization: { ownerId: string } } },
  requesterId: string
) {
  if (queue.service.organization.ownerId !== requesterId) {
    throw new QueueError("FORBIDDEN", "You do not own this queue's organization.");
  }
}