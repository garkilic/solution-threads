"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Dashboard({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string>("");

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  return (
    <div className="mx-auto max-w-3xl">
      <section>
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-zinc-500">
          Workflows
        </h2>
        <div className="space-y-4">
          {/* Client Meeting Prep */}
          <Link href={`/workflows/${slug}/client-prep`} className="group block">
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
                    briefing. Replaces 1–5 hours of manual prep.
                  </p>
                </div>
                <span className="mt-1 text-zinc-700 transition-colors duration-200 group-hover:text-emerald-500">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>

          {/* Children's Book Storytelling */}
          <Link href={`/workflows/${slug}/storytelling`} className="group block">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900">
              <div className="flex items-start justify-between">
                <div>
                  <div className="mb-3 flex items-center gap-3">
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
                    <h3 className="text-[15px] font-medium text-zinc-100">
                      Children's Book Storytelling
                    </h3>
                  </div>
                  <p className="ml-12 text-sm leading-relaxed text-zinc-500">
                    Turns family genealogy data and oral history into a
                    chapter-by-chapter illustrated children's book.
                  </p>
                </div>
                <span className="mt-1 text-zinc-700 transition-colors duration-200 group-hover:text-amber-500">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
