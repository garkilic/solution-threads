export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="max-w-4xl mx-auto text-center space-y-12">
        {/* Main Statement */}
        <div className="space-y-6 opacity-0 animate-fade-in">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium text-charcoal leading-[1.1] tracking-tight">
            We don't sell AI.
            <br />
            We solve your{" "}
            <span className="italic text-forest">actual problems</span>.
          </h1>

          <p className="text-xl md:text-2xl text-gray max-w-2xl mx-auto leading-relaxed">
            We come to your office. Talk to your people. Build only what you need.
          </p>
        </div>

        {/* CTA */}
        <div className="opacity-0 animate-fade-in-delay">
          <a
            href="mailto:griffin@punk-ventures.com?subject=Solution%20Threads%20Inquiry"
            className="inline-block px-8 py-4 text-lg font-medium text-cream bg-charcoal hover:bg-forest transition-all duration-300 ease-out border-2 border-charcoal hover:border-forest"
          >
            Let's talk
          </a>
        </div>

        {/* Subtext */}
        <p className="text-sm text-gray opacity-0 animate-fade-in-delay">
          Serving boutique investment firms
        </p>
      </div>
    </section>
  );
}
