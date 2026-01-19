import { TrendingUp, FileSearch, Activity, FileText, Search } from "lucide-react";

export default function WhatWeBuild() {
  const useCases = [
    {
      icon: TrendingUp,
      title: "Deal Flow Analysis",
      aiHandles: "Pattern recognition across hundreds of opportunities",
      teamControls: "Which deals get reviewed, investment decisions",
    },
    {
      icon: FileSearch,
      title: "Due Diligence Document Review",
      aiHandles: "Extract key terms, flag inconsistencies, summarize findings",
      teamControls: "Final review, risk assessment, go/no-go decisions",
    },
    {
      icon: Activity,
      title: "Portfolio Company Monitoring",
      aiHandles: "Track KPIs, detect anomalies, generate alerts",
      teamControls: "Intervention timing, strategic guidance, board decisions",
    },
    {
      icon: FileText,
      title: "LP Reporting Automation",
      aiHandles: "Compile data, generate drafts, format consistently",
      teamControls: "Narrative framing, final approval, relationship context",
    },
    {
      icon: Search,
      title: "Market Research Synthesis",
      aiHandles: "Aggregate sources, identify trends, create summaries",
      teamControls: "Investment thesis, strategic implications, positioning",
    },
  ];

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h2 className="text-4xl md:text-5xl font-bold text-center text-primary mb-4">
          Practical solutions, not{" "}
          <span className="text-accent">science projects</span>
        </h2>
        <p className="text-xl text-neutral-dark text-center mb-16 max-w-2xl mx-auto">
          Real use cases for investment firms
        </p>

        {/* Use Cases Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <div
                key={index}
                className="group p-8 rounded-lg border-2 border-neutral hover:border-accent transition-all hover:shadow-lg"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary">
                    {useCase.title}
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-accent uppercase tracking-wide mb-1">
                      AI Handles
                    </p>
                    <p className="text-neutral-dark">{useCase.aiHandles}</p>
                  </div>

                  <div className="h-px bg-neutral"></div>

                  <div>
                    <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-1">
                      Your Team Controls
                    </p>
                    <p className="text-neutral-dark">{useCase.teamControls}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
