import { prisma } from "../config/prisma";

export class QueueError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

// Queue Service, after extraction — this is what the code WOULD need to look like:
async function getQueueWithOwnerOrThrow(queueId: string) {
  const queue = await prisma.queue.findUnique({ where: { id: queueId }, include: { service: true } });
  if (!queue) throw new QueueError("QUEUE_NOT_FOUND", "...");

  // This single Prisma include becomes a NETWORK CALL to the Organization Service:
  const organization = await fetch(`http://organization-service/organizations/${queue.service.organizationId}`)
    .then(res => res.json());

  return { ...queue, organization }; // reassembled, not joined
}

export function assertOwnership(
  queue: { service: { organization: { ownerId: string } } },
  requesterId: string
) {
  if (queue.service.organization.ownerId !== requesterId) {
    throw new QueueError("FORBIDDEN", "You do not own this queue's organization.");
  }
}