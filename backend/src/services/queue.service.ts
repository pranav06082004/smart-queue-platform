import { prisma } from "../config/prisma";
import { QueueError, getQueueWithOwnerOrThrow, assertOwnership } from "./queueOwnership.service";

export { QueueError };

export async function createQueue(requesterId: string, serviceId: string, name: string) {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { organization: true },
  });
  if (!service) {
    throw new QueueError("SERVICE_NOT_FOUND", "Service not found.");
  }
  if (service.organization.ownerId !== requesterId) {
    throw new QueueError("FORBIDDEN", "You do not own this service's organization.");
  }

  return prisma.queue.create({ data: { name, serviceId, status: "CLOSED" } });
}

export async function listQueuesByService(serviceId: string) {
  return prisma.queue.findMany({ where: { serviceId }, orderBy: { createdAt: "desc" } });
}

export async function getQueueStatus(queueId: string) {
  const queue = await prisma.queue.findUnique({
    where: { id: queueId },
    include: {
      entries: { where: { status: "WAITING" }, orderBy: { tokenNumber: "asc" } },
    },
  });
  if (!queue) {
    throw new QueueError("QUEUE_NOT_FOUND", "Queue not found.");
  }

  const currentlyServing = await prisma.queueEntry.findFirst({
    where: { queueId, status: { in: ["CALLED", "SERVING"] } },
    orderBy: { calledAt: "desc" },
  });

  return {
    id: queue.id,
    name: queue.name,
    status: queue.status,
    waitingCount: queue.entries.length,
    currentToken: currentlyServing?.tokenNumber ?? null,
  };
}

async function setStatus(requesterId: string, queueId: string, status: "OPEN" | "PAUSED" | "CLOSED") {
  const queue = await getQueueWithOwnerOrThrow(queueId);
  assertOwnership(queue, requesterId);

  return prisma.queue.update({ where: { id: queueId }, data: { status } });
}

export const openQueue = (requesterId: string, queueId: string) => setStatus(requesterId, queueId, "OPEN");
export const pauseQueue = (requesterId: string, queueId: string) => setStatus(requesterId, queueId, "PAUSED");
export const resumeQueue = (requesterId: string, queueId: string) => setStatus(requesterId, queueId, "OPEN");
export const closeQueue = (requesterId: string, queueId: string) => setStatus(requesterId, queueId, "CLOSED");