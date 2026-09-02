import { prisma } from "../config/prisma";
import type { RawLlmIntent } from "../services/llmClient.service";

export type ValidatedIntent = {
  serviceName: string | null;
  maxWaitMinutes: number | null;
};

const MAX_REASONABLE_WAIT_MINUTES = 240; // 4 hours — anything above this is almost certainly a misparse

export async function validateIntent(raw: RawLlmIntent | null): Promise<ValidatedIntent> {
  if (!raw) {
    return { serviceName: null, maxWaitMinutes: null };
  }

  let validatedServiceName: string | null = null;

  if (raw.serviceName) {
    // CRITICAL: never trust the LLM's serviceName string directly for a database search.
    // We only accept it if it actually matches a REAL service that exists in our database —
    // otherwise we'd be running an uncontrolled, LLM-authored query against Postgres.
    const match = await prisma.service.findFirst({
      where: { name: { contains: raw.serviceName, mode: "insensitive" } },
    });
    validatedServiceName = match ? match.name : null; // use OUR database's real name, not the LLM's version
  }

  let validatedMaxWait: number | null = null;
  if (
    typeof raw.maxWaitMinutes === "number" &&
    Number.isFinite(raw.maxWaitMinutes) &&
    raw.maxWaitMinutes > 0 &&
    raw.maxWaitMinutes <= MAX_REASONABLE_WAIT_MINUTES
  ) {
    validatedMaxWait = Math.round(raw.maxWaitMinutes);
  }

  return { serviceName: validatedServiceName, maxWaitMinutes: validatedMaxWait };
}