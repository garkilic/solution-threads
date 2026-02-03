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
    <main className="min-h-screen w-screen flex flex-col items-center justify-center relative px-4 sm:px-8 py-12 sm:py-0">
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
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold text-navy leading-tight">
            Your AI Chief of Staff.
            <br />
            <span className="text-slate">Built around your team.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate/80 leading-relaxed max-w-3xl mx-auto">
            We figure out how you're using AI today, work alongside your people, and build a system that actually fits.
          </p>

          <p className="text-sm sm:text-base text-slate/70 leading-relaxed max-w-2xl mx-auto pt-1 sm:pt-2">
            No generic tools. No forcing AI where it doesn't belong—<span className="text-teal font-medium">just what works for you</span>.
          </p>
        </div>

        {/* Offerings */}
        <div className="flex flex-col md:flex-row gap-5 sm:gap-8 md:gap-16 pt-2 sm:pt-4 text-left md:text-left">
          <div className="relative pl-4 border-l-2 border-teal">
            <div className="text-xs font-semibold text-teal tracking-widest uppercase mb-1 sm:mb-2">Understand</div>
            <p className="text-sm sm:text-base text-slate/70 leading-relaxed md:max-w-[200px]">
              We learn how your team uses AI today and where the gaps are.
            </p>
          </div>

          <div className="relative pl-4 border-l-2 border-teal">
            <div className="text-xs font-semibold text-teal tracking-widest uppercase mb-1 sm:mb-2">Collaborate</div>
            <p className="text-sm sm:text-base text-slate/70 leading-relaxed md:max-w-[200px]">
              We work with your people to design what they actually need.
            </p>
          </div>

          <div className="relative pl-4 border-l-2 border-teal">
            <div className="text-xs font-semibold text-teal tracking-widest uppercase mb-1 sm:mb-2">Build</div>
            <p className="text-sm sm:text-base text-slate/70 leading-relaxed md:max-w-[200px]">
              We deliver your AI Chief of Staff—tailored to your workflow.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-4 sm:pt-6 space-y-3">
          <p className="text-sm sm:text-base text-slate/70">Ready to meet your new Chief of Staff?</p>
          <a
            href="mailto:griffin@punk-ventures.com?subject=Solution%20Threads%20Inquiry"
            className="inline-block text-sm sm:text-base text-navy border-b-2 border-teal hover:text-teal transition-colors font-medium"
          >
            let's talk →
          </a>

          {/* Note */}
          <p className="text-xs sm:text-sm text-slate/50 max-w-xl mx-auto pt-4 sm:pt-6 leading-relaxed">
            Don't mistake our website simplicity for lack of technical knowledge. We just don't want to waste your time.
          </p>

          {/* About link */}
          <div className="pt-3 sm:pt-4">
            <Link
              href="/about"
              className="text-xs sm:text-sm text-slate/60 hover:text-teal transition-colors"
            >
              about us →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
