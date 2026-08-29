import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api";
import { getSocket } from "../services/socket";

type Status = { id: string; name: string; status: string; waitingCount: number; currentToken: number | null };
type HistoryEntry = { id: string; tokenNumber: number; status: string; user: { name: string } };

export default function StaffQueueControlPage() {
  const { id } = useParams();
  const [status, setStatus] = useState<Status | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [calledEntry, setCalledEntry] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  function loadHistory() {
    api.get(`/queues/${id}/history`).then((res) => setHistory(res.data.data)).catch(() => {});
  }

  useEffect(() => {
    if (!id) return;

    // Initial load, same as before — WebSockets don't replace the first fetch.
    api.get(`/queues/${id}/status`).then((res) => setStatus(res.data.data));
    loadHistory();

    const socket = getSocket();
    socket.emit("join-queue", id);

    function handleUpdate(data: Status) {
      setStatus(data);
      loadHistory();
    }
    function handleTokenCalled(entry: any) {
      setCalledEntry(entry);
    }

    socket.on("QUEUE_UPDATED", handleUpdate);
    socket.on("TOKEN_CALLED", handleTokenCalled);

    // Safety-net backup poll — much slower than Phase 5's, only catches
    // events missed during a brief disconnect/reconnect.
    const backupPoll = setInterval(() => {
      api.get(`/queues/${id}/status`).then((res) => setStatus(res.data.data));
    }, 30000);

    return () => {
      socket.emit("leave-queue", id);
      socket.off("QUEUE_UPDATED", handleUpdate);
      socket.off("TOKEN_CALLED", handleTokenCalled);
      clearInterval(backupPoll);
    };
  }, [id]);

  async function handleAction(action: "open" | "pause" | "resume" | "close") {
    try {
      await api.patch(`/queues/${id}/${action}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? "Action failed.");
    }
  }

  async function handleCallNext() {
    setError(null);
    try {
      const res = await api.post(`/queues/${id}/next`);
      setCalledEntry(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? "No one is waiting.");
    }
  }

  async function handleComplete() {
    if (!calledEntry) return;
    try {
      await api.post(`/queues/${id}/complete/${calledEntry.id}`);
      setCalledEntry(null);
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? "Failed to complete.");
    }
  }

  async function handleSkip() {
    if (!calledEntry) return;
    try {
      await api.post(`/queues/${id}/skip/${calledEntry.id}`);
      setCalledEntry(null);
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? "Failed to skip.");
    }
  }

  if (!status) return <div className="p-8 text-slate-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">{status.name}</h1>
            <span className={`text-xs px-2 py-1 rounded ${
              status.status === "OPEN" ? "bg-green-100 text-green-700" :
              status.status === "PAUSED" ? "bg-yellow-100 text-yellow-700" : "bg-slate-100 text-slate-500"
            }`}>
              {status.status}
            </span>
          </div>

          <div className="flex gap-4 mt-4 text-sm">
            <div>Waiting: <span className="font-semibold">{status.waitingCount}</span></div>
            <div>Current token: <span className="font-semibold">{status.currentToken ?? "—"}</span></div>
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={() => handleAction("open")} className="bg-green-600 text-white text-sm px-3 py-1.5 rounded">Open</button>
            <button onClick={() => handleAction("pause")} className="bg-yellow-600 text-white text-sm px-3 py-1.5 rounded">Pause</button>
            <button onClick={() => handleAction("resume")} className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded">Resume</button>
            <button onClick={() => handleAction("close")} className="bg-slate-600 text-white text-sm px-3 py-1.5 rounded">Close</button>
          </div>
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="font-medium mb-3">Serve Customers</h2>

          {!calledEntry && (
            <button onClick={handleCallNext} className="bg-slate-900 text-white px-4 py-2 rounded text-sm">
              Call Next
            </button>
          )}

          {calledEntry && (
            <div className="border rounded p-4">
              <p className="text-sm text-slate-500">Now serving</p>
              <p className="text-3xl font-bold">#{calledEntry.tokenNumber}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={handleComplete} className="bg-green-600 text-white text-sm px-3 py-1.5 rounded">Complete</button>
                <button onClick={handleSkip} className="bg-red-600 text-white text-sm px-3 py-1.5 rounded">Skip</button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="font-medium mb-3">Recent History</h2>
          <div className="space-y-1 text-sm">
            {history.slice(0, 10).map((h) => (
              <div key={h.id} className="flex justify-between border-b py-1">
                <span>#{h.tokenNumber} — {h.user?.name}</span>
                <span className="text-slate-400">{h.status}</span>
              </div>
            ))}
            {history.length === 0 && <p className="text-slate-400">No history yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}