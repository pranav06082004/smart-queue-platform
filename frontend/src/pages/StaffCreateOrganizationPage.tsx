import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function StaffCreateOrganizationPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.post("/organizations", { name, description });
      navigate(`/organizations/${res.data.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? "Failed to create organization.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-xl p-8 w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Create Organization</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input className="w-full border rounded px-3 py-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <textarea className="w-full border rounded px-3 py-2" placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button type="submit" className="w-full bg-slate-900 text-white rounded py-2">Create</button>
        <p className="text-xs text-slate-400">Note: you must be logged in as STAFF for this to succeed.</p>
      </form>
    </div>
  );
}
