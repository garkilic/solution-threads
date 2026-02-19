"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { BookProject, BookChapter } from "@/lib/types";

const AGENTS = [
  { name: "Character Keeper", desc: "Mapping characters and relationships" },
  { name: "Oral History Weaver", desc: "Selecting the best family moments" },
  { name: "Narrative Writer", desc: "Writing the chapter narrative" },
  { name: "Art Director", desc: "Finding the perfect illustration moment" },
  { name: "Flux Image Model", desc: "Generating the illustration" },
];

const AGENT_DELAYS = [0, 7000, 14000, 25000, 33000];

function GeneratingOverlay({ chapterNumber }: { chapterNumber: number }) {
  const [activeAgent, setActiveAgent] = useState(0);

  useEffect(() => {
    const timers = AGENT_DELAYS.map((delay, i) =>
      setTimeout(() => setActiveAgent(i), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-[#09090b]/95 text-center backdrop-blur-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
        <svg
          className="animate-spin text-amber-400"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </div>
      <div>
        <p className="text-lg font-semibold text-zinc-100">
          Agents are writing Chapter {chapterNumber}...
        </p>
        <p className="mt-1.5 text-sm text-zinc-500">
          Five specialized agents working in sequence
        </p>
      </div>
      <div className="w-full max-w-sm space-y-2">
        {AGENTS.map((agent, i) => {
          const isDone = i < activeAgent;
          const isActive = i === activeAgent;
          return (
            <div
              key={agent.name}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all duration-500 ${
                isActive
                  ? "border-amber-500/30 bg-amber-500/5"
                  : isDone
                  ? "border-zinc-800/60 opacity-60"
                  : "border-zinc-800/30 opacity-30"
              }`}
            >
              {isDone ? (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
              ) : isActive ? (
                <div className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-400" />
              ) : (
                <div className="h-5 w-5 shrink-0 rounded-full border-2 border-zinc-700" />
              )}
              <div>
                <p className={`text-sm font-medium ${isActive ? "text-zinc-100" : isDone ? "text-zinc-400" : "text-zinc-600"}`}>
                  {agent.name}
                </p>
                {isActive && <p className="text-xs text-zinc-500">{agent.desc}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: BookChapter["status"] }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
        Approved
      </span>
    );
  }
  if (status === "revision_requested") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
        Revising
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
      Draft
    </span>
  );
}

export default function ChapterWorkspace({
  params,
}: {
  params: Promise<{ slug: string; projectId: string }>;
}) {
  const [slug, setSlug] = useState("");
  const [projectId, setProjectId] = useState("");

  const [project, setProject] = useState<BookProject | null>(null);
  const [chapters, setChapters] = useState<BookChapter[]>([]);
  const [currentChapterNumber, setCurrentChapterNumber] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingChapterNum, setGeneratingChapterNum] = useState(1);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);
  const [error, setError] = useState("");

  // Resolve params
  useEffect(() => {
    params.then((resolved) => {
      setSlug(resolved.slug);
      setProjectId(resolved.projectId);
    });
  }, [params]);

  const loadData = useCallback(async () => {
    if (!projectId) return;
    const res = await fetch(`/api/storytelling/workspace/${projectId}`);
    if (!res.ok) return;
    const { project: p, chapters: c } = await res.json();
    setProject(p);
    setChapters(c || []);
    if (c?.length > 0) {
      setCurrentChapterNumber(c[c.length - 1].chapter_number);
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentChapter = chapters.find(
    (c) => c.chapter_number === currentChapterNumber
  );
  const totalChapters = project?.chapter_outline?.length || 0;
  const nextChapterNumber = currentChapterNumber + 1;
  const hasNextChapter = nextChapterNumber <= totalChapters;

  async function runChapterGeneration(chapterNum: number, feedback?: string) {
    setIsGenerating(true);
    setGeneratingChapterNum(chapterNum);
    setError("");

    try {
      const res = await fetch("/api/run-chapter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          chapterNumber: chapterNum,
          feedback: feedback || null,
        }),
      });

      if (!res.ok) throw new Error("Chapter generation failed");

      await loadData();
      setCurrentChapterNumber(chapterNum);
      setShowFeedback(false);
      setFeedbackText("");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function updateStatus(
    chapterId: string,
    status: BookChapter["status"],
    feedback?: string
  ) {
    await fetch("/api/storytelling/chapter-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chapterId, status, feedback }),
    });
  }

  async function handleApprove() {
    if (!currentChapter) return;
    await updateStatus(currentChapter.id, "approved");
    await loadData();
    if (hasNextChapter) {
      runChapterGeneration(nextChapterNumber);
    }
  }

  async function handleRequestRevision() {
    if (!currentChapter) return;
    await updateStatus(currentChapter.id, "revision_requested");
    await loadData();
    setShowFeedback(true);
  }

  function handleRegenerate() {
    if (!currentChapter) return;
    runChapterGeneration(currentChapter.chapter_number, feedbackText);
  }

  if (!project) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-zinc-500">Loading project...</p>
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-zinc-400">No chapters yet.</p>
        <Link href={`/workflows/${slug}`} className="text-sm text-amber-400 hover:text-amber-300">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {isGenerating && <GeneratingOverlay chapterNumber={generatingChapterNum} />}

      {/* Top nav */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/workflows/${slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Dashboard
        </Link>
        <div className="text-right">
          <p className="text-sm font-medium text-zinc-200">{project.title}</p>
          <p className="text-xs text-zinc-600">{project.subject_name}</p>
        </div>
      </div>

      {/* Chapter title */}
      {currentChapter && (
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-widest text-zinc-600">
              Chapter {currentChapter.chapter_number}
            </span>
            <StatusChip status={currentChapter.status} />
          </div>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-100">
            {currentChapter.title}
          </h1>
        </div>
      )}

      {/* Two-column layout */}
      {currentChapter ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left: Narrative */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-zinc-600">
              Narrative
            </p>
            <div
              className="prose prose-sm max-w-none leading-relaxed text-zinc-300"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {(currentChapter.narrative || "").split("\n\n").map((para, i) => (
                <p key={i} className="mb-4 last:mb-0">
                  {para}
                </p>
              ))}
            </div>
          </div>

          {/* Right: Illustration */}
          <div className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30">
              {currentChapter.image_url ? (
                <img
                  src={currentChapter.image_url}
                  alt={`Illustration for ${currentChapter.title}`}
                  className="w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square flex-col items-center justify-center gap-3 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800">
                    <svg className="text-zinc-600" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M3 9l4-4 4 4 4-4 4 4" />
                      <circle cx="8.5" cy="13.5" r="1.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">No illustration</p>
                    <p className="mt-0.5 text-xs text-zinc-700">
                      Add REPLICATE_API_TOKEN to enable image generation
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Illustration prompt (collapsible) */}
            {currentChapter.illustration_prompt && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30">
                <button
                  onClick={() => setShowPrompt(!showPrompt)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left"
                >
                  <span className="text-xs font-medium uppercase tracking-widest text-zinc-600">
                    Illustration Prompt
                  </span>
                  <svg
                    className={`text-zinc-600 transition-transform duration-200 ${showPrompt ? "rotate-180" : ""}`}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {showPrompt && (
                  <div className="border-t border-zinc-800 px-4 pb-4 pt-3">
                    <p className="text-xs leading-relaxed text-zinc-500">
                      {currentChapter.illustration_prompt}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex min-h-[30vh] items-center justify-center rounded-xl border border-dashed border-zinc-800">
          <p className="text-sm text-zinc-600">Select a chapter to view</p>
        </div>
      )}

      {/* Chapter strip */}
      {chapters.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-zinc-600">
            Chapters
          </p>
          <div className="flex flex-wrap gap-2">
            {chapters.map((ch) => (
              <button
                key={ch.id}
                onClick={() => {
                  setCurrentChapterNumber(ch.chapter_number);
                  setShowFeedback(false);
                  setFeedbackText("");
                }}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  ch.chapter_number === currentChapterNumber
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                    : "border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                }`}
              >
                <span className="font-medium">Ch.{ch.chapter_number}</span>
                <StatusChip status={ch.status} />
              </button>
            ))}

            {/* Placeholder chips for unwritten chapters */}
            {totalChapters > 0 &&
              Array.from(
                { length: Math.max(0, totalChapters - chapters.length) },
                (_, i) => chapters.length + i + 1
              ).map((num) => (
                <div
                  key={num}
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-800/40 px-3 py-2 text-sm text-zinc-700 opacity-40"
                >
                  <span>Ch.{num}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Feedback area */}
      {showFeedback && (
        <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-amber-400/70">
            Revision Notes
          </label>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Describe what you'd like changed — e.g. 'Make the grandmother's voice warmer and add more detail about the kitchen scene'"
            rows={3}
            className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition-colors focus:border-zinc-700"
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={handleRegenerate}
              disabled={!feedbackText.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Regenerate Chapter
            </button>
            <button
              onClick={async () => {
                setShowFeedback(false);
                if (currentChapter?.status === "revision_requested") {
                  await updateStatus(currentChapter.id, "draft");
                  loadData();
                }
              }}
              className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Action bar */}
      {currentChapter && !showFeedback && currentChapter.status !== "approved" && (
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleApprove}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-400"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            {hasNextChapter
              ? `Approve & Generate Chapter ${nextChapterNumber}`
              : "Approve Chapter"}
          </button>
          <button
            onClick={handleRequestRevision}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-3 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-900"
          >
            Request Revisions
          </button>
        </div>
      )}

      {currentChapter?.status === "approved" && (
        <div className="mt-6 flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-3 text-sm font-medium text-emerald-400">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Chapter Approved
          </div>
          {hasNextChapter &&
            !chapters.find((c) => c.chapter_number === nextChapterNumber) && (
              <button
                onClick={() => runChapterGeneration(nextChapterNumber)}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-medium text-black transition-colors hover:bg-amber-400"
              >
                Generate Chapter {nextChapterNumber}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            )}
        </div>
      )}
    </div>
  );
}
