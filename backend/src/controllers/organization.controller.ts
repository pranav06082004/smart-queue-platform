import { Request, Response, NextFunction } from "express";
import {
  createOrganization,
  listOrganizations,
  getOrganizationById,
  updateOrganization,
  OrganizationError,
} from "../services/organization.service";
import { validateOrganizationInput } from "../validators/organization.validator";

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validateOrganizationInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: errors.join(" ") } });
    }

    const org = await createOrganization(req.user!.userId, req.body.name, req.body.description);
    res.status(201).json({ success: true, data: org });
  } catch (error) {
    next(error);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const orgs = await listOrganizations();
    res.status(200).json({ success: true, data: orgs });
  } catch (error) {
    next(error);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    const org = await getOrganizationById(req.params.id);
    res.status(200).json({ success: true, data: org });
  } catch (error) {
    if (error instanceof OrganizationError) {
      return res.status(404).json({ success: false, error: { code: error.code, message: error.message } });
    }
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validateOrganizationInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: errors.join(" ") } });
    }

    const org = await updateOrganization(req.params.id, req.user!.userId, req.body);
    res.status(200).json({ success: true, data: org });
  } catch (error) {
    if (error instanceof OrganizationError) {
      const status = error.code === "FORBIDDEN" ? 403 : 404;
      return res.status(status).json({ success: false, error: { code: error.code, message: error.message } });
    }
    next(error);
  }
}