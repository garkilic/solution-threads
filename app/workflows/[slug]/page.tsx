"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WorkflowOutput } from "@/lib/types";
import { getOutputs } from "@/lib/storage";
import { getClientBySlug } from "@/lib/auth";

function timeAgo(date: string) {
  const seconds = Math.floor(
    (Date.now() - new Date(date).getTime()) / 1000
  );
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function Dashboard({ params }: { params: Promise<{ slug: string }> }) {
  const [outputs, setOutputs] = useState<WorkflowOutput[]>([]);
  const [clientId, setClientId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState<string>("");

  useEffect(() => {
    async function loadData() {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
      const client = await getClientBySlug(resolvedParams.slug);
      if (client) {
        setClientId(client.id);
        const data = await getOutputs(client.id);
        setOutputs(data);
      }
      setLoading(false);
    }
    loadData();
  }, [params]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl py-20 text-center">
        <p className="text-sm text-zinc-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Demo Banner */}
      <div className="mb-8 rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-xs font-bold text-amber-400">
            !
          </span>
          <div>
            <p className="text-sm font-medium text-amber-200">
              This is a demo environment
            </p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-400">
              Data sources are simulated with sample data. Download the test
              files below to try the full workflow.
            </p>
          </div>
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-zinc-500">
          Workflows
        </h2>
        <Link href={`/workflows/${slug}/run/client-prep`} className="group block">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900">
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                    <svg
                      className="text-emerald-500"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    </svg>
                  </div>
                  <h3 className="text-[15px] font-medium text-zinc-100">
                    Client Meeting Prep
                  </h3>
                </div>
                <p className="ml-12 text-sm leading-relaxed text-zinc-500">
                  Pulls portfolio, CRM, custodian, and email data into a single
                  briefing. Replaces 1-5 hours of manual prep.
                </p>
              </div>
              <span className="mt-1 text-zinc-700 transition-colors duration-200 group-hover:text-emerald-500">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </Link>

        {/* Connected Data Sources */}
        <div className="mt-6">
          <div className="flex items-start justify-center gap-6">
            {[
              { name: "Ridgeline", label: "Portfolio", auto: true, delay: "0s" },
              { name: "Salesforce", label: "CRM", auto: true, delay: "0.1s" },
              { name: "Fidelity", label: "Custodian", auto: false, delay: "0.2s" },
              { name: "Outlook", label: "Email", auto: false, delay: "0.3s" },
            ].map((source) => (
              <div
                key={source.name}
                className="flex flex-col items-center animate-fade-in-up"
                style={{ animationDelay: source.delay }}
              >
                {/* Animated SVG connector */}
                <svg width="2" height="32" className="overflow-visible">
                  <line
                    x1="1" y1="0" x2="1" y2="32"
                    stroke={source.auto ? "#10b981" : "#f59e0b"}
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="0"
                      to="-8"
                      dur="0.6s"
                      repeatCount="indefinite"
                    />
                  </line>
                </svg>

                {/* Source chip */}
                <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    source.auto ? "bg-emerald-500" : "bg-amber-500"
                  }`} />
                  <div className="text-center">
                    <p className="text-xs font-medium text-zinc-300">
                      {source.name}
                    </p>
                    <p className="text-[10px] text-zinc-600">{source.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-zinc-600">Connected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span className="text-[10px] text-zinc-600">Manual upload</span>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Data Downloads */}
      <section className="mt-10">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-zinc-500">
          Demo Data
        </h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p className="mb-4 text-sm text-zinc-400">
            Download these files to test the workflow. Start with the client
            list, then upload the Fidelity and Outlook files when prompted.
          </p>
          <div className="space-y-2">
            {[
              {
                name: "clients.csv",
                label: "Client List",
                desc: "Upload first to select a client",
                href: "/demo-data/clients.csv",
              },
              {
                name: "fidelity-whitfield.txt",
                label: "Fidelity Export",
                desc: "Upload when prompted for custodian data",
                href: "/demo-data/fidelity-whitfield.txt",
              },
              {
                name: "outlook-whitfield.txt",
                label: "Outlook Export",
                desc: "Upload when prompted for communications",
                href: "/demo-data/outlook-whitfield.txt",
              },
            ].map((file) => (
              <a
                key={file.name}
                href={file.href}
                download={file.name}
                className="flex items-center justify-between rounded-lg border border-zinc-800 px-4 py-3 transition-colors hover:border-zinc-700 hover:bg-zinc-800/40"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-200">
                    {file.label}
                  </p>
                  <p className="text-xs text-zinc-500">{file.desc}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 pl-4">
                  <span className="text-xs text-zinc-600">{file.name}</span>
                  <svg
                    className="text-zinc-500"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-zinc-500">
          Recent Runs
        </h2>
        {outputs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 px-6 py-10 text-center">
            <p className="text-sm text-zinc-600">
              No runs yet. Run your first workflow above.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60 rounded-xl border border-zinc-800 bg-zinc-900/50">
            {outputs.map((output) => (
              <Link
                key={output.id}
                href={`/workflows/${slug}/output/${output.id}`}
                className="flex items-center justify-between px-5 py-4 transition-colors duration-150 hover:bg-zinc-800/40 first:rounded-t-xl last:rounded-b-xl"
              >
                <div className="min-w-0">
                  <span className="text-sm font-medium text-zinc-200">
                    {output.clientName}
                  </span>
                  <span className="mx-2 text-zinc-700">&middot;</span>
                  <span className="text-sm text-zinc-500">
                    {output.company}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-3 pl-4">
                  <span className="text-xs text-zinc-600">
                    {timeAgo(output.createdAt)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Done
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
