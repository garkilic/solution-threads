import { CheckCircle } from "lucide-react";

export default function WhyUs() {
  const reasons = [
    {
      title: "Small teams, significant budgets",
      description: "We understand your constraints and opportunities",
    },
    {
      title: "No AI hype",
      description: "We speak plainly about what works and what doesn't",
    },
    {
      title: "We fit your workflow",
      description: "You don't reorganize for us. We adapt to you.",
    },
    {
      title: "Real problems, real solutions",
      description: "No vaporware, no pilots that go nowhere",
    },
  ];

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h2 className="text-4xl md:text-5xl font-bold text-center text-primary mb-4">
          Why boutique firms{" "}
          <span className="text-accent">choose us</span>
        </h2>
        <p className="text-xl text-neutral-dark text-center mb-16">
          We're built for firms like yours
        </p>

        {/* Reasons */}
        <div className="space-y-6">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-6 rounded-lg hover:bg-neutral transition-colors"
            >
              <div className="flex-shrink-0">
                <CheckCircle className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary mb-2">
                  {reason.title}
                </h3>
                <p className="text-lg text-neutral-dark">
                  {reason.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Philosophy Statement */}
        <div className="mt-16 p-8 border-l-4 border-accent bg-neutral/50">
          <p className="text-2xl text-primary font-semibold italic">
            "We don't want you to use AI{" "}
            <span className="text-accent">(unless you absolutely have to)</span>"
          </p>
          <p className="text-lg text-neutral-dark mt-4">
            Technology should serve your strategy, not the other way around.
          </p>
        </div>
      </div>
    </section>
  );
}
