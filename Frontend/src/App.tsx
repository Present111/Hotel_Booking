import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import { Toaster } from "./components/ui/toaster";
import useAppContext from "./hooks/useAppContext";
import AuthLayout from "./layouts/AuthLayout";
import Layout from "./layouts/Layout";
import AddHotel from "./pages/AddHotel";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import ApiDocs from "./pages/ApiDocs";
import ApiStatus from "./pages/ApiStatus";
import Booking from "./pages/Booking";
import BookingGuide from "./pages/BookingGuide";
import CancellationPolicy from "./pages/CancellationPolicy";
import Detail from "./pages/Detail";
import EditHotel from "./pages/EditHotel";
import Home from "./pages/Home";
import Info from "./pages/Info";
import HelpCenter from "./pages/HelpCenter";
import MyBookings from "./pages/MyBookings";
import MyHotels from "./pages/MyHotels";
import AdminManagement from "./pages/AdminManagement";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Search from "./pages/Search";
import SignIn from "./pages/SignIn";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

const App = () => {
  const { isLoggedIn, currentUser } = useAppContext();
  const isAdmin = currentUser?.role === "admin";
  const isOwnerOrAdmin =
    currentUser?.role === "hotel_owner" || currentUser?.role === "admin";
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/search"
          element={
            <Layout>
              <Search />
            </Layout>
          }
        />
        <Route
          path="/help-center"
          element={
            <Layout>
              <HelpCenter />
            </Layout>
          }
        />
        <Route
          path="/booking-guide"
          element={
            <Layout>
              <BookingGuide />
            </Layout>
          }
        />
        <Route
          path="/cancellation-policy"
          element={
            <Layout>
              <CancellationPolicy />
            </Layout>
          }
        />
        <Route
          path="/privacy-policy"
          element={
            <Layout>
              <PrivacyPolicy />
            </Layout>
          }
        />
        <Route
          path="/terms-of-service"
          element={
            <Layout>
              <TermsOfService />
            </Layout>
          }
        />
        <Route
          path="/info"
          element={
            <Layout>
              <Info />
            </Layout>
          }
        />
        <Route
          path="/detail/:hotelId"
          element={
            <Layout>
              <Detail />
            </Layout>
          }
        />
        <Route
          path="/api-docs"
          element={
            <Layout>
              <ApiDocs />
            </Layout>
          }
        />
        <Route
          path="/api-status"
          element={
            <Layout>
              <ApiStatus />
            </Layout>
          }
        />
        <Route
          path="/analytics"
          element={
            isLoggedIn && isAdmin ? (
              <Layout>
                <AnalyticsDashboard />
              </Layout>
            ) : (
              <Navigate to={isLoggedIn ? "/" : "/sign-in"} replace />
            )
          }
        />
        <Route
          path="/admin"
          element={
            isLoggedIn && isAdmin ? (
              <Layout>
                <AdminManagement />
              </Layout>
            ) : (
              <Navigate to={isLoggedIn ? "/" : "/sign-in"} replace />
            )
          }
        />
        <Route
          path="/register"
          element={
            <AuthLayout>
              <Register />
            </AuthLayout>
          }
        />
        <Route
          path="/sign-in"
          element={
            <AuthLayout>
              <SignIn />
            </AuthLayout>
          }
        />

        <Route
          path="/hotel/:hotelId/booking"
          element={
            isLoggedIn ? (
              <Layout>
                <Booking />
              </Layout>
            ) : (
              <Navigate to="/sign-in" replace />
            )
          }
        />

        <Route
          path="/add-hotel"
          element={
            isLoggedIn && isOwnerOrAdmin ? (
              <Layout>
                <AddHotel />
              </Layout>
            ) : (
              <Navigate to={isLoggedIn ? "/" : "/sign-in"} replace />
            )
          }
        />
        <Route
          path="/edit-hotel/:hotelId"
          element={
            isLoggedIn && isOwnerOrAdmin ? (
              <Layout>
                <EditHotel />
              </Layout>
            ) : (
              <Navigate to={isLoggedIn ? "/" : "/sign-in"} replace />
            )
          }
        />
        <Route
          path="/my-hotels"
          element={
            isLoggedIn && isOwnerOrAdmin ? (
              <Layout>
                <MyHotels />
              </Layout>
            ) : (
              <Navigate to={isLoggedIn ? "/" : "/sign-in"} replace />
            )
          }
        />
        <Route
          path="/my-bookings"
          element={
            isLoggedIn ? (
              <Layout>
                <MyBookings />
              </Layout>
            ) : (
              <Navigate to="/sign-in" replace />
            )
          }
        />
        <Route
          path="/profile"
          element={
            isLoggedIn ? (
              <Layout>
                <Profile />
              </Layout>
            ) : (
              <Navigate to="/sign-in" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster />
    </Router>
  );
};

export default App;
