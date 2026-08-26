import { prisma } from "../config/prisma";
import { getOrganizationById, OrganizationError } from "./organization.service";

export class ServiceError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

export async function createService(
  organizationId: string,
  requesterId: string,
  name: string,
  description?: string
) {
  const org = await getOrganizationById(organizationId);

  if (org.ownerId !== requesterId) {
    throw new ServiceError("FORBIDDEN", "You do not own this organization.");
  }

  return prisma.service.create({
    data: { name, description, organizationId },
  });
}

export async function listServicesByOrganization(organizationId: string) {
  return prisma.service.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });
}

async function getServiceOrThrow(id: string) {
  const service = await prisma.service.findUnique({
    where: { id },
    include: { organization: true },
  });
  if (!service) {
    throw new ServiceError("SERVICE_NOT_FOUND", "Service not found.");
  }
  return service;
}

export async function updateService(
  id: string,
  requesterId: string,
  updates: { name?: string; description?: string }
) {
  const service = await getServiceOrThrow(id);

  if (service.organization.ownerId !== requesterId) {
    throw new ServiceError("FORBIDDEN", "You do not own this service's organization.");
  }

  return prisma.service.update({ where: { id }, data: updates });
}

export async function deleteService(id: string, requesterId: string) {
  const service = await getServiceOrThrow(id);

  if (service.organization.ownerId !== requesterId) {
    throw new ServiceError("FORBIDDEN", "You do not own this service's organization.");
  }

  await prisma.service.delete({ where: { id } });
}