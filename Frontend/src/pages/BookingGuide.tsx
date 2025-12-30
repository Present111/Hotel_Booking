const steps = [
  {
    title: "Search stays",
    detail:
      "Use filters for location, dates, guests, and amenities to narrow options that match your trip.",
  },
  {
    title: "Compare rooms",
    detail:
      "Review room types, photos, inclusions, and cancellation rules. Check total price with taxes and fees.",
  },
  {
    title: "Confirm details",
    detail:
      "Enter guest info, preferences, and payment method. Verify arrival time and special requests before booking.",
  },
  {
    title: "Manage your trip",
    detail:
      "Visit My Bookings to update dates, change guests, or cancel if the policy allows.",
  },
];

const BookingGuide = () => {
  return (
    <div className="bg-gradient-to-b from-white via-primary-50 to-white min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <header className="space-y-3">
          <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide">
            Support
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary-900">
            Booking Guide
          </h1>
          <p className="text-primary-700 text-lg leading-relaxed">
            Follow these steps to book confidently and keep your plans flexible.
          </p>
        </header>

        <section className="grid gap-4">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="bg-white border border-primary-100 shadow-soft rounded-2xl p-6 space-y-2"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
                  Step {index + 1}
                </span>
                <h3 className="text-xl font-semibold text-primary-900">
                  {step.title}
                </h3>
              </div>
              <p className="text-primary-700 leading-relaxed">{step.detail}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default BookingGuide;
