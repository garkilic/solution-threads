"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function About() {
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

      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 relative z-10">
        {/* Header */}
        <div className="space-y-3 sm:space-y-4 animate-fade-in text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-navy leading-tight">
            Who we are.
          </h1>
          <p className="text-base sm:text-lg text-slate/80 leading-relaxed max-w-2xl mx-auto">
            We&apos;ve built AI systems and evaluated them for acquisition. Now we do both for you.
          </p>
        </div>

        {/* Team */}
        <div className="flex flex-col md:flex-row gap-6 sm:gap-8 md:gap-12 pt-2">
          {/* Griffin */}
          <div className="relative pl-4 border-l-2 border-teal flex-1">
            <div className="text-xs font-semibold text-teal tracking-widest uppercase mb-1 sm:mb-2">Griffin Arkilic</div>
            <p className="text-sm sm:text-base text-slate/70 leading-relaxed">
              Built AI systems used by executives to make firmwide investment decisions. Led research on agentic AI, deepfakes, and humanoid robotics. Shipped products that drove $8M in sales and pushed an app into the Top 100 on iOS. Solution Threads has already worked with 9 enterprise clients.
            </p>
          </div>

          {/* Nicholas */}
          <div className="relative pl-4 border-l-2 border-teal flex-1">
            <div className="text-xs font-semibold text-teal tracking-widest uppercase mb-1 sm:mb-2">Nicholas Free</div>
            <p className="text-sm sm:text-base text-slate/70 leading-relaxed">
              Evaluated $80M+ in emerging AI and Cyber portfolios. Vetted 300+ companies and authored a foundational report on the convergence of AI, edge computing, and simulation. Built automation tools that drove 840% adoption across a 30,000-person organization. His first VR project hit 280K impressions in three months.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 sm:pt-4 animate-fade-in">
          <Link
            href="/"
            className="text-xs sm:text-sm text-slate/60 hover:text-teal transition-colors"
          >
            ← back
          </Link>
          <a
            href="mailto:griffin@punk-ventures.com?subject=Solution%20Threads%20Inquiry"
            className="text-xs sm:text-sm text-navy underline hover:text-teal transition-colors"
          >
            let&apos;s talk
          </a>
        </div>
      </div>
    </main>
  );
}
