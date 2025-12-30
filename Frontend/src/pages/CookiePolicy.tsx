const cookiePoints = [
  {
    title: "What are cookies?",
    detail:
      "Small text files stored on your device that help us remember your preferences, keep you signed in, and improve site performance.",
  },
  {
    title: "Essential cookies",
    detail:
      "Required for security, session management, and basic booking flows. You cannot disable these without affecting the service.",
  },
  {
    title: "Analytics and performance",
    detail:
      "Used to understand site usage, fix issues, and optimize pages. Data is aggregated and not used to identify you personally.",
  },
  {
    title: "Marketing cookies",
    detail:
      "Only used when you opt in to receive tailored offers. You can opt out at any time in your browser or account preferences.",
  },
  {
    title: "Your controls",
    detail:
      "You can clear or block cookies in your browser settings. Adjusting these settings may impact certain booking features.",
  },
];

const CookiePolicy = () => {
  return (
    <div className="bg-gradient-to-b from-white via-primary-50 to-white min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <header className="space-y-3">
          <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide">
            Support
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary-900">
            Cookie Policy
          </h1>
          <p className="text-primary-700 text-lg leading-relaxed">
            Learn how we use cookies to keep your account secure, personalize your experience, and improve Hotel Booking.
          </p>
        </header>

        <section className="space-y-4">
          {cookiePoints.map((item) => (
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

export default CookiePolicy;
