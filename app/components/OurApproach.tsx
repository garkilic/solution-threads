import { Building2, Users, Wrench, CheckCircle } from "lucide-react";

export default function OurApproach() {
  const steps = [
    {
      icon: Building2,
      title: "Discovery",
      subtitle: "We visit your office",
      description:
        "Talk to your team members, understand how you actually work. Not how we think you should work.",
    },
    {
      icon: Users,
      title: "Assessment",
      subtitle: "Identify real problems",
      description:
        "We tell you what AI can solve. And what it can't. No false promises.",
    },
    {
      icon: Wrench,
      title: "Build",
      subtitle: "Deploy secure computing",
      description:
        "A secure computer at your workplace. Accessible via desktop and phone app. Your data never leaves your office.",
    },
    {
      icon: CheckCircle,
      title: "Integrate",
      subtitle: "Fit your workflow",
      description:
        "Your team uses it like any other tool. No 'change management.' No training circus.",
    },
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-white to-neutral">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h2 className="text-4xl md:text-5xl font-bold text-center text-primary mb-4">
          How we <span className="text-accent">actually work</span>
        </h2>
        <p className="text-xl text-neutral-dark text-center mb-16 max-w-2xl mx-auto">
          A human-first approach to solving your problems
        </p>

        {/* Steps - Desktop: Horizontal, Mobile: Vertical */}
        <div className="grid md:grid-cols-4 gap-8 md:gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                {/* Connector Line (Desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-accent-light z-0"></div>
                )}

                {/* Step Card */}
                <div className="relative z-10 text-center">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
                    <Icon className="w-12 h-12 text-accent" />
                  </div>

                  <div className="mb-2">
                    <span className="text-sm font-semibold text-accent uppercase tracking-wider">
                      Step {index + 1}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-primary mb-2">
                    {step.title}
                  </h3>

                  <p className="text-lg font-semibold text-neutral-dark mb-3">
                    {step.subtitle}
                  </p>

                  <p className="text-neutral-dark leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
