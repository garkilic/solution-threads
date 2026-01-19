import { Mail, Calendar } from "lucide-react";

export default function CTA() {
  return (
    <section id="cta" className="py-20 px-6 bg-primary">
      <div className="max-w-4xl mx-auto text-center">
        {/* Header */}
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Let's talk about your{" "}
          <span className="text-accent">actual problems</span>
        </h2>

        <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
          15-minute call. No pitch deck. No generic demo.
          <br />
          Just an honest conversation about your workflow.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <a
            href="mailto:griffin@punk-ventures.com?subject=Solution%20Threads%20Inquiry%20-%20Investment%20Firm"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold text-primary bg-white hover:bg-neutral transition-colors rounded-lg shadow-lg hover:shadow-xl w-full sm:w-auto"
          >
            <Mail className="w-5 h-5" />
            Email Us
          </a>

          <a
            href="#calendly"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold text-white border-2 border-white hover:bg-white hover:text-primary transition-colors rounded-lg w-full sm:w-auto"
          >
            <Calendar className="w-5 h-5" />
            Schedule a Call
          </a>
        </div>

        {/* Contact Info */}
        <div className="pt-8 border-t border-white/20">
          <p className="text-white/80">
            <span className="font-semibold">Email:</span>{" "}
            <a
              href="mailto:griffin@punk-ventures.com"
              className="text-accent hover:text-accent-light underline"
            >
              griffin@punk-ventures.com
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
