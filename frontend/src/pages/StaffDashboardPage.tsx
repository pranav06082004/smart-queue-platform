import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

type Queue = { id: string; name: string; status: string };
type Service = { id: string; name: string; queues: Queue[] };
type Organization = { id: string; name: string; services: Service[] };

export default function StaffDashboardPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/my/organizations")
      .then((res) => setOrgs(res.data.data))
      .catch(() => setError("Could not load your organizations."));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Staff Dashboard</h1>
          <Link to="/staff/create-organization" className="text-blue-600 text-sm">+ New Organization</Link>
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <div className="space-y-6">
          {orgs.map((org) => (
            <div key={org.id} className="bg-white shadow rounded-lg p-4">
              <div className="flex justify-between items-center">
                <h2 className="font-medium">{org.name}</h2>
                <Link to={`/staff/organizations/${org.id}/services`} className="text-sm text-blue-600">
                  Manage services
                </Link>
              </div>

              <div className="mt-3 space-y-2">
                {org.services.map((s) => (
                  <div key={s.id} className="border rounded p-2">
                    <p className="text-sm font-medium">{s.name}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {s.queues.map((q) => (
                        <Link
                          key={q.id}
                          to={`/staff/queues/${q.id}`}
                          className={`text-xs px-2 py-1 rounded border ${
                            q.status === "OPEN" ? "border-green-400 text-green-700" : "border-slate-300 text-slate-500"
                          }`}
                        >
                          {q.name} ({q.status})
                        </Link>
                      ))}
                      {s.queues.length === 0 && <span className="text-xs text-slate-400">No queues yet</span>}
                    </div>
                  </div>
                ))}
                {org.services.length === 0 && <p className="text-xs text-slate-400">No services yet.</p>}
              </div>
            </div>
          ))}
          {orgs.length === 0 && !error && <p className="text-slate-500">You don't own any organizations yet.</p>}
        </div>
      </div>
    </div>
  );
}