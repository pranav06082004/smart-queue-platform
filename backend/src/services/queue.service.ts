import { getCached, setCache, invalidateCache } from "../utils/cache";
import { prisma } from "../config/prisma";
import { QueueError, getQueueWithOwnerOrThrow, assertOwnership } from "./queueOwnership.service";
import { publishEvent } from "../messaging/producer";
import { QUEUE_STATUS_CHANGED } from "../messaging/events";


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

export async function getQueueStatus(queueId: string): Promise<{
  id: string;
  name: string;
  status: string;
  waitingCount: number;
  currentToken: number | null;
  _cacheHit?: boolean; // internal flag, stripped before sending to client — see controller
}> {
  const cacheKey = `queue:status:${queueId}`;

  const cached = await getCached<{
    id: string; name: string; status: string; waitingCount: number; currentToken: number | null;
  }>(cacheKey);

  if (cached) {
    return { ...cached, _cacheHit: true };
  }

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

  const result = {
    id: queue.id,
    name: queue.name,
    status: queue.status,
    waitingCount: queue.entries.length,
    currentToken: currentlyServing?.tokenNumber ?? null,
  };

  await setCache(cacheKey, result);

  return { ...result, _cacheHit: false };
}

async function setStatus(requesterId: string, queueId: string, status: "OPEN" | "PAUSED" | "CLOSED") {
  const queue = await getQueueWithOwnerOrThrow(queueId);
  assertOwnership(queue, requesterId);

  const updated = await prisma.queue.update({ where: { id: queueId }, data: { status } });
  await invalidateQueueStatusCache(queueId);

  // Notify everyone currently WAITING in this queue about the status change.
  const waitingUsers = await prisma.queueEntry.findMany({
    where: { queueId, status: "WAITING" },
    select: { userId: true, id: true },
  });
  for (const entry of waitingUsers) {
    await publishEvent(QUEUE_STATUS_CHANGED, {
      entryId: entry.id,
      queueId,
      userId: entry.userId,
      newStatus: status,
    });
  }

  return updated;
}

export async function invalidateQueueStatusCache(queueId: string) {
  await invalidateCache(`queue:status:${queueId}`);
}
export const openQueue = (requesterId: string, queueId: string) => setStatus(requesterId, queueId, "OPEN");
export const pauseQueue = (requesterId: string, queueId: string) => setStatus(requesterId, queueId, "PAUSED");
export const resumeQueue = (requesterId: string, queueId: string) => setStatus(requesterId, queueId, "OPEN");
export const closeQueue = (requesterId: string, queueId: string) => setStatus(requesterId, queueId, "CLOSED");