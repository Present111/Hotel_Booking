import { Mail, MapPin, Phone } from "lucide-react";

const destinations = [
  "New York",
  "London",
  "Paris",
  "Tokyo",
  "Sydney",
  "Dubai",
  "Singapore",
  "Barcelona",
];

const Info = () => {
  return (
    <div className="bg-gradient-to-b from-white via-primary-50 to-white min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <header className="space-y-3">
          <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide">
            Plan your stay
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary-900">
            Destinations, about us, and contact details
          </h1>
          <p className="text-primary-700 text-lg leading-relaxed">
            Explore key destinations we support, learn more about our team, and
            reach out whenever you need help planning your next trip.
          </p>
        </header>

        <section
          id="destinations"
          className="bg-white border border-primary-100 shadow-soft rounded-2xl p-8 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-primary-900">
                Popular destinations
              </h2>
              <p className="text-primary-700">
                Browse highlights that travelers love booking with us.
              </p>
            </div>
            <span className="text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
              Curated list
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {destinations.map((city) => (
              <span
                key={city}
                className="px-4 py-2 rounded-full bg-primary-50 text-primary-800 border border-primary-100"
              >
                {city}
              </span>
            ))}
          </div>
        </section>

        <section
          id="about-us"
          className="bg-white border border-primary-100 shadow-soft rounded-2xl p-8 space-y-4"
        >
          <h2 className="text-2xl font-semibold text-primary-900">About us</h2>
          <p className="text-primary-700 leading-relaxed">
            Hotel Booking connects guests with stays that match how they want to
            travel. We focus on verified listings, transparent pricing, and
            responsive support so every reservation feels effortless.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-primary-50 border border-primary-100">
              <p className="text-sm font-semibold text-primary-700">
                What we do
              </p>
              <p className="text-primary-800">
                Streamlined search, personalized recommendations, and trusted
                reviews across hotels worldwide.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-primary-50 border border-primary-100">
              <p className="text-sm font-semibold text-primary-700">
                Why travelers stay
              </p>
              <p className="text-primary-800">
                Flexible cancellation options, clear policies, and real-time
                availability to keep plans on track.
              </p>
            </div>
          </div>
        </section>

        <section
          id="contact"
          className="bg-white border border-primary-100 shadow-soft rounded-2xl p-8 space-y-6"
        >
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-primary-900">
              Contact
            </h2>
            <p className="text-primary-700">
              We respond quickly to booking questions, partnership requests, and
              support needs.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-sm text-primary-600">Email</p>
                <a
                  href="mailto:contengikhong123@gmail.com"
                  className="text-primary-800 hover:text-primary-900"
                >
                  contengikhong123@gmail.com
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-sm text-primary-600">Phone</p>
                <a
                  href="tel:+84889378933"
                  className="text-primary-800 hover:text-primary-900"
                >
                  +84 889378933
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-sm text-primary-600">Office</p>
                <p className="text-primary-800">Ho Chi Minh City, Vietnam</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Info;
