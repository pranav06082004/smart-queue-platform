import { prisma } from "../config/prisma";

export class OrganizationError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

export async function createOrganization(ownerId: string, name: string, description?: string) {
  return prisma.organization.create({
    data: { name, description, ownerId },
  });
}

export async function listOrganizations() {
  return prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrganizationById(id: string) {
  const org = await prisma.organization.findUnique({ where: { id } });
  if (!org) {
    throw new OrganizationError("ORGANIZATION_NOT_FOUND", "Organization not found.");
  }
  return org;
}

export async function updateOrganization(
  id: string,
  requesterId: string,
  updates: { name?: string; description?: string }
) {
  const org = await getOrganizationById(id);

  if (org.ownerId !== requesterId) {
    throw new OrganizationError("FORBIDDEN", "You do not own this organization.");
  }

  return prisma.organization.update({
    where: { id },
    data: updates,
  });
}