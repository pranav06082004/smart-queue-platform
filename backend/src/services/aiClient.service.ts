import { env } from "../config/env";

type PredictResult = { predictedWaitMinutes: number; source: "ai" | "fallback" };

function fallbackEstimate(peopleAhead: number, activeCounters: number): number {
  const AVERAGE_SERVICE_MINUTES = 8; // rough, hard-coded — this IS the fallback, deliberately simple
  return Math.round((peopleAhead * AVERAGE_SERVICE_MINUTES) / Math.max(1, activeCounters));
}

export async function getWaitTimeEstimate(params: {
  queueId: string;
  peopleAhead: number;
  activeCounters: number;
  serviceType: string;
}): Promise<PredictResult> {
  const now = new Date();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500); // never let a slow AI service block a queue status read

    const res = await fetch(`${env.aiServiceUrl}/predict/wait-time`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        queueId: params.queueId,
        peopleAhead: params.peopleAhead,
        activeCounters: params.activeCounters,
        serviceType: params.serviceType,
        timeOfDay: now.getHours(),
        dayOfWeek: now.getDay(),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) throw new Error(`AI service returned ${res.status}`);

    const data = await res.json();
    return { predictedWaitMinutes: data.predictedWaitMinutes, source: "ai" };
  } catch (err) {
    console.warn("[ai] prediction failed, using fallback:", (err as Error).message);
    return {
      predictedWaitMinutes: fallbackEstimate(params.peopleAhead, params.activeCounters),
      source: "fallback",
    };
  }
}