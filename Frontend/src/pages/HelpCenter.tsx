const faqs = [
  {
    question: "How do I manage an existing booking?",
    answer:
      "Go to My Bookings, pick the reservation, and follow the prompts to modify dates, guests, or cancel based on the stay’s policy.",
  },
  {
    question: "Can I change guests after booking?",
    answer:
      "Yes. Most hotels let you adjust guest counts before check-in; updates may change the price depending on room rules.",
  },
  {
    question: "When will I be charged?",
    answer:
      "Payment timing depends on the property. We show whether you pay now or at the property before you confirm.",
  },
];

const HelpCenter = () => {
  return (
    <div className="bg-gradient-to-b from-white via-primary-50 to-white min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <header className="space-y-3">
          <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide">
            Support
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary-900">
            Help Center
          </h1>
          <p className="text-primary-700 text-lg leading-relaxed">
            Find quick answers to common booking questions and learn how to get
            the most out of your stay.
          </p>
        </header>

        <section className="bg-white border border-primary-100 shadow-soft rounded-2xl divide-y divide-primary-100">
          {faqs.map((item) => (
            <div key={item.question} className="p-6 space-y-2">
              <h3 className="text-lg font-semibold text-primary-900">
                {item.question}
              </h3>
              <p className="text-primary-700 leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default HelpCenter;
