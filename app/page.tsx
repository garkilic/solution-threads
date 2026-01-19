"use client";

import { useEffect, useState } from "react";

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
    <main className="h-screen w-screen flex flex-col items-center justify-center overflow-hidden relative px-8">
      {/* Animated background */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-300"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(6, 182, 212, 0.08) 0%, transparent 50%)`,
        }}
      />

      <div className="max-w-5xl mx-auto space-y-7 relative z-10 text-center">
        {/* Main pitch - Hero */}
        <div className="space-y-4 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-semibold text-navy leading-tight">
            We don't sell AI.
            <br />
            <span className="text-slate">We solve your problems.</span>
          </h1>

          <p className="text-lg text-slate/80 leading-relaxed max-w-3xl mx-auto">
            We come to your workplace, talk to your people, and build only what actually helps. We keep it simple so we don't waste your time.
          </p>

          <p className="text-base text-slate/70 leading-relaxed max-w-2xl mx-auto pt-2">
            Honestly, we don't want you to use AI—<span className="text-teal font-medium">unless you absolutely have to</span>.
          </p>
        </div>

        {/* The Agentic System */}
        <div className="space-y-5 pt-4">
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-coral">1</div>
              <h3 className="text-lg font-semibold text-navy">Discovery</h3>
              <p className="text-base text-slate/70 leading-relaxed">
                We visit your office and map your actual workflow
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-2xl font-bold text-coral">2</div>
              <h3 className="text-lg font-semibold text-navy">Build Agents</h3>
              <p className="text-base text-slate/70 leading-relaxed">
                Custom AI agents for your specific tasks—no generic tools
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-2xl font-bold text-coral">3</div>
              <h3 className="text-lg font-semibold text-navy">Deploy On-Site</h3>
              <p className="text-base text-slate/70 leading-relaxed">
                Secure computer at your location, accessible from desktop or phone
              </p>
            </div>
          </div>

        </div>

        {/* CTA */}
        <div className="pt-6 space-y-4">
          <a
            href="mailto:griffin@punk-ventures.com?subject=Solution%20Threads%20Inquiry"
            className="text-lg text-navy underline hover:text-teal transition-colors font-medium"
          >
            send us an email
          </a>

          {/* Note */}
          <p className="text-base text-slate/70 max-w-2xl mx-auto pt-6 leading-relaxed">
            Don't mistake our website simplicity for lack of technical knowledge. We just don't want to waste your time.
          </p>
        </div>
      </div>
    </main>
  );
}
