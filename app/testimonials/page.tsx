"use client";

import Link from "next/link";

const testimonials = [
  {
    role: "Senior Analyst",
    company: "Major Energy Company",
    text: "We were spending hours manually reviewing territory-specific memorandums and pulling out key information. Solution Threads came in, understood exactly what we needed, and built us a customized workflow with AI prompts tailored to our process. What used to take half a day now takes under an hour.",
    highlight: "Definitely surpassed my expectations.",
  },
  {
    role: "VC Lead",
    company: "Large Financial Institution",
    text: "Managing quarterly reporting across a 25-30 company portfolio with a three-person team was unsustainable. Solution Threads gave us a practical, repeatable system—no steep learning curve, no complex setup. We cut our reporting time by 30-50% and finally have bandwidth for actual strategic work.",
    highlight: "A repeatable process made manageable.",
  },
];

export default function Testimonials() {
  return (
    <main className="h-screen w-screen flex flex-col items-center justify-center relative px-4 sm:px-8">
      <div className="max-w-3xl mx-auto space-y-8 sm:space-y-10 relative z-10 text-center">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-navy">
            What our clients say
          </h1>
        </div>

        {/* Testimonials */}
        <div className="space-y-8 sm:space-y-10">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`space-y-3 animate-fade-in-delay-${index + 1}`}
            >
              <p className="text-sm sm:text-base text-slate/70 leading-relaxed italic">
                "{testimonial.text}"
              </p>
              <p className="text-base sm:text-lg text-navy font-medium border-l-2 border-teal pl-3 inline-block">
                {testimonial.highlight}
              </p>
              <p className="text-xs sm:text-sm text-slate/50">
                {testimonial.role}, {testimonial.company}
              </p>
            </div>
          ))}
        </div>

        {/* CTA & Back */}
        <div className="flex items-center justify-center gap-6 animate-fade-in-delay-3">
          <Link
            href="/"
            className="text-xs sm:text-sm text-slate/60 hover:text-teal transition-colors"
          >
            ← back
          </Link>
          <a
            href="mailto:griffin@punk-ventures.com?subject=Solution%20Threads%20Inquiry"
            className="text-xs sm:text-sm text-navy border-b-2 border-teal hover:text-teal transition-colors font-medium"
          >
            let's talk →
          </a>
        </div>
      </div>
    </main>
  );
}
