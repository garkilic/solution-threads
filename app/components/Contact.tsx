export default function Contact() {
  return (
    <section className="py-32 px-6 border-t border-charcoal/10">
      <div className="max-w-2xl mx-auto text-center space-y-12">
        <h2 className="text-4xl md:text-5xl font-medium text-charcoal leading-tight">
          Let's talk about
          <br />
          your actual problems
        </h2>

        <p className="text-xl text-gray leading-relaxed max-w-xl mx-auto">
          15-minute call. No pitch. No demo.
          <br />
          Just an honest conversation.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
          <a
            href="mailto:griffin@punk-ventures.com?subject=Solution%20Threads%20Inquiry"
            className="inline-block px-8 py-4 text-lg font-medium text-cream bg-charcoal hover:bg-forest transition-all duration-300 ease-out border-2 border-charcoal hover:border-forest"
          >
            Email us
          </a>
          <a
            href="#calendly"
            className="inline-block px-8 py-4 text-lg font-medium text-charcoal bg-transparent hover:bg-charcoal hover:text-cream transition-all duration-300 ease-out border-2 border-charcoal"
          >
            Schedule call
          </a>
        </div>

        <div className="pt-12">
          <p className="text-sm text-gray">
            griffin@punk-ventures.com
          </p>
        </div>
      </div>
    </section>
  );
}
