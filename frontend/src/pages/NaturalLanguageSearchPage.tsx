import { useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

type Result = {
  queueId: string; queueName: string; organizationName: string;
  distanceKm: number | null; waitingCount: number; estimatedWaitMinutes: number;
  waitEstimateSource: string;
};

export default function NaturalLanguageSearchPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [interpreted, setInterpreted] = useState<{ serviceName: string | null; maxWaitMinutes: number | null; note: string } | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/nl-search", { query });
      setInterpreted(res.data.data.interpretedAs);
      setResults(res.data.data.results);
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? "Search failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(queueId: string) {
    setMessage(null);
    try {
      const res = await api.post(`/queues/${queueId}/join`);
      setMessage(`Joined! Your token is #${res.data.data.tokenNumber}.`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? "Could not join.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-1">Ask in your own words</h1>
        <p className="text-sm text-slate-500 mb-4">
          e.g. "I need a haircut and don't want to wait more than 20 minutes"
        </p>

        <form onSubmit={handleSearch} className="bg-white shadow rounded-lg p-4 mb-6 space-y-3">
          <textarea
            className="w-full border rounded px-3 py-2"
            rows={2}
            placeholder="Describe what you're looking for..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" disabled={loading} className="bg-slate-900 text-white rounded px-4 py-2 text-sm disabled:opacity-50">
            {loading ? "Thinking..." : "Search"}
          </button>
        </form>

        {error && <p className="text-red-600 mb-4">{error}</p>}
        {message && <p className="text-green-600 mb-4">{message}</p>}

        {interpreted && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 text-sm text-blue-800">
            <p className="font-medium">What I understood:</p>
            <p>{interpreted.note}</p>
            {!interpreted.serviceName && (
              <p className="mt-1 text-blue-600">
                I couldn't match this to a real service — try the regular search instead, or rephrase.
              </p>
            )}
          </div>
        )}

        <div className="space-y-3">
          {results.map((r) => (
            <div key={r.queueId} className="bg-white shadow rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{r.organizationName} — {r.queueName}</p>
                <p className="text-sm text-slate-500">
                  {r.waitingCount} waiting · ~{r.estimatedWaitMinutes}m wait
                </p>
              </div>
              {user?.role === "CUSTOMER" && (
                <button onClick={() => handleJoin(r.queueId)} className="bg-slate-900 text-white text-sm px-3 py-1.5 rounded">
                  Join
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}