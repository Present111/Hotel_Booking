import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQueryWithLoading } from "../hooks/useLoadingHooks";
import * as apiClient from "../api-client";
import {
  MapPin,
  Users,
  SlidersHorizontal,
  Star,
  Banknote,
  BadgeCheck,
  Globe2,
  Clock4,
  Sparkles,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { HotelType } from "../../../shared/types";

type Filters = {
  destination: string;
  minPrice: number;
  maxPrice: number;
  adults: number;
  children: number;
  type: string;
  minRating: number;
};

const defaultFilters: Filters = {
  destination: "",
  minPrice: 0,
  maxPrice: 0,
  adults: 2,
  children: 0,
  type: "any",
  minRating: 0,
};

const popularDestinations = [
  "New York",
  "London",
  "Paris",
  "Tokyo",
  "Sydney",
  "Dubai",
  "Singapore",
  "Barcelona",
];

const Search = () => {
  const location = useLocation();
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { data: hotels, isLoading } = useQueryWithLoading(
    "fetchHotels",
    apiClient.fetchHotels,
    {
      loadingMessage: "Loading hotels...",
    }
  );

  const filteredHotels = useMemo(() => {
    if (!hotels) return [];

    const normalizedDestination = filters.destination.trim().toLowerCase();

    return hotels.filter((hotel: HotelType) => {
      const matchesDestination =
        normalizedDestination === "" ||
        hotel.name.toLowerCase().includes(normalizedDestination) ||
        hotel.city.toLowerCase().includes(normalizedDestination) ||
        hotel.country.toLowerCase().includes(normalizedDestination);

      const matchesGuests =
        (!filters.adults || hotel.adultCount >= filters.adults) &&
        (!filters.children || hotel.childCount >= filters.children);

      const matchesPrice =
        (!filters.minPrice || hotel.pricePerNight >= filters.minPrice) &&
        (!filters.maxPrice || hotel.pricePerNight <= filters.maxPrice);

      const hotelTypes = Array.isArray(hotel.type) ? hotel.type : [hotel.type];
      const matchesType =
        filters.type === "any" || hotelTypes.includes(filters.type);

      const matchesRating =
        !filters.minRating || (hotel.starRating || 0) >= filters.minRating;

      return (
        matchesDestination &&
        matchesGuests &&
        matchesPrice &&
        matchesType &&
        matchesRating
      );
    });
  }, [hotels, filters]);

  // Sync filters with query params (so home search forwards values here)
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const parseNumber = (value: string | null, fallback = 0) => {
      const n = Number(value);
      return Number.isFinite(n) ? n : fallback;
    };

    setFilters((prev) => ({
      ...prev,
      destination: params.get("destination") || "",
      minPrice: parseNumber(params.get("minPrice"), prev.minPrice),
      maxPrice: parseNumber(params.get("maxPrice"), prev.maxPrice),
      adults: parseNumber(params.get("adults"), prev.adults),
      children: parseNumber(params.get("children"), prev.children),
      type: params.get("type") || prev.type,
      minRating: parseNumber(params.get("minRating"), prev.minRating),
    }));
  }, [location.search]);

  const handleInputChange = (
    field: keyof Filters,
    value: string | number
  ) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleQuickDestination = (city: string) => {
    setFilters((prev) => ({ ...prev, destination: city }));
  };

  return (
    <div className="space-y-10">
      {/* Hero + search */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-50 via-white to-primary-100 border border-primary-100 shadow-soft">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_left,#93c5fd,transparent_40%),radial-gradient(circle_at_bottom_right,#a5b4fc,transparent_35%)]" />

        <div className="relative z-10 px-4 sm:px-6 lg:px-10 py-10 space-y-8">
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div>
              <p className="text-sm font-semibold text-primary-700 uppercase tracking-wide">
                Smart Search
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Find stays you'll love - fast.
              </h1>
              <p className="text-gray-600 mt-2">
                Browse all available hotels and narrow down with flexible filters.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {[{
                label: "Happy Travelers",
                value: "10k+",
              }, {
                label: "Cities Covered",
                value: "120+",
              }, {
                label: "Avg. Rating",
                value: "4.8/5",
              }, {
                label: "Instant Deals",
                value: "350+",
              }].map((item) => (
                <div
                  key={item.label}
                  className="px-4 py-3 rounded-2xl bg-white/60 backdrop-blur border border-white shadow-sm"
                >
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    {item.label}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Search Card */}
          <Card className="border-none shadow-xl bg-white/90 backdrop-blur-md">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary-600" />
                      Destination
                    </label>
                    <Input
                      placeholder="Where to? (city, country, hotel)"
                      value={filters.destination}
                      onChange={(e) =>
                        handleInputChange("destination", e.target.value)
                      }
                      className="h-12 bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-primary-600" />
                      Price from
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={filters.minPrice}
                      onChange={(e) =>
                        handleInputChange("minPrice", Number(e.target.value) || 0)
                      }
                      className="h-12 bg-white"
                      placeholder="Min price"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-primary-600" />
                      Price to
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={filters.maxPrice}
                      onChange={(e) =>
                        handleInputChange("maxPrice", Number(e.target.value) || 0)
                      }
                      className="h-12 bg-white"
                      placeholder="Max price"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary-600" />
                      Guests
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        min={0}
                        value={filters.adults}
                        onChange={(e) =>
                          handleInputChange("adults", Number(e.target.value) || 0)
                        }
                        className="h-12 bg-white"
                        placeholder="Adults"
                      />
                      <Input
                        type="number"
                        min={0}
                        value={filters.children}
                        onChange={(e) =>
                          handleInputChange("children", Number(e.target.value) || 0)
                        }
                        className="h-12 bg-white"
                        placeholder="Children"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced((s) => !s)}
                    className="inline-flex items-center text-primary-700 font-semibold hover:text-primary-800 transition-colors"
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    {showAdvanced ? "Hide" : "Advanced"} Filters
                  </button>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setFilters(defaultFilters)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                      Reset
                    </Button>
                    <Button
                      type="submit"
                      className="bg-primary-600 hover:bg-primary-700 text-white px-6"
                    >
                      Search Hotels
                    </Button>
                  </div>
                </div>

                {showAdvanced && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Room type
                      </label>
                      <select
                        value={filters.type}
                        onChange={(e) => handleInputChange("type", e.target.value)}
                        className="h-12 w-full rounded-md border border-gray-200 px-3 bg-white text-gray-800"
                      >
                        <option value="any">Any type</option>
                        <option value="Luxury">Luxury</option>
                        <option value="Budget">Budget</option>
                        <option value="Family">Family</option>
                        <option value="Business">Business</option>
                        <option value="All Inclusive">All Inclusive</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Minimum star rating
                      </label>
                      <select
                        value={filters.minRating}
                        onChange={(e) =>
                          handleInputChange("minRating", Number(e.target.value))
                        }
                        className="h-12 w-full rounded-md border border-gray-200 px-3 bg-white text-gray-800"
                      >
                        <option value={0}>Any</option>
                        <option value={3}>3+</option>
                        <option value={4}>4+</option>
                        <option value={5}>5</option>
                      </select>
                    </div>
                  </div>
                )}
              </form>

              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Popular destinations
                </p>
                <div className="flex flex-wrap gap-2">
                  {popularDestinations.map((city) => (
                    <button
                      key={city}
                      onClick={() => handleQuickDestination(city)}
                      className="px-3 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors text-sm font-medium"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">Browse all available stays</p>
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredHotels.length} results
              {hotels?.length ? ` | ${hotels.length} total` : ""}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-sm">
            <BadgeCheck className="w-4 h-4 text-green-500" />
            <span>Real-time availability</span>
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-12 text-gray-500">Loading hotels...</div>
        )}

        {!isLoading && filteredHotels.length === 0 && (
          <div className="text-center py-12 bg-white border border-dashed border-gray-200 rounded-2xl shadow-soft">
            <p className="text-lg font-semibold text-gray-700">
              No matches for these filters.
            </p>
            <p className="text-gray-500 mt-1">
              Try widening the destination or increasing the price cap.
            </p>
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => setFilters(defaultFilters)}
            >
              Clear filters
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredHotels.map((hotel) => (
            <div
              key={hotel._id}
              className="group bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-2xl border border-gray-100 transition-all duration-300 flex flex-col h-full"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={hotel.imageUrls[0]}
                  alt={hotel.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />

                <div className="absolute top-4 left-4">
                  <div className="bg-primary-600 text-white rounded-full px-3 py-1 text-sm font-semibold shadow-lg">
                    ${hotel.pricePerNight}
                  </div>
                </div>
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <div className="flex items-center bg-white/90 px-3 py-1 rounded-full shadow">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                    <span className="ml-1 text-sm font-semibold text-gray-800">
                      {hotel.starRating}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4 text-primary-600" />
                  <span>
                    {hotel.city}, {hotel.country}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
                  {hotel.name}
                </h3>

                <div className="flex flex-wrap gap-2">
                  {hotel.type.slice(0, 3).map((type) => (
                    <Badge
                      key={type}
                      className="bg-gray-100 text-gray-800 border border-gray-200"
                    >
                      {type}
                    </Badge>
                  ))}
                </div>

                <p className="text-gray-600 line-clamp-2">{hotel.description}</p>

                <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary-600" />
                    <span>
                      {hotel.adultCount} adults
                      {hotel.childCount > 0 ? ` | ${hotel.childCount} children` : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-primary-600" />
                    <span>${hotel.pricePerNight} / night</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary-600" />
                    <span>{hotel.averageRating?.toFixed(1) || "New"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock4 className="w-4 h-4 text-primary-600" />
                    <span>Updated {new Date(hotel.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {hotel.facilities.slice(0, 4).map((facility) => (
                    <Badge
                      key={facility}
                      variant="outline"
                      className="text-xs px-2 py-1 bg-primary-50 border-primary-100 text-primary-700"
                    >
                      {facility}
                    </Badge>
                  ))}
                  {hotel.facilities.length > 4 && (
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      +{hotel.facilities.length - 4} more
                    </Badge>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe2 className="w-4 h-4 text-primary-600" />
                    <span>
                      {(hotel.totalBookings || 0) > 0
                        ? `${hotel.totalBookings} bookings`
                        : "New listing"}
                    </span>
                  </div>
                  <Link
                    to={`/detail/${hotel._id}`}
                    className="inline-flex items-center px-4 py-2 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors shadow"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Search;
