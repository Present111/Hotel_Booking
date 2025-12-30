import {
  BedDouble,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-white via-primary-50 to-white text-primary-900 border-t border-primary-100">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-primary-50 p-2 rounded-lg shadow-soft">
                <BedDouble className="w-6 h-6 text-primary-700" />
              </div>
              <span className="text-2xl font-bold text-primary-800">
                Hotel Booking
              </span>
            </div>
            <p className="text-primary-700 leading-relaxed">
              Discover amazing hotels, resorts, and accommodations worldwide.
              Book with confidence and enjoy unforgettable experiences.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-primary-500 hover:text-primary-700 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-primary-500 hover:text-primary-700 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-primary-500 hover:text-primary-700 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-primary-500 hover:text-primary-700 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-primary-700 hover:text-primary-900 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/search"
                  className="text-primary-700 hover:text-primary-900 transition-colors"
                >
                  Hotels
                </Link>
              </li>
              <li>
                <Link
                  to="/info"
                  className="text-primary-700 hover:text-primary-900 transition-colors"
                >
                  Info
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/help-center"
                  className="text-primary-700 hover:text-primary-900 transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/booking-guide"
                  className="text-primary-700 hover:text-primary-900 transition-colors"
                >
                  Booking Guide
                </Link>
              </li>
              <li>
                <Link
                  to="/cancellation-policy"
                  className="text-primary-700 hover:text-primary-900 transition-colors"
                >
                  Cancellation Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-primary-700 hover:text-primary-900 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-service"
                  className="text-primary-700 hover:text-primary-900 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/cookie-policy"
                  className="text-primary-700 hover:text-primary-900 transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-500" />
                <span className="text-primary-700">
                  contengikhong123@gmail.com
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-500" />
                <span className="text-primary-700">+84 889378933</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-primary-500" />
                <span className="text-primary-700">Ho Chi Minh, Viet Nam</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-primary-700 text-sm">© All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              to="/privacy-policy"
              className="text-primary-700 hover:text-primary-900 text-sm transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-of-service"
              className="text-primary-700 hover:text-primary-900 text-sm transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/cookie-policy"
              className="text-primary-700 hover:text-primary-900 text-sm transition-colors"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
