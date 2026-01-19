import { Shield, Lock, FileCheck, Eye } from "lucide-react";

export default function Security() {
  const securityFeatures = [
    {
      icon: Shield,
      title: "On-premise computing",
      description: "Your data stays in your office. No cloud uploads, no third-party servers.",
    },
    {
      icon: Lock,
      title: "App-based access",
      description: "Desktop and mobile apps. No browser uploads, no cloud sync.",
    },
    {
      icon: FileCheck,
      title: "Full audit trail",
      description: "Compliance-ready from day one. Track every action, every query.",
    },
    {
      icon: Eye,
      title: "Your security protocols",
      description: "We adapt to your standards. Your IT team stays in control.",
    },
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-neutral to-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h2 className="text-4xl md:text-5xl font-bold text-center text-primary mb-4">
          Built for <span className="text-accent">fiduciary responsibility</span>
        </h2>
        <p className="text-xl text-neutral-dark text-center mb-16 max-w-2xl mx-auto">
          Security and confidentiality are non-negotiable
        </p>

        {/* Security Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {securityFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
                  <Icon className="w-10 h-10 text-accent" />
                </div>

                <h3 className="text-xl font-bold text-primary mb-3">
                  {feature.title}
                </h3>

                <p className="text-neutral-dark leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Trust Statement */}
        <div className="mt-16 p-8 bg-primary rounded-lg text-center">
          <p className="text-xl text-white leading-relaxed max-w-3xl mx-auto">
            <span className="font-semibold text-accent">
              Your competitive advantage depends on confidentiality.
            </span>{" "}
            We build systems that respect that. No exceptions.
          </p>
        </div>
      </div>
    </section>
  );
}
