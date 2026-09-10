import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

type HealthResponse = {
  success: boolean;
  data: { status: string; database: string; timestamp: string };
};

export default function HomePage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    api.get<HealthResponse>("/health").then((res) => setHealth(res.data)).catch(() => {});
  }, []);

  return (
    <div>
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 text-sm font-medium text-teal mb-6">
          <span className="relative inline-flex w-2 h-2">
            <span className="live-pulse absolute inset-0" />
            <span className="relative w-2 h-2 rounded-full bg-teal" />
          </span>
          {health?.data.status === "ok" ? "All systems live" : "Connecting..."}
        </div>

        <h1 className="font-display font-extrabold text-5xl md:text-6xl text-indigo leading-tight max-w-3xl mx-auto">
          Never stand in a <span className="gradient-text">physical line</span> again
        </h1>

        <p className="mt-6 text-lg text-ink/60 max-w-xl mx-auto">
          Join queues remotely, watch your position move in real time, and get notified the moment it's your turn.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            to="/organizations"
            className="gradient-brand text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
          >
            Browse organizations
          </Link>
          <Link
            to="/register"
            className="px-6 py-3 rounded-full font-semibold text-indigo border border-indigo/20 hover:bg-lavender transition-colors"
          >
            Create an account
          </Link>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Join remotely", desc: "Get a token number without ever standing in line." },
          { label: "Track live", desc: "Watch your position and wait time update in real time." },
          { label: "Get notified", desc: "We tell you exactly when to show up." },
        ].map((f) => (
          <div key={f.label} className="p-6 rounded-2xl bg-lavender/50 border border-lavender">
            <p className="font-display font-semibold text-indigo mb-1">{f.label}</p>
            <p className="text-sm text-ink/60">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}