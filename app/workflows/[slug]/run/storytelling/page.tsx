"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChapterOutlineItem } from "@/lib/types";

type AncestryMode = "paste" | "upload";

const TARGET_AGE_OPTIONS = [
  { value: "3-5", label: "3–5 years" },
  { value: "5-8", label: "5–8 years" },
  { value: "8-12", label: "8–12 years" },
];

const AGENTS = [
  { name: "Character Keeper", desc: "Mapping characters and relationships" },
  { name: "Oral History Weaver", desc: "Selecting the best family moments" },
  { name: "Narrative Writer", desc: "Writing the chapter narrative" },
  { name: "Art Director", desc: "Finding the perfect illustration moment" },
  { name: "Flux Image Model", desc: "Generating the illustration" },
];

const AGENT_DELAYS = [0, 6000, 12000, 22000, 30000];

function ChapterGeneratingOverlay({ chapterNumber }: { chapterNumber: number }) {
  const [activeAgent, setActiveAgent] = useState(0);

  useEffect(() => {
    const timers = AGENT_DELAYS.map((delay, i) =>
      setTimeout(() => setActiveAgent(i), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 text-center">
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
        <p className="text-lg font-medium text-zinc-100">
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
                  ? "border-zinc-800/60 bg-zinc-900/20 opacity-60"
                  : "border-zinc-800/30 bg-zinc-900/10 opacity-30"
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

export default function StorytellingSetupPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();

  const [slug, setSlug] = useState("");

  // Form fields
  const [bookTitle, setBookTitle] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [targetAge, setTargetAge] = useState("5-8");
  const [artStyle, setArtStyle] = useState("watercolor, soft pastels, storybook illustration");
  const [ancestryMode, setAncestryMode] = useState<AncestryMode>("paste");
  const [ancestryText, setAncestryText] = useState("");
  const [ancestryFileName, setAncestryFileName] = useState("");
  const [oralHistory, setOralHistory] = useState("");

  // Generation state
  const [phase, setPhase] = useState<"form" | "generating_outline" | "outline_ready" | "generating_chapter">("form");
  const [chapterOutline, setChapterOutline] = useState<ChapterOutlineItem[]>([]);
  const [projectId, setProjectId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    params.then((resolved) => setSlug(resolved.slug));
  }, [params]);

  function handleAncestryFile(file: File) {
    setAncestryFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setAncestryText((e.target?.result as string) || "");
    reader.readAsText(file);
  }

  async function handleGenerateOutline() {
    if (!bookTitle.trim() || !subjectName.trim()) {
      setError("Book title and family subject name are required.");
      return;
    }
    setError("");
    setPhase("generating_outline");

    try {
      const res = await fetch("/api/run-story-architect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: bookTitle,
          subjectName,
          targetAge,
          artStyle,
          ancestryData: ancestryText,
          oralHistory,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate outline");
      const data = await res.json();

      // Create project via secure API route
      const createRes = await fetch("/api/storytelling/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          title: bookTitle,
          subjectName,
          artStyle,
          targetAge,
          ancestryData: ancestryText,
          oralHistory,
          chapterOutline: data.chapterOutline,
        }),
      });
      if (!createRes.ok) throw new Error("Failed to save project");
      const { id } = await createRes.json();

      setProjectId(id);
      setChapterOutline(data.chapterOutline);
      setPhase("outline_ready");
    } catch (err) {
      console.error(err);
      setError("Something went wrong generating the outline. Please try again.");
      setPhase("form");
    }
  }

  async function handleBeginWriting() {
    setPhase("generating_chapter");

    try {
      const res = await fetch("/api/run-chapter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, chapterNumber: 1 }),
      });

      if (!res.ok) throw new Error("Failed to generate chapter");

      router.push(`/workflows/${slug}/storytelling/${projectId}`);
    } catch (err) {
      console.error(err);
      setError("Something went wrong generating the first chapter.");
      setPhase("outline_ready");
    }
  }

  // --- Generating overlay ---
  if (phase === "generating_outline") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
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
          <p className="text-lg font-medium text-zinc-100">Planning your book...</p>
          <p className="mt-1.5 text-sm text-zinc-500">
            The Story Architect is designing your chapter outline
          </p>
        </div>
      </div>
    );
  }

  if (phase === "generating_chapter") {
    return <ChapterGeneratingOverlay chapterNumber={1} />;
  }

  // --- Outline review ---
  if (phase === "outline_ready") {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10">
              <svg className="text-emerald-500" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </span>
            <span className="text-sm text-emerald-400">Outline generated</span>
          </div>
          <h1 className="text-xl font-semibold text-zinc-100">{bookTitle}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {chapterOutline.length} chapters planned for {subjectName}
          </p>
        </div>

        <div className="mb-8 space-y-2">
          {chapterOutline.map((chapter) => (
            <div key={chapter.number} className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-4">
              <div className="flex items-start gap-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-xs font-medium text-amber-400">
                  {chapter.number}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-zinc-200">{chapter.title}</p>
                  <p className="mt-0.5 text-sm text-zinc-500">{chapter.theme}</p>
                  {chapter.keyCharacters?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {chapter.keyCharacters.map((char) => (
                        <span key={char} className="inline-block rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-0.5 text-[10px] text-zinc-500">
                          {char}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          onClick={handleBeginWriting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3.5 text-sm font-medium text-black transition-colors hover:bg-amber-400"
        >
          Begin Writing Chapter 1
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  // --- Main form ---
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/workflows/${slug}`}
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      <div className="mb-8">
        <h1 className="text-xl font-semibold text-zinc-100">New Book Setup</h1>
        <p className="mt-1.5 text-sm text-zinc-500">
          Tell us about the family. The Story Architect will plan the full chapter outline.
        </p>
      </div>

      <div className="space-y-6">
        {/* Book title */}
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-zinc-500">
            Book Title
          </label>
          <input
            type="text"
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            placeholder="e.g. The Story of the Getty Family"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition-colors focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
          />
        </div>

        {/* Subject name */}
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-zinc-500">
            Family Subject Name
          </label>
          <input
            type="text"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            placeholder="e.g. The Getty Family"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition-colors focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
          />
        </div>

        {/* Target age */}
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-zinc-500">
            Target Age Range
          </label>
          <div className="flex gap-2">
            {TARGET_AGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTargetAge(opt.value)}
                className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                  targetAge === opt.value
                    ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                    : "border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Art style */}
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-zinc-500">
            Art Style
          </label>
          <input
            type="text"
            value={artStyle}
            onChange={(e) => setArtStyle(e.target.value)}
            placeholder="e.g. watercolor, soft pastels, storybook illustration"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition-colors focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
          />
        </div>

        {/* Ancestry data */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-medium uppercase tracking-widest text-zinc-500">
              Ancestry Data{" "}
              <span className="normal-case tracking-normal text-zinc-600">(optional)</span>
            </label>
            <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900 p-0.5">
              <button
                type="button"
                onClick={() => setAncestryMode("paste")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  ancestryMode === "paste" ? "bg-zinc-800 text-zinc-200" : "text-zinc-600 hover:text-zinc-400"
                }`}
              >
                Paste
              </button>
              <button
                type="button"
                onClick={() => setAncestryMode("upload")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  ancestryMode === "upload" ? "bg-zinc-800 text-zinc-200" : "text-zinc-600 hover:text-zinc-400"
                }`}
              >
                Upload
              </button>
            </div>
          </div>
          <a
            href="/demo-data/ancestry-rivera.csv"
            download
            className="mb-2 inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-800/60 px-2 py-0.5 text-[11px] font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Sample CSV
          </a>

          {ancestryMode === "paste" ? (
            <textarea
              value={ancestryText}
              onChange={(e) => setAncestryText(e.target.value)}
              placeholder="Paste GEDCOM export, CSV family data, or any structured ancestry information..."
              rows={5}
              className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition-colors focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
            />
          ) : (
            <div className="relative rounded-xl border-2 border-dashed border-zinc-800 px-6 py-8 text-center hover:border-zinc-700">
              <input
                type="file"
                accept=".csv,.ged,.txt,.tsv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAncestryFile(file);
                }}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              {ancestryFileName ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="text-emerald-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span className="text-sm text-zinc-300">{ancestryFileName}</span>
                </div>
              ) : (
                <>
                  <p className="text-sm text-zinc-500">
                    Drop a CSV or GEDCOM file or{" "}
                    <span className="text-zinc-300">click to upload</span>
                  </p>
                  <p className="mt-1 text-xs text-zinc-700">CSV, GEDCOM, or plain text</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Oral history */}
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500">
            Oral History Notes{" "}
            <span className="normal-case tracking-normal text-zinc-600">(optional)</span>
          </label>
          <a
            href="/demo-data/oral-history-rivera.txt"
            download
            className="mb-2 inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-800/60 px-2 py-0.5 text-[11px] font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Sample notes
          </a>
          <textarea
            value={oralHistory}
            onChange={(e) => setOralHistory(e.target.value)}
            placeholder={`Stories, memories, anecdotes shared by family members. The more specific, the richer the book will be.\n\ne.g. 'Grandma always talked about the night they left Ireland — she was 7, holding her doll...'`}
            rows={6}
            className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition-colors focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          onClick={handleGenerateOutline}
          disabled={!bookTitle.trim() || !subjectName.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3.5 text-sm font-medium text-black transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Generate Book Outline
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
