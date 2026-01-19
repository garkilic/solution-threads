import { X, CheckCircle } from "lucide-react";

export default function AntiPattern() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h2 className="text-4xl md:text-5xl font-bold text-center text-primary mb-16">
          Most AI consultants have it{" "}
          <span className="text-accent">backwards</span>
        </h2>

        {/* What They Do Wrong */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-primary mb-2">
              Start with flashy technology
            </h3>
            <p className="text-neutral-dark">
              They lead with "AI-powered" buzzwords before understanding your needs
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-primary mb-2">
              Promise to transform everything
            </h3>
            <p className="text-neutral-dark">
              Unrealistic claims about 10x productivity without knowing your workflow
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-primary mb-2">
              Want your sensitive data in the cloud
            </h3>
            <p className="text-neutral-dark">
              Generic platforms that expose your confidential information
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-24 h-1 bg-accent mx-auto my-12"></div>

        {/* What We Do Right */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-700" />
            </div>
            <h3 className="text-lg font-semibold text-primary mb-2">
              Start with your actual problems
            </h3>
            <p className="text-neutral-dark">
              We visit your office and understand how you actually work
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-700" />
            </div>
            <h3 className="text-lg font-semibold text-primary mb-2">
              Build only what you need
            </h3>
            <p className="text-neutral-dark">
              We tell you what AI can solve. And what it can't. No false promises.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-700" />
            </div>
            <h3 className="text-lg font-semibold text-primary mb-2">
              Keep your data on-premise
            </h3>
            <p className="text-neutral-dark">
              Secure computer at your workplace. Your data never leaves your office.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
