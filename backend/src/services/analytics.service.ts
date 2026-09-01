import { prisma } from "../config/prisma";
import { getDemandForecast } from "./aiClient.service";
import { getQueueWithOwnerOrThrow, assertOwnership } from "./queueOwnership.service";

export async function getDemandForecastForQueue(requesterId: string, queueId: string, serviceType = "general") {
  const queue = await getQueueWithOwnerOrThrow(queueId);
  assertOwnership(queue, requesterId);

  const today = new Date().getDay();
  const forecast = [];

  for (let hour = 0; hour < 24; hour++) {
    const result = await getDemandForecast({ timeOfDay: hour, dayOfWeek: today, serviceType });
    forecast.push({ hour, ...result });
  }

  return forecast;
}

export async function getQueueAnalytics(requesterId: string, queueId: string) {
  const queue = await getQueueWithOwnerOrThrow(queueId);
  assertOwnership(queue, requesterId);

  const allEntries = await prisma.queueEntry.findMany({ where: { queueId } });

  const completed = allEntries.filter((e) => e.status === "COMPLETED" && e.calledAt);
  const cancelled = allEntries.filter((e) => e.status === "CANCELLED");

  const avgWaitMinutes =
    completed.length > 0
      ? completed.reduce((sum, e) => sum + (e.calledAt!.getTime() - e.joinedAt.getTime()) / 60000, 0) / completed.length
      : 0;

  const avgServiceMinutes =
    completed.filter((e) => e.completedAt).length > 0
      ? completed
          .filter((e) => e.completedAt)
          .reduce((sum, e) => sum + (e.completedAt!.getTime() - e.calledAt!.getTime()) / 60000, 0) /
        completed.filter((e) => e.completedAt).length
      : 0;

  const abandonmentRate = allEntries.length > 0 ? cancelled.length / allEntries.length : 0;

  // Peak hours: group joins by hour of day, find the busiest.
  const hourCounts: Record<number, number> = {};
  for (const e of allEntries) {
    const hour = e.joinedAt.getHours();
    hourCounts[hour] = (hourCounts[hour] ?? 0) + 1;
  }
  const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];

  return {
    totalJoins: allEntries.length,
    totalCompleted: completed.length,
    totalCancelled: cancelled.length,
    avgWaitMinutes: Math.round(avgWaitMinutes * 10) / 10,
    avgServiceMinutes: Math.round(avgServiceMinutes * 10) / 10,
    abandonmentRate: Math.round(abandonmentRate * 1000) / 10, // percentage, 1 decimal
    peakHour: peakHour ? { hour: Number(peakHour[0]), count: peakHour[1] } : null,
  };
}