import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api";

type Organization = { id: string; name: string; description: string | null };
type Service = { id: string; name: string; description: string | null };

export default function OrganizationDetailPage() {
  const { id } = useParams();
  const [org, setOrg] = useState<Organization | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/organizations/${id}`).then((res) => setOrg(res.data.data)).catch(() => setError("Organization not found."));
    api.get(`/organizations/${id}/services`).then((res) => setServices(res.data.data));
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/organizations" className="text-blue-600 text-sm">← Back</Link>

        {error && <p className="text-red-600 mt-4">{error}</p>}

        {org && (
          <>
            <h1 className="text-2xl font-semibold mt-4">{org.name}</h1>
            {org.description && <p className="text-slate-500 mb-6">{org.description}</p>}

            <h2 className="font-medium mb-2">Services</h2>
            <div className="space-y-2">
              {services.map((s) => (
                <div key={s.id} className="bg-white shadow rounded-lg p-3">
                  <p className="font-medium">{s.name}</p>
                  {s.description && <p className="text-sm text-slate-500">{s.description}</p>}
                </div>
              ))}
              {services.length === 0 && <p className="text-slate-500">No services yet.</p>}
            </div>

            <Link
              to={`/staff/organizations/${org.id}/services`}
              className="inline-block mt-4 text-blue-600 text-sm"
            >
              + Manage services (staff, owner only)
            </Link>
          </>
        )}
      </div>
    </div>
  );
}