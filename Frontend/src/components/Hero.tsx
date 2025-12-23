import { Search, MapPin, Calendar, Users, Star } from "lucide-react";
import heroBg from "../assets/background.jpg";
import AdvancedSearch from "./AdvancedSearch";

const Hero = ({ onSearch }: { onSearch: (searchData: any) => void }) => {
  const scrollToSearch = () => {
    const target = document.getElementById("advanced-search");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const highlights = [
    { icon: Search, label: "Smart Search" },
    { icon: MapPin, label: "Global Destinations" },
    { icon: Calendar, label: "Flexible Booking" },
    { icon: Users, label: "24/7 Support" },
  ];

  const stats = [
    { label: "Happy Travelers", value: "10k+" },
    { label: "Cities Covered", value: "120+" },
    { label: "Avg. Rating", value: "4.8/5" },
    { label: "Instant Deals", value: "350+" },
  ];

  return (
    <section
      className="relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(8, 24, 72, 0.28), rgba(4, 18, 56, 0.32)), url(${heroBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0">
        <div className="absolute -top-24 -left-16 w-80 h-80 bg-white/30 blur-3xl rounded-full opacity-40" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary-200/50 blur-3xl rounded-full opacity-60" />
        <div className="absolute bottom-0 left-1/4 w-[480px] h-[120px] bg-white/30 blur-[70px] opacity-30" />
        <div className="absolute inset-0 bg-grid-white/[0.04] bg-[size:60px_60px] opacity-10" />
      </div>

      <div className="relative w-full px-4 sm:px-6 lg:px-8 pt-12 pb-12">
        <div className="max-w-7xl mx-auto text-center space-y-10">
          <div className="inline-flex items-center gap-3 bg-white/10 border border-white/20 backdrop-blur-md rounded-full px-6 py-2">
            <Star className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-semibold text-white/90">
              Handpicked stays. Zero guesswork.
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-white/15 text-white/80 border border-white/10">
              Loved by 10,000+ travelers
            </span>
          </div>

        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tight drop-shadow-[0_10px_35px_rgba(0,0,0,0.45)]">
            Escape ordinary,
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-300 to-yellow-300 drop-shadow-[0_10px_25px_rgba(0,0,0,0.35)]">
              find your dream stay
            </span>
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-white max-w-4xl mx-auto leading-relaxed drop-shadow-[0_6px_20px_rgba(0,0,0,0.35)]">
            Curated hotels, resorts, and boutique escapes worldwide. Compare instantly, book securely, and travel with confidence.
          </p>
        </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={scrollToSearch}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-white text-primary-700 font-semibold shadow-[0_15px_45px_rgba(0,0,0,0.25)] hover:shadow-[0_18px_55px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 transition-all duration-200"
            >
              <Search className="w-5 h-5" />
              Start searching stays
            </button>
            <button
              onClick={scrollToSearch}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl border border-white/50 bg-white/10 text-white font-semibold backdrop-blur-sm shadow-[0_15px_45px_rgba(0,0,0,0.25)] hover:bg-white/15 transition-all duration-200"
            >
              <Calendar className="w-5 h-5" />
              See flexible options
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/15 bg-black/35 backdrop-blur-md px-4 py-3 text-left shadow-[0_18px_45px_rgba(0,0,0,0.25)]"
              >
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
            {highlights.map((item) => (
              <div
                key={item.label}
                className="inline-flex items-center gap-2 text-white bg-black/30 border border-white/15 rounded-full px-4 py-2 backdrop-blur-md shadow-[0_10px_35px_rgba(0,0,0,0.25)]"
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div id="advanced-search" className="max-w-8xl mx-auto mt-12">
          <AdvancedSearch onSearch={onSearch} />
        </div>
      </div>
    </section>
  );
};

export default Hero;
