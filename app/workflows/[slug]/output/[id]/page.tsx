"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WorkflowOutput } from "@/lib/types";
import { getOutput } from "@/lib/storage";

const REFERENCE_TABS = [
  { key: "portfolioSummary", label: "Portfolio", source: "Ridgeline" },
  { key: "relationshipHistory", label: "Relationship", source: "Salesforce" },
  { key: "accountStatus", label: "Account", source: "Fidelity" },
  { key: "recentCommunications", label: "Comms", source: "Outlook" },
] as const;

type TabKey = (typeof REFERENCE_TABS)[number]["key"];

export default function OutputPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const [output, setOutput] = useState<WorkflowOutput | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("portfolioSummary");
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState<string>("");

  useEffect(() => {
    async function loadOutput() {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
      const data = await getOutput(resolvedParams.id);
      setOutput(data);
      setLoading(false);
    }
    loadOutput();
  }, [params]);

  function copyAll() {
    if (!output) return;

    const statsLine = output.keyStats
      ? `Key Stats: AUM ${output.keyStats.aum} | Tenure ${output.keyStats.tenure} | YTD ${output.keyStats.ytdReturn} | Key Ask: ${output.keyStats.keyAsk}\n\n`
      : "";

    const agenda = `Meeting Agenda & Talking Points\n${output.sections.meetingAgenda.map((b) => `  - ${b}`).join("\n")}`;

    const refs = REFERENCE_TABS.map((tab) => {
      const bullets = output.sections[tab.key];
      return `${tab.label} (${tab.source})\n${bullets.map((b) => `  - ${b}`).join("\n")}`;
    }).join("\n\n");

    navigator.clipboard.writeText(`${statsLine}${agenda}\n\n${refs}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-zinc-600">Loading...</p>
      </div>
    );
  }

  if (!output) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-zinc-600">Output not found.</p>
        <Link
          href={`/workflows/${slug}`}
          className="mt-3 inline-block text-sm text-zinc-400 hover:text-zinc-200"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  const date = new Date(output.createdAt);
  const formatted = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const stats = output.keyStats;
  const activeBullets = output.sections[activeTab];
  const activeTabMeta = REFERENCE_TABS.find((t) => t.key === activeTab)!;

  return (
    <div className="mx-auto flex h-[calc(100vh-6rem)] max-w-3xl flex-col">
      {/* Header row */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/workflows/${slug}`}
            className="text-zinc-500 transition-colors hover:text-zinc-300"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-zinc-100 leading-tight">
              {output.clientName}
            </h1>
            <p className="text-xs text-zinc-500">
              {output.company}
              <span className="mx-1.5 text-zinc-700">&middot;</span>
              {formatted}
            </p>
          </div>
        </div>
        <button
          onClick={copyAll}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-all duration-200 hover:border-zinc-700 hover:text-zinc-200"
        >
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Key Stats */}
      {stats && (
        <div className="mb-3 flex gap-2">
          {[
            { label: "AUM", value: stats.aum },
            { label: "Tenure", value: stats.tenure },
            { label: "YTD", value: stats.ytdReturn },
            { label: "Key Ask", value: stats.keyAsk },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2"
            >
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600 mb-0.5">
                {stat.label}
              </p>
              <p className="text-[13px] font-medium text-zinc-200 leading-snug truncate">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Meeting Agenda */}
      <div className="mb-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
        <div className="mb-2 flex items-center gap-1.5">
          <svg className="text-emerald-500" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          </svg>
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-emerald-400">
            Meeting Agenda
          </h2>
        </div>
        <ul className="space-y-1.5">
          {output.sections.meetingAgenda.map((bullet, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-[13px] leading-snug text-zinc-200"
            >
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-emerald-500/10 text-[9px] font-semibold text-emerald-400">
                {i + 1}
              </span>
              {bullet}
            </li>
          ))}
        </ul>
      </div>

      {/* Reference Sections */}
      <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-zinc-800 bg-zinc-900/50">
        <div className="flex shrink-0 border-b border-zinc-800">
          {REFERENCE_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const hasBullets = output.sections[tab.key]?.length > 0;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? "text-zinc-200"
                    : hasBullets
                      ? "text-zinc-500 hover:text-zinc-300"
                      : "text-zinc-700"
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-px bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeBullets && activeBullets.length > 0 ? (
            <ul className="space-y-2">
              {activeBullets.map((bullet, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-[13px] leading-snug text-zinc-300"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
                  {bullet}
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-4 text-center text-sm text-zinc-600">
              No {activeTabMeta.source} data was provided for this briefing.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
