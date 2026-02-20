import { getAdminStats } from "@/lib/storage-server";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function AdminDashboard() {
  const { clients, recentActivity, totalRuns, totalBooks } = await getAdminStats();

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Manager Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">Activity across all Solution Threads demos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">Clients</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-100">{clients.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">Meeting Prep Runs</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-400">{totalRuns}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">Book Projects</p>
          <p className="mt-2 text-3xl font-semibold text-amber-400">{totalBooks}</p>
        </div>
      </div>

      {/* Clients table */}
      <section>
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-zinc-500">Clients</h2>
        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-widest text-zinc-500">Name</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-widest text-zinc-500">Slug</th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-widest text-zinc-500">Mtg Prep</th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-widest text-zinc-500">Books</th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-widest text-zinc-500">Last Active</th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-widest text-zinc-500">Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {clients.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-sm text-zinc-600">No clients yet</td>
                </tr>
              )}
              {clients.map((client) => (
                <tr key={client.id} className="bg-zinc-900/30 transition-colors hover:bg-zinc-900/60">
                  <td className="px-5 py-4 font-medium text-zinc-200">{client.name}</td>
                  <td className="px-5 py-4 font-mono text-xs text-zinc-500">{client.slug}</td>
                  <td className="px-5 py-4 text-right">
                    {client.meetingPrepRuns > 0 ? (
                      <span className="inline-flex items-center justify-center rounded-md bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                        {client.meetingPrepRuns}
                      </span>
                    ) : (
                      <span className="text-zinc-700">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {client.bookProjects > 0 ? (
                      <span className="inline-flex items-center justify-center rounded-md bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                        {client.bookProjects}
                      </span>
                    ) : (
                      <span className="text-zinc-700">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right text-zinc-400">
                    {client.lastActiveAt ? timeAgo(client.lastActiveAt) : <span className="text-zinc-700">Never</span>}
                  </td>
                  <td className="px-5 py-4 text-right text-zinc-600 text-xs">{formatDate(client.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent activity */}
      <section>
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-zinc-500">Recent Activity</h2>
        <div className="space-y-2">
          {recentActivity.length === 0 && (
            <p className="text-sm text-zinc-600">No activity yet</p>
          )}
          {recentActivity.map((activity, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 px-5 py-3"
            >
              <span
                className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs ${
                  activity.type === "meeting_prep"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-amber-500/10 text-amber-400"
                }`}
              >
                {activity.type === "meeting_prep" ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <span className="font-medium text-zinc-300">{activity.clientName}</span>
                <span className="mx-2 text-zinc-700">·</span>
                <span className="text-zinc-500">{activity.description}</span>
              </div>
              <span className="shrink-0 text-xs text-zinc-600">{timeAgo(activity.createdAt)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
