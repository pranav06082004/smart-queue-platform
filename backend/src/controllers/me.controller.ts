import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) {
      return res.status(404).json({ success: false, error: { code: "USER_NOT_FOUND", message: "User not found." } });
    }
    res.status(200).json({
      success: true,
      data: { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyOrganizations(req: Request, res: Response, next: NextFunction) {
  try {
    const orgs = await prisma.organization.findMany({
      where: { ownerId: req.user!.userId },
      orderBy: { createdAt: "desc" },
      include: { services: { include: { queues: true } } },
    });
    res.status(200).json({ success: true, data: orgs });
  } catch (error) {
    next(error);
  }
}

export async function getMyQueueEntries(req: Request, res: Response, next: NextFunction) {
  try {
    const entries = await prisma.queueEntry.findMany({
      where: { userId: req.user!.userId, status: { in: ["WAITING", "CALLED", "SERVING"] } },
      orderBy: { joinedAt: "desc" },
      include: { queue: { include: { service: { include: { organization: true } } } } },
    });
    res.status(200).json({ success: true, data: entries });
  } catch (error) {
    next(error);
  }
}