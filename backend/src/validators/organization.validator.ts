type OrgInput = {
  name?: unknown;
  description?: unknown;
};

export function validateOrganizationInput(body: OrgInput) {
  const errors: string[] = [];

  if (typeof body.name !== "string" || body.name.trim().length === 0) {
    errors.push("Organization name is required.");
  }
  if (body.description !== undefined && typeof body.description !== "string") {
    errors.push("Description must be text.");
  }

  return errors;
}