"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Client } from "@/lib/types";
import { getClients, saveClients, saveOutput } from "@/lib/storage";
import { getClientBySlug } from "@/lib/auth";

interface AttachedFile {
  name: string;
  source: string;
  content: string;
}

const DATA_SOURCES = [
  { key: "ridgeline", label: "Portfolio Data", source: "Ridgeline", auto: true },
  { key: "salesforce", label: "Relationship History", source: "Salesforce", auto: true },
  { key: "fidelity", label: "Account & Transfer Status", source: "Fidelity", auto: false },
  { key: "outlook", label: "Communications", source: "Outlook", auto: false },
];

const WORKFLOW_STEPS = [
  { key: "ridgeline", label: "Portfolio Data", source: "Ridgeline" },
  { key: "salesforce", label: "Relationship History", source: "Salesforce" },
  { key: "fidelity", label: "Account Status", source: "Fidelity" },
  { key: "outlook", label: "Communications", source: "Outlook" },
  { key: "synthesize", label: "Generating Briefing", source: "AI Synthesis" },
];

type SourceStatus = "pending" | "loading" | "loaded" | "awaiting_upload" | "skipped";
type StepStatus = "pending" | "active" | "complete";

function parseCSV(text: string): Client[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const nameIdx = headers.findIndex((h) =>
    ["name", "contact", "client", "full name", "fullname"].includes(h)
  );
  const companyIdx = headers.findIndex((h) =>
    ["company", "organization", "org", "firm", "fund"].includes(h)
  );
  const titleIdx = headers.findIndex((h) =>
    ["title", "role", "position", "job title"].includes(h)
  );
  const emailIdx = headers.findIndex((h) =>
    ["email", "e-mail", "mail"].includes(h)
  );
  if (nameIdx === -1 || companyIdx === -1) return [];
  return lines
    .slice(1)
    .map((line) => {
      const cols = line.split(",").map((c) => c.trim());
      return {
        name: cols[nameIdx] || "",
        company: cols[companyIdx] || "",
        title: titleIdx !== -1 ? cols[titleIdx] : undefined,
        email: emailIdx !== -1 ? cols[emailIdx] : undefined,
      };
    })
    .filter((c) => c.name && c.company);
}

export default function RunClientPrep({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [clientId, setClientId] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number>(-1);
  const [context, setContext] = useState("");
  const [running, setRunning] = useState(false);
  const [csvDragOver, setCsvDragOver] = useState(false);
  const [manualDragOver, setManualDragOver] = useState(false);
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(
    WORKFLOW_STEPS.map(() => "pending")
  );
  const [activeStepIdx, setActiveStepIdx] = useState(-1);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const stepInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Source loading state
  const [sourceStatuses, setSourceStatuses] = useState<SourceStatus[]>(
    DATA_SOURCES.map(() => "pending")
  );
  const [currentSourceIdx, setCurrentSourceIdx] = useState<number>(-1);
  const [manualFiles, setManualFiles] = useState<Record<string, AttachedFile | null>>({});
  const [sourcesReady, setSourcesReady] = useState(false);

  // Ref to resolve the upload promise for manual sources
  const uploadResolver = useRef<((action: "uploaded" | "skipped") => void) | null>(null);

  useEffect(() => {
    async function loadData() {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
      const client = await getClientBySlug(resolvedParams.slug);
      if (client) {
        setClientId(client.id);
        const savedClients = await getClients(client.id);
        if (savedClients.length > 0) setClients(savedClients);
      }
      setLoading(false);
    }
    loadData();
  }, [params]);

  useEffect(() => {
    return () => {
      if (stepInterval.current) clearInterval(stepInterval.current);
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, []);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length > 0 && clientId) {
        setClients(parsed);
        await saveClients(clientId, parsed);
        setSelectedIdx(-1);
      }
    };
    reader.readAsText(file);
  }, [clientId]);

  // Process sources sequentially when client is selected
  async function processSourcesSequentially() {
    const statuses: SourceStatus[] = DATA_SOURCES.map(() => "pending");
    setSourceStatuses([...statuses]);
    setSourcesReady(false);

    const files: Record<string, AttachedFile | null> = {};
    DATA_SOURCES.filter((s) => !s.auto).forEach((s) => {
      files[s.key] = null;
    });
    setManualFiles(files);

    for (let i = 0; i < DATA_SOURCES.length; i++) {
      const source = DATA_SOURCES[i];
      setCurrentSourceIdx(i);

      if (source.auto) {
        statuses[i] = "loading";
        setSourceStatuses([...statuses]);
        await new Promise((r) => setTimeout(r, 1200));
        statuses[i] = "loaded";
        setSourceStatuses([...statuses]);
      } else {
        statuses[i] = "awaiting_upload";
        setSourceStatuses([...statuses]);

        const action = await new Promise<"uploaded" | "skipped">((resolve) => {
          uploadResolver.current = resolve;
        });
        uploadResolver.current = null;

        statuses[i] = action === "uploaded" ? "loaded" : "skipped";
        setSourceStatuses([...statuses]);
        await new Promise((r) => setTimeout(r, 400));
      }
    }

    setCurrentSourceIdx(-1);
    setSourcesReady(true);
  }

  function handleManualUpload(sourceKey: string, file: File) {
    const source = DATA_SOURCES.find((s) => s.key === sourceKey);
    if (!source) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setManualFiles((prev) => ({
        ...prev,
        [sourceKey]: { name: file.name, source: source.source, content },
      }));
      if (uploadResolver.current) {
        uploadResolver.current("uploaded");
      }
    };
    reader.readAsText(file);
  }

  function handleSkipSource() {
    if (uploadResolver.current) {
      uploadResolver.current("skipped");
    }
  }

  function handleSelectClient(idx: number) {
    setSelectedIdx(idx);
    if (idx !== -1) {
      processSourcesSequentially();
    } else {
      setSourceStatuses(DATA_SOURCES.map(() => "pending"));
      setCurrentSourceIdx(-1);
      setSourcesReady(false);
    }
  }

  function setStep(idx: number) {
    setActiveStepIdx(idx);
    setStepStatuses((prev) => {
      const next = [...prev];
      for (let i = 0; i < idx; i++) next[i] = "complete";
      if (idx < next.length) next[idx] = "active";
      return next;
    });
  }

  function completeAllSteps() {
    if (timerInterval.current) clearInterval(timerInterval.current);
    setStepStatuses(WORKFLOW_STEPS.map(() => "complete"));
    setActiveStepIdx(WORKFLOW_STEPS.length);
  }

  async function handleRun() {
    if (selectedIdx === -1 || !clientId) return;
    const client = clients[selectedIdx];
    setRunning(true);
    setElapsedSeconds(0);
    setStepStatuses(WORKFLOW_STEPS.map(() => "pending"));

    timerInterval.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    const attachments = Object.values(manualFiles)
      .filter((f): f is AttachedFile => f !== null)
      .map((f) => ({ source: f.source, content: f.content }));

    const autoSourceNames = DATA_SOURCES
      .filter((s) => s.auto)
      .map((s) => s.source);

    const loadedSources = new Set(autoSourceNames);
    attachments.forEach((a) => loadedSources.add(a.source));

    try {
      for (let i = 0; i < DATA_SOURCES.length; i++) {
        const src = DATA_SOURCES[i];
        const stepIdx = WORKFLOW_STEPS.findIndex((s) => s.key === src.key);
        if (stepIdx === -1) continue;

        if (loadedSources.has(src.source)) {
          setStep(stepIdx);
          await new Promise((r) => setTimeout(r, 600));
        } else {
          setStepStatuses((prev) => {
            const next = [...prev];
            next[stepIdx] = "complete";
            return next;
          });
        }
      }

      const synthIdx = WORKFLOW_STEPS.findIndex((s) => s.key === "synthesize");
      setStep(synthIdx);

      const res = await fetch("/api/run-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: client.name,
          company: client.company,
          title: client.title,
          context,
          autoSources: autoSourceNames,
          attachments,
        }),
      });

      if (!res.ok) throw new Error("Workflow failed");

      const data = await res.json();
      completeAllSteps();

      const runId = await saveOutput(
        clientId,
        client.name,
        client.company,
        context || undefined,
        data.keyStats,
        data.sections
      );

      setTimeout(() => router.push(`/workflows/${slug}/output/${runId}`), 800);
    } catch (err) {
      if (timerInterval.current) clearInterval(timerInterval.current);
      setStepStatuses(WORKFLOW_STEPS.map(() => "pending"));
      setActiveStepIdx(-1);
      alert("Something went wrong. Check that your API key is set.");
      setRunning(false);
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-zinc-600">Loading...</p>
      </div>
    );
  }

  const showProgress = selectedIdx !== -1;

  return (
    <div className="flex gap-10">
      {/* Left column: Form */}
      <div className="min-w-0 flex-1 max-w-2xl">
        <Link
          href={`/workflows/${slug}`}
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <div className="mb-8">
          <h1 className="text-xl font-semibold text-zinc-100">
            Client Meeting Prep
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            Consolidates Ridgeline, Salesforce, Fidelity, and Outlook into one
            briefing.
          </p>
        </div>

        <div className="space-y-6">
          {/* Client List Upload */}
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-zinc-500">
              Client List
            </label>
            {clients.length === 0 ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setCsvDragOver(true);
                }}
                onDragLeave={() => setCsvDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setCsvDragOver(false);
                  const file = e.dataTransfer.files[0];
                  if (file) handleFile(file);
                }}
                className={`relative rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors duration-200 ${
                  csvDragOver
                    ? "border-emerald-500/50 bg-emerald-500/5"
                    : "border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
                <div className="flex flex-col items-center gap-2">
                  <svg
                    className="text-zinc-600"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p className="text-sm text-zinc-500">
                    Drop a CSV here or{" "}
                    <span className="text-zinc-300">click to upload</span>
                  </p>
                  <p className="text-xs text-zinc-600">
                    Columns: name, company (required), title, email (optional)
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                    <svg
                      className="text-emerald-500"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                  <span className="text-sm text-zinc-300">
                    {clients.length} client{clients.length !== 1 && "s"} loaded
                  </span>
                </div>
                <label className="cursor-pointer text-xs text-zinc-500 transition-colors hover:text-zinc-300">
                  Replace
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFile(file);
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Select client */}
          {clients.length > 0 && (
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-zinc-500">
                Select Client
              </label>
              <select
                value={selectedIdx}
                onChange={(e) => handleSelectClient(Number(e.target.value))}
                className="w-full appearance-none rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-200 outline-none transition-colors focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
              >
                <option value={-1}>Choose a client...</option>
                {clients.map((c, i) => (
                  <option key={i} value={i}>
                    {c.name} — {c.company}
                    {c.title ? ` (${c.title})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sequential Data Source Loading */}
          {selectedIdx !== -1 && !sourcesReady && (
            <div>
              <label className="mb-3 block text-xs font-medium uppercase tracking-widest text-zinc-500">
                Data Sources
              </label>
              <div className="space-y-2">
                {DATA_SOURCES.map((source, i) => {
                  const status = sourceStatuses[i];
                  const file = manualFiles[source.key];

                  if (status === "pending") {
                    return (
                      <div
                        key={source.key}
                        className="flex items-center justify-between rounded-lg border border-zinc-800/40 bg-zinc-900/20 px-4 py-2.5 opacity-40"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="h-2 w-2 rounded-full bg-zinc-700" />
                          <span className="text-sm text-zinc-500">{source.source}</span>
                          <span className="text-xs text-zinc-700">{source.label}</span>
                        </div>
                        <span className="text-[11px] text-zinc-700">
                          {source.auto ? "Connected" : "Manual"}
                        </span>
                      </div>
                    );
                  }

                  if (status === "loading") {
                    return (
                      <div
                        key={source.key}
                        className="relative overflow-hidden rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-2.5"
                      >
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent" />
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500" />
                            <span className="text-sm font-medium text-zinc-200">{source.source}</span>
                            <span className="text-xs text-emerald-400/70">Pulling {source.label.toLowerCase()}...</span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (status === "loaded") {
                    return (
                      <div
                        key={source.key}
                        className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5"
                      >
                        <div className="flex items-center gap-2.5">
                          <svg className="text-emerald-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                          <span className="text-sm font-medium text-zinc-200">{source.source}</span>
                          {file && <span className="text-xs text-zinc-600 truncate max-w-[140px]">{file.name}</span>}
                        </div>
                        <span className="text-[11px] text-emerald-400">Ready</span>
                      </div>
                    );
                  }

                  if (status === "skipped") {
                    return (
                      <div
                        key={source.key}
                        className="flex items-center justify-between rounded-lg border border-zinc-800/60 bg-zinc-900/30 px-4 py-2.5"
                      >
                        <div className="flex items-center gap-2.5">
                          <svg className="text-zinc-600" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14" />
                          </svg>
                          <span className="text-sm text-zinc-500">{source.source}</span>
                        </div>
                        <span className="text-[11px] text-zinc-600">Skipped</span>
                      </div>
                    );
                  }

                  if (status === "awaiting_upload") {
                    return (
                      <div
                        key={source.key}
                        className="rounded-lg border border-amber-500/30 bg-amber-500/5"
                      >
                        <div className="flex items-center justify-between px-4 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <svg className="text-amber-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            <span className="text-sm font-medium text-zinc-200">{source.source}</span>
                            <span className="text-xs text-amber-400/70">Upload to continue</span>
                          </div>
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-400">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                            Waiting
                          </span>
                        </div>

                        <div className="px-4 pb-3">
                          <div
                            onDragOver={(e) => { e.preventDefault(); setManualDragOver(true); }}
                            onDragLeave={() => setManualDragOver(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setManualDragOver(false);
                              const droppedFile = e.dataTransfer.files[0];
                              if (droppedFile) handleManualUpload(source.key, droppedFile);
                            }}
                            className={`relative rounded-lg border-2 border-dashed px-4 py-4 text-center transition-colors duration-200 ${
                              manualDragOver ? "border-amber-500/50 bg-amber-500/5" : "border-zinc-800 hover:border-zinc-700"
                            }`}
                          >
                            <input
                              type="file"
                              accept=".csv,.txt,.tsv,.json"
                              onChange={(e) => {
                                const uploadedFile = e.target.files?.[0];
                                if (uploadedFile) handleManualUpload(source.key, uploadedFile);
                              }}
                              className="absolute inset-0 cursor-pointer opacity-0"
                            />
                            <p className="text-sm text-zinc-500">
                              Drop {source.source} export or{" "}
                              <span className="text-zinc-300">browse</span>
                            </p>
                          </div>
                          <button
                            onClick={handleSkipSource}
                            className="mt-1.5 text-xs text-zinc-600 transition-colors hover:text-zinc-400"
                          >
                            Skip — use generated data instead
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          )}

          {/* Collapsed sources summary */}
          {sourcesReady && (
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-zinc-500">
                Data Sources
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                {DATA_SOURCES.map((source, i) => {
                  const status = sourceStatuses[i];
                  const isLoaded = status === "loaded";
                  return (
                    <div key={source.key} className="flex items-center gap-1.5">
                      {isLoaded ? (
                        <svg className="text-emerald-500" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
                      )}
                      <span className={`text-xs ${isLoaded ? "text-zinc-300" : "text-zinc-600"}`}>
                        {source.source}
                      </span>
                      {i < DATA_SOURCES.length - 1 && (
                        <span className="ml-1 text-zinc-800">|</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Context */}
          {sourcesReady && (
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-zinc-500">
                Additional Context{" "}
                <span className="normal-case tracking-normal text-zinc-600">
                  (optional)
                </span>
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="E.g., discussing clean energy allocation, gifting strategy for grandchildren..."
                rows={3}
                className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition-colors focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
              />
            </div>
          )}

          {/* Run button */}
          {sourcesReady && !running && (
            <button
              onClick={handleRun}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3.5 text-sm font-medium text-white transition-all duration-200 hover:bg-emerald-400"
            >
              Run Workflow
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Processing indicator */}
          {running && (
            <div className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-5 py-3.5">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500" />
              <span className="text-sm font-medium text-zinc-200">
                {activeStepIdx >= 0 && activeStepIdx < WORKFLOW_STEPS.length
                  ? WORKFLOW_STEPS[activeStepIdx].label
                  : "Processing..."}
              </span>
              <span className="ml-auto text-xs tabular-nums text-zinc-500">
                {elapsedSeconds}s
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right column: Workflow Progress */}
      {showProgress && (
        <div className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24">
            <h3 className="mb-5 text-xs font-medium uppercase tracking-widest text-zinc-500">
              Workflow Steps
            </h3>
            <div className="relative">
              <div className="absolute left-[11px] top-3 bottom-3 w-px bg-zinc-800" />

              <div className="space-y-0">
                {WORKFLOW_STEPS.map((step, i) => {
                  const status = stepStatuses[i];
                  return (
                    <div key={step.key} className="relative flex items-start gap-3.5 pb-6 last:pb-0">
                      <div className="relative z-10 shrink-0">
                        {status === "complete" ? (
                          <div className="flex h-[23px] w-[23px] items-center justify-center rounded-full bg-emerald-500">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          </div>
                        ) : status === "active" ? (
                          <div className="flex h-[23px] w-[23px] items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-500/10">
                            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                          </div>
                        ) : (
                          <div className="flex h-[23px] w-[23px] items-center justify-center rounded-full border-2 border-zinc-700 bg-zinc-900">
                            <div className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 pt-0.5">
                        <p
                          className={`text-sm font-medium transition-colors duration-300 ${
                            status === "complete"
                              ? "text-emerald-400"
                              : status === "active"
                                ? "text-zinc-100"
                                : "text-zinc-600"
                          }`}
                        >
                          {step.label}
                        </p>
                        <p
                          className={`text-xs transition-colors duration-300 ${
                            status === "active"
                              ? "text-zinc-400"
                              : "text-zinc-700"
                          }`}
                        >
                          {status === "active"
                            ? `Pulling from ${step.source}...`
                            : step.source}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Progress bar */}
            {running && (
              <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-zinc-400">
                    {stepStatuses.filter((s) => s === "complete").length} of{" "}
                    {WORKFLOW_STEPS.length} steps
                  </p>
                  <span className="text-xs tabular-nums text-zinc-500">
                    {elapsedSeconds}s
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-700 ease-out"
                    style={{
                      width: `${(stepStatuses.filter((s) => s === "complete").length / WORKFLOW_STEPS.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
