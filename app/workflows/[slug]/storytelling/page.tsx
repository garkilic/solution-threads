"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookProject } from "@/lib/types";

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function StorytellingDashboard({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [slug, setSlug] = useState("");
  const [projects, setProjects] = useState<BookProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const resolved = await params;
      setSlug(resolved.slug);
      const res = await fetch(`/api/storytelling/projects?slug=${resolved.slug}`);
      if (res.ok) {
        const { projects } = await res.json();
        setProjects(projects || []);
      }
      setLoading(false);
    }
    load();
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
      {/* Header */}
      <div className="mb-8">
        <div>
          <Link
            href={`/workflows/${slug}`}
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
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
            Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
              <svg
                className="text-amber-500"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-zinc-100">
              Children&apos;s Book Storytelling
            </h1>
          </div>
        </div>
      </div>

      {/* The card — clicking starts a new book */}
      <Link href={`/workflows/${slug}/run/storytelling`} className="group mb-8 block">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-200 hover:border-amber-800 hover:bg-zinc-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-widest text-zinc-600">Start</p>
              <h2 className="text-base font-medium text-zinc-100">
                Create a New Book
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
                Upload ancestry data and oral history — the Story Architect will plan and write the full book chapter by chapter.
              </p>
            </div>
            <span className="mt-1 shrink-0 text-zinc-700 transition-colors duration-200 group-hover:text-amber-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </Link>

      {/* Project list */}
      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900">
            <svg
              className="text-zinc-600"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-zinc-400">No books yet</p>
          <p className="mt-1 text-sm text-zinc-600">
            Start your first family story book above.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-800/60 rounded-xl border border-zinc-800 bg-zinc-900/50">
          {projects.map((project) => {
            const chapterCount = project.chapter_outline?.length || 0;
            return (
              <Link
                key={project.id}
                href={`/workflows/${slug}/storytelling/${project.id}`}
                className="flex items-center justify-between px-5 py-4 transition-colors duration-150 hover:bg-zinc-800/40 first:rounded-t-xl last:rounded-b-xl"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-200">
                    {project.title}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {project.subject_name}
                    {chapterCount > 0 && (
                      <>
                        <span className="mx-1.5 text-zinc-700">&middot;</span>
                        {chapterCount} chapters planned
                      </>
                    )}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3 pl-4">
                  <span className="text-xs text-zinc-600">
                    {timeAgo(project.created_at)}
                  </span>
                  <svg
                    className="text-zinc-700"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
