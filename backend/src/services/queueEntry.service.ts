import { prisma } from "../config/prisma";
import { QueueError, getQueueWithOwnerOrThrow, assertOwnership } from "./queueOwnership.service";
import { invalidateQueueStatusCache } from "./queue.service";
import { publishEvent } from "../messaging/producer";
import { QUEUE_ENTRY_COMPLETED, QUEUE_ENTRY_SKIPPED, QUEUE_ENTRY_JOINED, QUEUE_ENTRY_CALLED,QUEUE_ENTRY_TURN_APPROACHING } from "../messaging/events";

export class QueueEntryError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

export async function joinQueue(queueId: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const queue = await tx.queue.findUnique({ where: { id: queueId } });
    if (!queue) {
      throw new QueueError("QUEUE_NOT_FOUND", "Queue not found.");
    }
    if (queue.status !== "OPEN") {
      throw new QueueEntryError("QUEUE_NOT_OPEN", "This queue is not currently open.");
    }

    const existingActive = await tx.queueEntry.findFirst({
      where: { queueId, userId, status: "WAITING" },
    });
    if (existingActive) {
      throw new QueueEntryError("ALREADY_IN_QUEUE", "You already have an active entry in this queue.");
    }

    const updatedQueue = await tx.queue.update({
      where: { id: queueId },
      data: { nextToken: { increment: 1 } },
    });
    const assignedToken = updatedQueue.nextToken - 1;

      const entry = await tx.queueEntry.create({
      data: { queueId, userId, tokenNumber: assignedToken, status: "WAITING" },
    });
    await invalidateQueueStatusCache(queueId);

    await publishEvent(QUEUE_ENTRY_JOINED, {
    entryId: entry.id,
    queueId,
    userId: entry.userId,
    tokenNumber: entry.tokenNumber,
  });
    return entry;
  });
}

export async function leaveQueue(entryId: string, userId: string) {
  const entry = await prisma.queueEntry.findUnique({ where: { id: entryId } });
  if (!entry) {
    throw new QueueEntryError("ENTRY_NOT_FOUND", "Queue entry not found.");
  }
  if (entry.userId !== userId) {
    throw new QueueEntryError("FORBIDDEN", "This is not your queue entry.");
  }
  if (entry.status !== "WAITING") {
    throw new QueueEntryError("INVALID_STATE", "Only a waiting entry can be cancelled.");
  }

  const updated = await prisma.queueEntry.update({
    where: { id: entryId },
    data: { status: "CANCELLED" },
  });

  await invalidateQueueStatusCache(entry.queueId);

  return updated;
}

export async function getMyPosition(queueId: string, userId: string) {
  const myEntry = await prisma.queueEntry.findFirst({
    where: { queueId, userId, status: "WAITING" },
  });
  if (!myEntry) {
    throw new QueueEntryError("NOT_IN_QUEUE", "You do not have an active entry in this queue.");
  }

  const peopleAhead = await prisma.queueEntry.count({
    where: { queueId, status: "WAITING", tokenNumber: { lt: myEntry.tokenNumber } },
  });

  return {
    tokenNumber: myEntry.tokenNumber,
    position: peopleAhead + 1,
    peopleAhead,
  };
}

export async function callNext(requesterId: string, queueId: string) {
  const queue = await getQueueWithOwnerOrThrow(queueId);
  assertOwnership(queue, requesterId);

  const result = await prisma.$transaction(async (tx) => {
    const next = await tx.queueEntry.findFirst({
      where: { queueId, status: "WAITING" },
      orderBy: { tokenNumber: "asc" },
    });
    if (!next) {
      throw new QueueEntryError("NO_WAITING_CUSTOMERS", "No customers are currently waiting.");
    }

    return tx.queueEntry.update({
      where: { id: next.id },
      data: { status: "CALLED", calledAt: new Date() },
    });
  });

  await invalidateQueueStatusCache(queueId);

  await publishEvent(QUEUE_ENTRY_CALLED, {
    entryId: result.id,
    queueId,
    userId: result.userId,
    tokenNumber: result.tokenNumber,
  });

  // Simple rule-based "turn approaching" check: anyone now 2nd or 3rd in line
  // (i.e., the next 2 WAITING entries after this call) gets notified.
  // Phase 11 can later replace this fixed threshold with an AI-predicted wait time.
  const upcoming = await prisma.queueEntry.findMany({
    where: { queueId, status: "WAITING" },
    orderBy: { tokenNumber: "asc" },
    take: 2,
  });

  for (const entry of upcoming) {
    await publishEvent(QUEUE_ENTRY_TURN_APPROACHING, {
      entryId: entry.id,
      queueId,
      userId: entry.userId,
      tokenNumber: entry.tokenNumber,
    });
  }

  return result;
}

export async function skipEntry(requesterId: string, queueId: string, entryId: string) {
  const queue = await getQueueWithOwnerOrThrow(queueId);
  assertOwnership(queue, requesterId);

  const entry = await prisma.queueEntry.findUnique({ where: { id: entryId } });
  if (!entry || entry.queueId !== queueId) {
    throw new QueueEntryError("ENTRY_NOT_FOUND", "Queue entry not found in this queue.");
  }

  const updated = await prisma.queueEntry.update({ where: { id: entryId }, data: { status: "SKIPPED" } });

  await invalidateQueueStatusCache(queueId);
  await publishEvent(QUEUE_ENTRY_SKIPPED, {
    entryId: updated.id,
    queueId,
    userId: updated.userId,
    tokenNumber: updated.tokenNumber,
  });

  return updated;
}

export async function completeEntry(requesterId: string, queueId: string, entryId: string) {
  const queue = await getQueueWithOwnerOrThrow(queueId);
  assertOwnership(queue, requesterId);

  const entry = await prisma.queueEntry.findUnique({ where: { id: entryId } });
  if (!entry || entry.queueId !== queueId) {
    throw new QueueEntryError("ENTRY_NOT_FOUND", "Queue entry not found in this queue.");
  }

  const updated = await prisma.queueEntry.update({
    where: { id: entryId },
    data: { status: "COMPLETED", completedAt: new Date() },
  });

  await invalidateQueueStatusCache(queueId);
  await publishEvent(QUEUE_ENTRY_COMPLETED, {
    entryId: updated.id,
    queueId,
    userId: updated.userId,
    tokenNumber: updated.tokenNumber,
  });

  return updated;
}

export async function getQueueHistory(queueId: string) {
  return prisma.queueEntry.findMany({
    where: { queueId, status: { in: ["COMPLETED", "SKIPPED", "CANCELLED"] } },
    orderBy: { joinedAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });
}