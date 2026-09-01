import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api";

type ForecastHour = { hour: number; demandLevel: string; source: string };
type Analytics = {
  totalJoins: number; totalCompleted: number; totalCancelled: number;
  avgWaitMinutes: number; avgServiceMinutes: number; abandonmentRate: number;
  peakHour: { hour: number; count: number } | null;
};

const LEVEL_COLORS: Record<string, string> = {
  LOW: "bg-green-100 text-green-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-orange-100 text-orange-700",
  VERY_HIGH: "bg-red-100 text-red-700",
};

export default function StaffAnalyticsPage() {
  const { id } = useParams();
  const [forecast, setForecast] = useState<ForecastHour[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    api.get(`/queues/${id}/demand-forecast`).then((res) => setForecast(res.data.data));
    api.get(`/queues/${id}/analytics`).then((res) => setAnalytics(res.data.data));
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">Analytics & Forecast</h1>

        {analytics && (
          <div className="bg-white shadow rounded-lg p-6 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div><p className="text-slate-400">Total Joins</p><p className="text-xl font-semibold">{analytics.totalJoins}</p></div>
            <div><p className="text-slate-400">Completed</p><p className="text-xl font-semibold">{analytics.totalCompleted}</p></div>
            <div><p className="text-slate-400">Cancelled</p><p className="text-xl font-semibold">{analytics.totalCancelled}</p></div>
            <div><p className="text-slate-400">Avg Wait</p><p className="text-xl font-semibold">{analytics.avgWaitMinutes}m</p></div>
            <div><p className="text-slate-400">Avg Service</p><p className="text-xl font-semibold">{analytics.avgServiceMinutes}m</p></div>
            <div><p className="text-slate-400">Abandonment</p><p className="text-xl font-semibold">{analytics.abandonmentRate}%</p></div>
            {analytics.peakHour && (
              <div className="col-span-2 md:col-span-3">
                <p className="text-slate-400">Peak Hour</p>
                <p className="text-xl font-semibold">{analytics.peakHour.hour}:00 ({analytics.peakHour.count} joins)</p>
              </div>
            )}
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="font-medium mb-3">Today's Demand Forecast</h2>
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
            {forecast.map((f) => (
              <div key={f.hour} className={`rounded p-2 text-center text-xs ${LEVEL_COLORS[f.demandLevel] ?? "bg-slate-100"}`}>
                <div>{f.hour}:00</div>
                <div className="font-medium">{f.demandLevel.replace("_", " ")}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}