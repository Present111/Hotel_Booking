const rules = [
  {
    title: "Free cancellation windows",
    detail:
      "Many stays allow free cancellation until a specific date and time. Check the deadline shown before you book.",
  },
  {
    title: "Late cancellation fees",
    detail:
      "Canceling after the free window may incur one night’s fee or the full stay, depending on the property.",
  },
  {
    title: "No-show policy",
    detail:
      "If you do not arrive and do not cancel, properties may charge the full reservation amount.",
  },
  {
    title: "How to cancel",
    detail:
      "Go to My Bookings, open your reservation, and select Cancel. We’ll confirm the fee (if any) before you proceed.",
  },
];

const CancellationPolicy = () => {
  return (
    <div className="bg-gradient-to-b from-white via-primary-50 to-white min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <header className="space-y-3">
          <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide">
            Support
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary-900">
            Cancellation Policy
          </h1>
          <p className="text-primary-700 text-lg leading-relaxed">
            Understand how cancellations work and what fees may apply before you
            book.
          </p>
        </header>

        <section className="space-y-4">
          {rules.map((rule) => (
            <div
              key={rule.title}
              className="bg-white border border-primary-100 shadow-soft rounded-2xl p-6 space-y-2"
            >
              <h3 className="text-xl font-semibold text-primary-900">
                {rule.title}
              </h3>
              <p className="text-primary-700 leading-relaxed">{rule.detail}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default CancellationPolicy;
