import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

type Organization = {
  id: string;
  name: string;
  description: string | null;
};

export default function OrganizationsListPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/organizations")
      .then((res) => setOrgs(res.data.data))
      .catch(() => setError("Could not load organizations."));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Organizations</h1>
          <Link to="/staff/create-organization" className="text-blue-600 text-sm">
            + Create Organization (staff)
          </Link>
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <div className="space-y-3">
          {orgs.map((org) => (
            <Link
              key={org.id}
              to={`/organizations/${org.id}`}
              className="block bg-white shadow rounded-lg p-4 hover:shadow-md transition"
            >
              <h2 className="font-medium">{org.name}</h2>
              {org.description && <p className="text-sm text-slate-500">{org.description}</p>}
            </Link>
          ))}
          {orgs.length === 0 && !error && <p className="text-slate-500">No organizations yet.</p>}
        </div>
      </div>
    </div>
  );
}