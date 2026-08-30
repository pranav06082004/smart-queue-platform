import { Request, Response, NextFunction } from "express";
import { getMyNotifications, markAsRead, markAllAsRead } from "../services/notification.service";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const notifications = await getMyNotifications(req.user!.userId);
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
}

export async function markOneRead(req: Request, res: Response, next: NextFunction) {
  try {
    const notification = await markAsRead(req.params.id, req.user!.userId);
    res.status(200).json({ success: true, data: notification });
  } catch (error: any) {
    if (error.message === "NOTIFICATION_NOT_FOUND") {
      return res.status(404).json({ success: false, error: { code: "NOTIFICATION_NOT_FOUND", message: "Notification not found." } });
    }
    next(error);
  }
}

export async function markAllRead(req: Request, res: Response, next: NextFunction) {
  try {
    await markAllAsRead(req.user!.userId);
    res.status(200).json({ success: true, data: { updated: true } });
  } catch (error) {
    next(error);
  }
}