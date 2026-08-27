import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

type Entry = {
  id: string;
  tokenNumber: string | number;
  status: string;
  queue: { name: string; service: { name: string; organization: { name: string } } };
};

export default function CustomerDashboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api
      .get("/my/queue-entries")
      .then((res) => setEntries(res.data.data))
      .catch(() => setError("Could not load your queue entries."));
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000); // simple polling, real-time comes in Phase 6
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">My Queues</h1>
          <Link to="/organizations" className="text-blue-600 text-sm">Browse organizations →</Link>
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <div className="space-y-3">
          {entries.map((e) => (
            <div key={e.id} className="bg-white shadow rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{e.queue.service.organization.name}</p>
                  <p className="text-sm text-slate-500">{e.queue.service.name} — {e.queue.name}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  e.status === "CALLED" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                }`}>
                  {e.status}
                </span>
              </div>
              <p className="text-3xl font-bold mt-2">#{e.tokenNumber}</p>
            </div>
          ))}
          {entries.length === 0 && !error && (
            <p className="text-slate-500">You haven't joined any queues yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}