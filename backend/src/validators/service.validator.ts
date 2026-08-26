type ServiceInput = {
  name?: unknown;
  description?: unknown;
};

export function validateServiceInput(body: ServiceInput) {
  const errors: string[] = [];

  if (typeof body.name !== "string" || body.name.trim().length === 0) {
    errors.push("Service name is required.");
  }
  if (body.description !== undefined && typeof body.description !== "string") {
    errors.push("Description must be text.");
  }

  return errors;
}