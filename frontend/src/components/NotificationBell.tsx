import { useEffect, useState } from "react";
import { api } from "../services/api";
import { getSocket } from "../services/socket";
import { useAuth } from "../context/AuthContext";

type Notification = {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  function load() {
    api.get("/notifications").then((res) => setNotifications(res.data.data)).catch(() => {});
  }

  useEffect(() => {
    if (!user) return;

    load();

    const socket = getSocket();
    socket.emit("join-user-room", user.id);

    function handleNew(notification: Notification) {
      setNotifications((prev) => [notification, ...prev]);
    }

    socket.on("NOTIFICATION_CREATED", handleNew);
    return () => {
      socket.off("NOTIFICATION_CREATED", handleNew);
    };
  }, [user]);

  async function markAllRead() {
    await api.patch("/notifications/read-all");
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function markOneRead(id: string) {
    await api.patch(`/notifications/${id}/read`);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  if (!user) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative text-slate-600">
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg border max-h-96 overflow-y-auto z-50">
          <div className="flex justify-between items-center p-3 border-b">
            <span className="font-medium text-sm">Notifications</span>
            <button onClick={markAllRead} className="text-xs text-blue-600">Mark all read</button>
          </div>
          {notifications.length === 0 && (
            <p className="text-sm text-slate-400 p-4">No notifications yet.</p>
          )}
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markOneRead(n.id)}
              className={`p-3 border-b text-sm cursor-pointer ${n.read ? "bg-white text-slate-500" : "bg-blue-50 text-slate-900"}`}
            >
              <p>{n.message}</p>
              <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleTimeString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}