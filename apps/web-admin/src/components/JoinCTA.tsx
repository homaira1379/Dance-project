import React from "react";

export function JoinCTA() {
  return (
    <section className="py-16 bg-page">
      <div className="max-w-6xl mx-auto px-6">
        <div className="rounded-2xl bg-brand-soft p-10 shadow-soft border border-border text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to join <span className="text-brand">DanceLink</span>?
          </h3>

          <p className="text-muted max-w-2xl mx-auto mb-8">
            Choose your role and start using a modern platform for the dance community.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button className="bg-brand hover:bg-brand-dark text-white rounded-xl px-6 py-3 font-semibold transition">
              I’m a dancer
            </button>

            <button className="bg-white border border-border hover:border-brand/40 rounded-xl px-6 py-3 font-semibold transition">
              I’m a trainer
            </button>

            <button className="bg-white border border-border hover:border-brand/40 rounded-xl px-6 py-3 font-semibold transition">
              I have a studio
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
