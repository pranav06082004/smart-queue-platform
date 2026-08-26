import { Request, Response, NextFunction } from "express";
import {
  createService,
  listServicesByOrganization,
  updateService,
  deleteService,
  ServiceError,
} from "../services/service.service";
import { OrganizationError } from "../services/organization.service";
import { validateServiceInput } from "../validators/service.validator";

function handleError(error: unknown, res: Response, next: NextFunction) {
  if (error instanceof ServiceError || error instanceof OrganizationError) {
    const status = error.code === "FORBIDDEN" ? 403 : 404;
    return res.status(status).json({ success: false, error: { code: error.code, message: error.message } });
  }
  next(error);
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validateServiceInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: errors.join(" ") } });
    }

    const service = await createService(
      req.params.id,
      req.user!.userId,
      req.body.name,
      req.body.description
    );
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const services = await listServicesByOrganization(req.params.id);
    res.status(200).json({ success: true, data: services });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validateServiceInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: errors.join(" ") } });
    }

    const service = await updateService(req.params.id, req.user!.userId, req.body);
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteService(req.params.id, req.user!.userId);
    res.status(200).json({ success: true, data: { deleted: true } });
  } catch (error) {
    handleError(error, res, next);
  }
}