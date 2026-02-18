"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <main className="workflow-theme min-h-screen w-screen flex flex-col items-center justify-center relative px-4 sm:px-8 py-12 sm:py-0">
      {/* Animated background */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-300"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(6, 182, 212, 0.08) 0%, transparent 50%)`,
        }}
      />

      <div className="max-w-5xl mx-auto space-y-5 sm:space-y-7 relative z-10 text-center">
        {/* Main pitch - Hero */}
        <div className="space-y-3 sm:space-y-4 animate-fade-in">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold text-zinc-100 leading-tight">
            Turn chaos into
            <br />
            <span className="text-zinc-400">repeatable workflows.</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-3xl mx-auto">
            We map how your team works today, connect the systems you already use, and build AI-powered workflows that run themselves.
          </p>

          <p className="text-sm sm:text-base text-zinc-500 leading-relaxed max-w-2xl mx-auto pt-1 sm:pt-2">
            AI built into the process, not added on top—<span className="text-emerald-400 font-medium">no prompts, no thinking, just results</span>.
          </p>
        </div>

        {/* The Process Flow */}
        <div className="flex flex-col md:flex-row gap-5 sm:gap-8 md:gap-12 pt-2 sm:pt-4 text-left md:text-left animate-fade-in-delay-1">
          <div className="relative pl-4 border-l-2 border-emerald-500">
            <div className="text-xs font-semibold text-emerald-400 tracking-widest uppercase mb-1 sm:mb-2">Map</div>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed md:max-w-[200px]">
              We study your current workflow and find where AI can replace manual work.
            </p>
          </div>

          <div className="relative pl-4 border-l-2 border-emerald-500">
            <div className="text-xs font-semibold text-emerald-400 tracking-widest uppercase mb-1 sm:mb-2">Build</div>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed md:max-w-[200px]">
              We connect your systems and wire AI into each step of the process.
            </p>
          </div>

          <div className="relative pl-4 border-l-2 border-emerald-500">
            <div className="text-xs font-semibold text-emerald-400 tracking-widest uppercase mb-1 sm:mb-2">Deploy</div>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed md:max-w-[200px]">
              Your team runs workflows with one click—AI handles the rest.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-4 sm:pt-6 space-y-3 animate-fade-in-delay-2">
          <p className="text-sm sm:text-base text-zinc-400">Ready to put AI to work in your processes?</p>
          <a
            href="https://calendar.app.google/m84kkrxZbjSnbd1D7"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm sm:text-base text-zinc-200 border-b-2 border-emerald-500 hover:text-emerald-400 transition-colors font-medium"
          >
            let's talk →
          </a>

          {/* About & Testimonials links */}
          <div className="pt-3 sm:pt-4 flex items-center justify-center gap-4 sm:gap-6">
            <Link
              href="/about"
              className="text-xs sm:text-sm text-zinc-500 hover:text-emerald-400 transition-colors"
            >
              about us →
            </Link>
            <Link
              href="/testimonials"
              className="text-xs sm:text-sm text-zinc-500 hover:text-emerald-400 transition-colors"
            >
              testimonials →
            </Link>
          </div>

          {/* Punk Ventures attribution */}
          <div className="pt-8 sm:pt-12">
            <a
              href="https://punk-ventures.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-600 hover:text-zinc-500 transition-colors"
            >
              a punk ventures business
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
