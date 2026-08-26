import { useEffect, useState } from "react";
import { api } from "../services/api";

type HealthResponse = {
  success: boolean;
  data: {
    status: string;
    database: string;
    timestamp: string;
  };
};

export default function HomePage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<HealthResponse>("/health")
      .then((res) => setHealth(res.data))
      .catch(() => setError("Could not reach the backend."));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white shadow rounded-xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold mb-4">Smart Queue Platform</h1>

        {error && <p className="text-red-600">{error}</p>}

        {!error && !health && <p className="text-slate-500">Checking backend...</p>}

        {health && (
          <div className="space-y-1 text-slate-700">
            <p>Status: <span className="font-medium">{health.data.status}</span></p>
            <p>Database: <span className="font-medium">{health.data.database}</span></p>
            <p className="text-sm text-slate-400">{health.data.timestamp}</p>
          </div>
        )}
      </div>
    </div>
  );
}