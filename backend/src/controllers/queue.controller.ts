import { Request, Response, NextFunction } from "express";
import { emitToQueue } from "../realtime/socket";
import { QUEUE_UPDATED, TOKEN_CALLED } from "../realtime/events";

import {
  createQueue,
  listQueuesByService,
  getQueueStatus,
  openQueue,
  pauseQueue,
  resumeQueue,
  closeQueue,
  QueueError,
} from "../services/queue.service";

import {
  joinQueue,
  leaveQueue,
  getMyPosition,
  callNext,
  skipEntry,
  completeEntry,
  getQueueHistory,
  QueueEntryError,
} from "../services/queueEntry.service";
import { validateQueueInput } from "../validators/queue.validator";


function handleError(error: unknown, res: Response, next: NextFunction) {
  if (error instanceof QueueError || error instanceof QueueEntryError) {
    const status = error.code === "FORBIDDEN" ? 403 : error.code.includes("NOT_FOUND") ? 404 : 400;
    return res.status(status).json({ success: false, error: { code: error.code, message: error.message } });
  }
  next(error);
}

async function broadcastQueueUpdate(queueId: string) {
  try {
    const status = await getQueueStatus(queueId);
    emitToQueue(queueId, QUEUE_UPDATED, status);
  } catch {
    // If the queue was somehow deleted mid-broadcast, just skip silently.
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validateQueueInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: errors.join(" ") } });
    }
    const queue = await createQueue(req.user!.userId, req.body.serviceId, req.body.name);
    res.status(201).json({ success: true, data: queue });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function listByService(req: Request, res: Response, next: NextFunction) {
  try {
    const queues = await listQueuesByService(req.params.id);
    res.status(200).json({ success: true, data: queues });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function status(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getQueueStatus(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function open(req: Request, res: Response, next: NextFunction) {
  try {
    const queue = await openQueue(req.user!.userId, req.params.id);
    res.status(200).json({ success: true, data: queue });
    await broadcastQueueUpdate(req.params.id);
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function pause(req: Request, res: Response, next: NextFunction) {
  try {
    const queue = await pauseQueue(req.user!.userId, req.params.id);
    res.status(200).json({ success: true, data: queue });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function resume(req: Request, res: Response, next: NextFunction) {
  try {
    const queue = await resumeQueue(req.user!.userId, req.params.id);
    res.status(200).json({ success: true, data: queue });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function close(req: Request, res: Response, next: NextFunction) {
  try {
    const queue = await closeQueue(req.user!.userId, req.params.id);
    res.status(200).json({ success: true, data: queue });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function join(req: Request, res: Response, next: NextFunction) {
  try {
    const entry = await joinQueue(req.params.id, req.user!.userId);
    res.status(201).json({ success: true, data: entry });
    await broadcastQueueUpdate(req.params.id);
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function leave(req: Request, res: Response, next: NextFunction) {
  try {
    const entry = await leaveQueue(req.body.entryId, req.user!.userId);
    res.status(200).json({ success: true, data: entry });
    await broadcastQueueUpdate(entry.queueId);
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function myPosition(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getMyPosition(req.params.id, req.user!.userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function next(req: Request, res: Response, next: NextFunction) {
  try {
    const entry = await callNext(req.user!.userId, req.params.id);
    res.status(200).json({ success: true, data: entry });
    emitToQueue(req.params.id, TOKEN_CALLED, entry);
    await broadcastQueueUpdate(req.params.id);
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function skip(req: Request, res: Response, next: NextFunction) {
  try {
    const entry = await skipEntry(req.user!.userId, req.params.id, req.params.entryId);
    res.status(200).json({ success: true, data: entry });
    await broadcastQueueUpdate(req.params.id);
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function complete(req: Request, res: Response, next: NextFunction) {
  try {
    const entry = await completeEntry(req.user!.userId, req.params.id, req.params.entryId);
    res.status(200).json({ success: true, data: entry });
    await broadcastQueueUpdate(req.params.id);
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function history(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getQueueHistory(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    handleError(error, res, next);
  }
}