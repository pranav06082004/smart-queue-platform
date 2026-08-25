import { PrismaClient } from "@prisma/client";

// Single shared Prisma instance for the whole app.
// Avoids exhausting DB connections by creating a new client per request.
export const prisma = new PrismaClient();