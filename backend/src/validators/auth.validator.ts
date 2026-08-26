type RegisterInput = {
  email?: unknown;
  password?: unknown;
  name?: unknown;
  role?: unknown;
};

type LoginInput = {
  email?: unknown;
  password?: unknown;
};

export function validateRegisterInput(body: RegisterInput) {
  const errors: string[] = [];

  if (typeof body.email !== "string" || !body.email.includes("@")) {
    errors.push("A valid email is required.");
  }
  if (typeof body.password !== "string" || body.password.length < 8) {
    errors.push("Password must be at least 8 characters.");
  }
  if (typeof body.name !== "string" || body.name.trim().length === 0) {
    errors.push("Name is required.");
  }
  if (body.role !== undefined && body.role !== "CUSTOMER" && body.role !== "STAFF") {
    errors.push("Role must be CUSTOMER or STAFF.");
  }

  return errors;
}

export function validateLoginInput(body: LoginInput) {
  const errors: string[] = [];

  if (typeof body.email !== "string" || body.email.length === 0) {
    errors.push("Email is required.");
  }
  if (typeof body.password !== "string" || body.password.length === 0) {
    errors.push("Password is required.");
  }

  return errors;
}