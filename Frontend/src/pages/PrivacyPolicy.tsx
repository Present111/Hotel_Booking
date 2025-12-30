const sections = [
  {
    title: "Data we collect",
    content:
      "Account details, contact information, trip preferences, and payment data needed to process bookings.",
  },
  {
    title: "How we use your data",
    content:
      "To secure reservations, personalize search results, send confirmations, and improve site performance.",
  },
  {
    title: "Sharing with partners",
    content:
      "We share necessary booking details with hotels and payment providers; we do not sell personal data.",
  },
  {
    title: "Your choices",
    content:
      "Update profile data anytime, opt out of marketing emails, and request deletion where applicable.",
  },
  {
    title: "Security",
    content:
      "We apply encryption in transit and follow least-privilege access practices for sensitive systems.",
  },
];

const PrivacyPolicy = () => {
  return (
    <div className="bg-gradient-to-b from-white via-primary-50 to-white min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <header className="space-y-3">
          <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide">
            Support
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary-900">
            Privacy Policy
          </h1>
          <p className="text-primary-700 text-lg leading-relaxed">
            Learn how we collect, use, and protect your information across the
            Hotel Booking platform.
          </p>
        </header>

        <section className="space-y-4">
          {sections.map((item) => (
            <div
              key={item.title}
              className="bg-white border border-primary-100 shadow-soft rounded-2xl p-6 space-y-2"
            >
              <h3 className="text-xl font-semibold text-primary-900">
                {item.title}
              </h3>
              <p className="text-primary-700 leading-relaxed">{item.content}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
