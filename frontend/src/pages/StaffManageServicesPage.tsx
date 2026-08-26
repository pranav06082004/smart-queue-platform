import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api";

type Service = { id: string; name: string; description: string | null };

export default function StaffManageServicesPage() {
  const { id } = useParams(); // organization id
  const [services, setServices] = useState<Service[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  function loadServices() {
    api.get(`/organizations/${id}/services`).then((res) => setServices(res.data.data));
  }

  useEffect(() => {
    loadServices();
  }, [id]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post(`/organizations/${id}/services`, { name, description });
      setName("");
      setDescription("");
      loadServices();
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? "Failed to create service.");
    }
  }

  async function handleDelete(serviceId: string) {
    try {
      await api.delete(`/services/${serviceId}`);
      loadServices();
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? "Failed to delete service.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Manage Services</h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <form onSubmit={handleCreate} className="bg-white shadow rounded-lg p-4 mb-6 space-y-3">
          <input className="w-full border rounded px-3 py-2" placeholder="Service name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="w-full border rounded px-3 py-2" placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <button type="submit" className="bg-slate-900 text-white rounded px-4 py-2 text-sm">Add Service</button>
        </form>

        <div className="space-y-2">
          {services.map((s) => (
            <div key={s.id} className="bg-white shadow rounded-lg p-3 flex justify-between items-center">
              <div>
                <p className="font-medium">{s.name}</p>
                {s.description && <p className="text-sm text-slate-500">{s.description}</p>}
              </div>
              <button onClick={() => handleDelete(s.id)} className="text-red-600 text-sm">Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}