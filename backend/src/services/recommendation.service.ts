import { prisma } from "../config/prisma";
import { getWaitTimeEstimate } from "./aiClient.service";

type RecommendationInput = {
  serviceName: string;
  lat?: number;
  lng?: number;
};

// Haversine formula — straight-line ("as the crow flies") distance between
// two lat/lng points, in kilometers. Deliberately NOT real driving distance —
// a simplification, clearly labeled as such in the response shape.
function haversineDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function getRecommendations(input: RecommendationInput) {
  // Find every OPEN queue whose service name matches, across ALL organizations.
  const services = await prisma.service.findMany({
    where: { name: { equals: input.serviceName, mode: "insensitive" } },
    include: {
      organization: true,
      queues: { where: { status: "OPEN" } },
    },
  });

  const candidates: Array<{
    queueId: string;
    queueName: string;
    organizationId: string;
    organizationName: string;
    distanceKm: number | null;
    waitingCount: number;
    estimatedWaitMinutes: number;
    waitEstimateSource: "ai" | "fallback";
  }> = [];

  for (const service of services) {
    for (const queue of service.queues) {
      const waitingCount = await prisma.queueEntry.count({
        where: { queueId: queue.id, status: "WAITING" },
      });

      const waitEstimate = await getWaitTimeEstimate({
        queueId: queue.id,
        peopleAhead: waitingCount,
        activeCounters: 1,
        serviceType: "general",
      });

      let distanceKm: number | null = null;
      if (
        input.lat !== undefined &&
        input.lng !== undefined &&
        service.organization.latitude !== null &&
        service.organization.longitude !== null
      ) {
        distanceKm = haversineDistanceKm(
          input.lat, input.lng,
          service.organization.latitude!, service.organization.longitude!
        );
      }

      candidates.push({
        queueId: queue.id,
        queueName: queue.name,
        organizationId: service.organization.id,
        organizationName: service.organization.name,
        distanceKm: distanceKm !== null ? Math.round(distanceKm * 10) / 10 : null,
        waitingCount,
        estimatedWaitMinutes: waitEstimate.predictedWaitMinutes,
        waitEstimateSource: waitEstimate.source,
      });
    }
  }

  return rankCandidates(candidates);
}

// Scoring: lower is better. Weighted combination of normalized factors.
// This is plain business logic — no ML here, deliberately, per the "AI recommends,
// backend enforces" rule: the AI only supplied the wait-time NUMBER (Phase 11);
// how we weigh and rank is ordinary, auditable, explainable code.
function rankCandidates<T extends { distanceKm: number | null; estimatedWaitMinutes: number; waitingCount: number }>(
  candidates: T[]
): (T & { score: number })[] {
  const maxWait = Math.max(1, ...candidates.map((c) => c.estimatedWaitMinutes));
  const maxDistance = Math.max(1, ...candidates.map((c) => c.distanceKm ?? 0));

  const scored = candidates.map((c) => {
    const waitScore = c.estimatedWaitMinutes / maxWait; // 0 (best) to 1 (worst)
    const distanceScore = c.distanceKm !== null ? c.distanceKm / maxDistance : 0.5; // neutral if unknown

    // Weights: wait time matters most, distance second — deliberately simple,
    // tunable constants, not learned by any model.
    const WEIGHT_WAIT = 0.6;
    const WEIGHT_DISTANCE = 0.4;

    const score = waitScore * WEIGHT_WAIT + distanceScore * WEIGHT_DISTANCE;
    return { ...c, score: Math.round(score * 1000) / 1000 };
  });

  return scored.sort((a, b) => a.score - b.score); // lower score = better = first
}