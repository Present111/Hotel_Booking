const terms = [
  {
    title: "Your account",
    detail:
      "Keep login details secure and ensure information you provide is accurate for every reservation.",
  },
  {
    title: "Use of the platform",
    detail:
      "You agree to follow property rules and comply with all booking policies shown at checkout.",
  },
  {
    title: "Payments and fees",
    detail:
      "Total prices include taxes and fees where applicable. Currency conversions may vary by provider.",
  },
  {
    title: "Cancellations and refunds",
    detail:
      "Refund eligibility depends on each property’s cancellation policy. We display applicable fees before you cancel.",
  },
  {
    title: "Liability",
    detail:
      "Hotel Booking facilitates reservations; stays are provided by the property. Service is provided as-available.",
  },
];

const TermsOfService = () => {
  return (
    <div className="bg-gradient-to-b from-white via-primary-50 to-white min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <header className="space-y-3">
          <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide">
            Support
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary-900">
            Terms of Service
          </h1>
          <p className="text-primary-700 text-lg leading-relaxed">
            Review the terms that govern use of the Hotel Booking platform and
            your reservations.
          </p>
        </header>

        <section className="space-y-4">
          {terms.map((item) => (
            <div
              key={item.title}
              className="bg-white border border-primary-100 shadow-soft rounded-2xl p-6 space-y-2"
            >
              <h3 className="text-xl font-semibold text-primary-900">
                {item.title}
              </h3>
              <p className="text-primary-700 leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
