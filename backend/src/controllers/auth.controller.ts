import { Request, Response, NextFunction } from "express";
import { registerUser, loginUser, AuthError } from "../services/auth.service";
import { validateRegisterInput, validateLoginInput } from "../validators/auth.validator";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validateRegisterInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: errors.join(" ") },
      });
    }

    const { email, password, name, role } = req.body;
    const result = await registerUser(email, password, name, role);

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    if (error instanceof AuthError) {
      const status = error.code === "EMAIL_ALREADY_EXISTS" ? 409 : 400;
      return res.status(status).json({
        success: false,
        error: { code: error.code, message: error.message },
      });
    }
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validateLoginInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: errors.join(" ") },
      });
    }

    const { email, password } = req.body;
    const result = await loginUser(email, password);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(401).json({
        success: false,
        error: { code: error.code, message: error.message },
      });
    }
    next(error);
  }
}