type RequestStat = { count: number; totalDurationMs: number; errorCount: number };

const requestStats = new Map<string, RequestStat>();

export function recordRequest(path: string, statusCode: number, durationMs: number) {
  const key = path;
  const existing = requestStats.get(key) ?? { count: 0, totalDurationMs: 0, errorCount: 0 };
  existing.count += 1;
  existing.totalDurationMs += durationMs;
  if (statusCode >= 500) existing.errorCount += 1;
  requestStats.set(key, existing);
}

let queueJoinCount = 0;
let queueAbandonCount = 0;

export function recordQueueJoin() {
  queueJoinCount += 1;
}
export function recordQueueAbandon() {
  queueAbandonCount += 1;
}

export function getMetricsSnapshot() {
  const requests = Array.from(requestStats.entries()).map(([path, stat]) => ({
    path,
    count: stat.count,
    avgDurationMs: Math.round(stat.totalDurationMs / stat.count),
    errorRate: Math.round((stat.errorCount / stat.count) * 1000) / 10,
  }));

  return {
    requests,
    business: {
      queueJoins: queueJoinCount,
      queueAbandons: queueAbandonCount,
      abandonmentRate: queueJoinCount > 0 ? Math.round((queueAbandonCount / queueJoinCount) * 1000) / 10 : 0,
    },
  };
}