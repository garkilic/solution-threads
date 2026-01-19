export default function Difference() {
  return (
    <section className="py-32 px-6 border-t border-charcoal/10">
      <div className="max-w-3xl mx-auto">
        {/* Two-column contrast */}
        <div className="grid md:grid-cols-2 gap-16 md:gap-24">
          {/* Others */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-medium text-gray/40 leading-tight">
              Most consultants
            </h2>
            <div className="space-y-4 text-lg text-gray/60 leading-relaxed">
              <p>Start with technology</p>
              <p>Promise everything</p>
              <p>Cloud-first, security later</p>
              <p>Pilot that goes nowhere</p>
            </div>
          </div>

          {/* Us */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-medium text-charcoal leading-tight">
              We start with you
            </h2>
            <div className="space-y-4 text-lg text-charcoal leading-relaxed">
              <p>Visit your office first</p>
              <p>Tell you what won't work</p>
              <p>On-premise, secure by design</p>
              <p>Build only what you need</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-20 h-px bg-charcoal/10"></div>

        {/* How it works - minimal */}
        <div className="space-y-12">
          <h2 className="text-3xl md:text-4xl font-medium text-charcoal text-center">
            How it works
          </h2>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-3">
              <div className="text-6xl font-light text-forest">1</div>
              <h3 className="text-xl font-medium text-charcoal">Discovery</h3>
              <p className="text-gray leading-relaxed">
                We visit your office and understand your workflow
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-6xl font-light text-forest">2</div>
              <h3 className="text-xl font-medium text-charcoal">Build</h3>
              <p className="text-gray leading-relaxed">
                We deploy secure, on-premise solutions that fit
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-6xl font-light text-forest">3</div>
              <h3 className="text-xl font-medium text-charcoal">Support</h3>
              <p className="text-gray leading-relaxed">
                Your team uses it. We maintain it. Simple.
              </p>
            </div>
          </div>
        </div>

        {/* Philosophy quote */}
        <div className="mt-20 pt-12 border-t border-charcoal/10">
          <blockquote className="text-2xl md:text-3xl font-medium text-charcoal italic text-center leading-relaxed">
            "We don't want you to use AI
            <br />
            <span className="text-forest">(unless you absolutely have to)</span>"
          </blockquote>
        </div>
      </div>
    </section>
  );
}
