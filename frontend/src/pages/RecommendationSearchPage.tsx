import { useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

type Result = {
  queueId: string; queueName: string; organizationId: string; organizationName: string;
  distanceKm: number | null; waitingCount: number; estimatedWaitMinutes: number;
  waitEstimateSource: string; score: number;
};

export default function RecommendationSearchPage() {
  const { user } = useAuth();
  const [serviceName, setServiceName] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  function useMyLocation() {
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setError("Could not get your location — searching without distance ranking.")
    );
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const params: any = { serviceName };
      if (coords) { params.lat = coords.lat; params.lng = coords.lng; }
      const res = await api.get("/recommendations", { params });
      setResults(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? "Search failed.");
    }
  }

  async function handleJoin(queueId: string) {
    setMessage(null);
    setError(null);
    try {
      // IMPORTANT: this calls the exact same join endpoint as manual browsing.
      // The recommendation ranking has no special power to join on your behalf.
      const res = await api.post(`/queues/${queueId}/join`);
      setMessage(`Joined! Your token is #${res.data.data.tokenNumber}.`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? "Could not join.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Find the Best Queue</h1>

        <form onSubmit={handleSearch} className="bg-white shadow rounded-lg p-4 mb-6 space-y-3">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Service name (e.g. General Consultation)"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
          />
          <div className="flex gap-2 items-center">
            <button type="button" onClick={useMyLocation} className="text-sm text-blue-600">
              📍 Use my location {coords && "(set)"}
            </button>
          </div>
          <button type="submit" className="bg-slate-900 text-white rounded px-4 py-2 text-sm">Search</button>
        </form>

        {error && <p className="text-red-600 mb-4">{error}</p>}
        {message && <p className="text-green-600 mb-4">{message}</p>}

        <div className="space-y-3">
          {results.map((r, i) => (
            <div key={r.queueId} className="bg-white shadow rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">
                  {i === 0 && <span className="text-green-600 mr-2">★ Best match</span>}
                  {r.organizationName} — {r.queueName}
                </p>
                <p className="text-sm text-slate-500">
                  {r.distanceKm !== null && `${r.distanceKm} km · `}
                  {r.waitingCount} waiting · ~{r.estimatedWaitMinutes}m wait
                  {r.waitEstimateSource === "fallback" && " (estimate)"}
                </p>
              </div>
              {user?.role === "CUSTOMER" && (
                <button onClick={() => handleJoin(r.queueId)} className="bg-slate-900 text-white text-sm px-3 py-1.5 rounded">
                  Join
                </button>
              )}
            </div>
          ))}
          {results.length === 0 && <p className="text-slate-400">Search for a service to see ranked queues.</p>}
        </div>
      </div>
    </div>
  );
}