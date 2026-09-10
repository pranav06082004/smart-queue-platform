import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-slate-100 bg-lavender/40">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <p className="font-display font-bold text-lg text-indigo mb-2">Smart Queue</p>
          <p className="text-sm text-ink/60 max-w-sm">
            Skip the physical line. Join remotely, track your position live, and show up right when it's your turn.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/40 mb-3">Customers</p>
          <ul className="space-y-2 text-sm text-ink/70">
            <li><Link to="/organizations" className="hover:text-indigo">Browse organizations</Link></li>
            <li><Link to="/recommendations" className="hover:text-indigo">Find best queue</Link></li>
            <li><Link to="/ask" className="hover:text-indigo">Ask AI</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/40 mb-3">Staff</p>
          <ul className="space-y-2 text-sm text-ink/70">
            <li><Link to="/staff/create-organization" className="hover:text-indigo">Create organization</Link></li>
            <li><Link to="/staff/dashboard" className="hover:text-indigo">Staff dashboard</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-100 py-4 text-center text-xs text-ink/40">
        Built as a full-stack system design learning project.
      </div>
    </footer>
  );
}