import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

type Organization = { id: string; name: string; description: string | null };
type Queue = { id: string; name: string; status: string };
type Service = { id: string; name: string; description: string | null; queues?: Queue[] };

export default function OrganizationDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [org, setOrg] = useState<Organization | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [queuesByService, setQueuesByService] = useState<Record<string, Queue[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/organizations/${id}`).then((res) => setOrg(res.data.data)).catch(() => setError("Organization not found."));
    api.get(`/organizations/${id}/services`).then(async (res) => {
      const svcs: Service[] = res.data.data;
      setServices(svcs);
      const map: Record<string, Queue[]> = {};
      for (const s of svcs) {
        const qres = await api.get(`/services/${s.id}/queues`);
        map[s.id] = qres.data.data;
      }
      setQueuesByService(map);
    });
  }, [id]);

  async function handleJoin(queueId: string) {
    setError(null);
    setMessage(null);
    try {
      const res = await api.post(`/queues/${queueId}/join`);
      setMessage(`Joined! Your token number is #${res.data.data.tokenNumber}.`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? "Could not join queue.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/organizations" className="text-blue-600 text-sm">← Back</Link>

        {error && <p className="text-red-600 mt-4">{error}</p>}
        {message && <p className="text-green-600 mt-4">{message}</p>}

        {org && (
          <>
            <h1 className="text-2xl font-semibold mt-4">{org.name}</h1>
            {org.description && <p className="text-slate-500 mb-6">{org.description}</p>}

            <h2 className="font-medium mb-2">Services</h2>
            <div className="space-y-3">
              {services.map((s) => (
                <div key={s.id} className="bg-white shadow rounded-lg p-3">
                  <p className="font-medium">{s.name}</p>
                  {s.description && <p className="text-sm text-slate-500">{s.description}</p>}

                  <div className="flex flex-wrap gap-2 mt-2">
                    {(queuesByService[s.id] ?? []).map((q) => (
                      <div key={q.id} className="border rounded px-2 py-1 flex items-center gap-2 text-sm">
                        <span>{q.name}</span>
                        <span className={`text-xs ${q.status === "OPEN" ? "text-green-600" : "text-slate-400"}`}>
                          {q.status}
                        </span>
                        {user?.role === "CUSTOMER" && q.status === "OPEN" && (
                          <button onClick={() => handleJoin(q.id)} className="text-blue-600 underline">Join</button>
                        )}
                      </div>
                    ))}
                    {(queuesByService[s.id] ?? []).length === 0 && (
                      <span className="text-xs text-slate-400">No queues yet</span>
                    )}
                  </div>
                </div>
              ))}
              {services.length === 0 && <p className="text-slate-500">No services yet.</p>}
            </div>

            {user?.role === "STAFF" && (
              <Link to={`/staff/organizations/${org.id}/services`} className="inline-block mt-4 text-blue-600 text-sm">
                + Manage services (staff, owner only)
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}