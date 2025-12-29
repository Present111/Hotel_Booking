import axiosInstance from "./lib/api-client";
import axios from "axios";
import { RegisterFormData } from "./pages/Register";
import { SignInFormData } from "./pages/SignIn";
import {
  AuthUser,
  BookingType,
  HotelSearchResponse,
  HotelType,
  HotelWithBookingsType,
  PaymentIntentResponse,
  UserType,
} from "../../shared/types";
import { BookingFormData } from "./forms/BookingForm/BookingForm";
import { queryClient } from "./main";

export type AdminUserPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserType["role"];
  phone?: string;
  isActive?: boolean;
};

export type AdminUserUpdatePayload = Partial<
  Omit<AdminUserPayload, "password">
> & {
  password?: string;
};

export type AdminBookingPayload = {
  userId: string;
  hotelId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  adultCount: number;
  childCount?: number;
  checkIn: string;
  checkOut: string;
  totalCost: number;
  status?: BookingType["status"];
  paymentStatus?: BookingType["paymentStatus"];
  paymentMethod?: string;
  specialRequests?: string;
};

export const fetchCurrentUser = async (): Promise<UserType> => {
  const response = await axiosInstance.get("/api/users/me");
  return response.data;
};

export type UpdateProfilePayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
};

export const updateCurrentUser = async (payload: UpdateProfilePayload) => {
  const response = await axiosInstance.patch("/api/users/me", payload);
  return response.data;
};

export const register = async (formData: RegisterFormData) => {
  const response = await axiosInstance.post("/api/users/register", formData);
  const token = response.data?.token;
  if (token) {
    localStorage.setItem("session_id", token);
  }
  if (response.data?.userId) {
    localStorage.setItem("user_id", response.data.userId);
  }
  if (response.data?.role) {
    localStorage.setItem("user_role", response.data.role);
  }
  return response.data;
};

export const signIn = async (formData: SignInFormData) => {
  try {
    const response = await axiosInstance.post("/api/auth/login", formData);

    // Store JWT token from response body in localStorage
    const token = response.data?.token;
    if (token) {
      localStorage.setItem("session_id", token);
      console.log(
        "JWT token stored in localStorage for incognito compatibility"
      );
    }

    // Store user info for incognito mode fallback
    if (response.data?.userId) {
      localStorage.setItem("user_id", response.data.userId);
      console.log("User ID stored for incognito mode fallback");
    }
    if (response.data?.role || response.data?.user?.role) {
      localStorage.setItem(
        "user_role",
        response.data.role || response.data.user.role
      );
    }

    // Force validate token after successful login to update React Query cache
    try {
      const validationResult = await validateToken();
      console.log("Token validation after login:", validationResult);

      // Invalidate and refetch the validateToken query to update the UI
      queryClient.invalidateQueries("validateToken");

      // Force a refetch to ensure the UI updates
      await queryClient.refetchQueries("validateToken");
    } catch (error) {
      console.log("Token validation failed after login, but continuing...");

      // Even if validation fails, if we have a token stored, consider it a success for incognito mode
      if (localStorage.getItem("session_id")) {
        console.log("Incognito mode detected - using stored token as fallback");
      }
    }

    return response.data;
  } catch (error: any) {
    const defaultMessage = "Email or password is incorrect.";

    // Normalize server errors to a friendly message for invalid credentials
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const serverMessage = (error.response?.data as any)?.message;

      if (status === 400 || status === 401) {
        // Validation errors may return an array from express-validator
        if (Array.isArray(serverMessage)) {
          const firstMsg = serverMessage[0]?.msg;
          throw new Error(firstMsg || defaultMessage);
        }

        if (typeof serverMessage === "string") {
          throw new Error(serverMessage || defaultMessage);
        }

        throw new Error(defaultMessage);
      }

      if (serverMessage) {
        throw new Error(serverMessage);
      }
    }

    throw new Error("Unable to sign in. Please try again.");
  }
};

export const validateToken = async (): Promise<AuthUser> => {
  try {
    const response = await axiosInstance.get("/api/auth/validate-token");
    const user = response.data as AuthUser;

    // Keep a minimal auth snapshot for role-based UI
    localStorage.setItem("user_id", user.userId);
    localStorage.setItem("user_role", user.role);

    return user;
  } catch (error: any) {
    if (error.response?.status === 401) {
      // Not logged in, throw error so React Query knows it failed
      throw new Error("Token invalid");
    }
    // For any other error (network, etc.), also throw
    throw new Error("Token validation failed");
  }
};

export const signOut = async () => {
  const response = await axiosInstance.post("/api/auth/logout");

  // Clear localStorage (JWT tokens)
  localStorage.removeItem("session_id");
  localStorage.removeItem("user_id");
  localStorage.removeItem("user_role");

  return response.data;
};

// Development utility to clear all browser storage
export const clearAllStorage = () => {
  // Clear localStorage
  localStorage.clear();
  // Clear sessionStorage
  sessionStorage.clear();
  // Clear cookies (by setting them to expire in the past)
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
};

export const addMyHotel = async (hotelFormData: FormData) => {
  const response = await axiosInstance.post("/api/my-hotels", hotelFormData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const fetchMyHotels = async (): Promise<HotelType[]> => {
  const response = await axiosInstance.get("/api/my-hotels");
  return response.data;
};

export const fetchMyHotelById = async (hotelId: string): Promise<HotelType> => {
  const response = await axiosInstance.get(`/api/my-hotels/${hotelId}`);
  return response.data;
};

export const updateMyHotelById = async (hotelFormData: FormData) => {
  const hotelId = hotelFormData.get("hotelId");
  const response = await axiosInstance.put(
    `/api/my-hotels/${hotelId}`,
    hotelFormData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export type SearchParams = {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  adultCount?: string;
  childCount?: string;
  page?: string;
  facilities?: string[];
  types?: string[];
  stars?: string[];
  maxPrice?: string;
  sortOption?: string;
};

export const searchHotels = async (
  searchParams: SearchParams
): Promise<HotelSearchResponse> => {
  const queryParams = new URLSearchParams();

  // Only add destination if it's not empty
  if (searchParams.destination && searchParams.destination.trim() !== "") {
    queryParams.append("destination", searchParams.destination.trim());
  }

  queryParams.append("checkIn", searchParams.checkIn || "");
  queryParams.append("checkOut", searchParams.checkOut || "");
  queryParams.append("adultCount", searchParams.adultCount || "");
  queryParams.append("childCount", searchParams.childCount || "");
  queryParams.append("page", searchParams.page || "");
  queryParams.append("maxPrice", searchParams.maxPrice || "");
  queryParams.append("sortOption", searchParams.sortOption || "");

  searchParams.facilities?.forEach((facility) =>
    queryParams.append("facilities", facility)
  );

  searchParams.types?.forEach((type) => queryParams.append("types", type));
  searchParams.stars?.forEach((star) => queryParams.append("stars", star));

  const response = await axiosInstance.get(`/api/hotels/search?${queryParams}`);
  return response.data;
};

export const fetchHotels = async (): Promise<HotelType[]> => {
  const response = await axiosInstance.get("/api/hotels");
  return response.data;
};

export const fetchHotelById = async (hotelId: string): Promise<HotelType> => {
  const response = await axiosInstance.get(`/api/hotels/${hotelId}`);
  return response.data;
};

export const createPaymentIntent = async (
  hotelId: string,
  numberOfNights: string
): Promise<PaymentIntentResponse> => {
  const response = await axiosInstance.post(
    `/api/hotels/${hotelId}/bookings/payment-intent`,
    { numberOfNights }
  );
  return response.data;
};

export const createRoomBooking = async (formData: BookingFormData) => {
  const response = await axiosInstance.post(
    `/api/hotels/${formData.hotelId}/bookings`,
    formData
  );

  return response.data;
};

export const fetchMyBookings = async (): Promise<HotelWithBookingsType[]> => {
  const response = await axiosInstance.get("/api/my-bookings");
  return response.data;
};

export const fetchHotelBookings = async (
  hotelId: string
): Promise<BookingType[]> => {
  const response = await axiosInstance.get(`/api/bookings/hotel/${hotelId}`);
  return response.data;
};

// Admin: manage users
export const fetchAdminUsers = async (): Promise<UserType[]> => {
  const response = await axiosInstance.get("/api/admin/users");
  return response.data;
};

export const createAdminUser = async (payload: AdminUserPayload) => {
  const response = await axiosInstance.post("/api/admin/users", payload);
  return response.data;
};

export const updateAdminUser = async (
  userId: string,
  payload: AdminUserUpdatePayload
) => {
  const response = await axiosInstance.patch(`/api/admin/users/${userId}`, payload);
  return response.data;
};

export const deleteAdminUser = async (userId: string) => {
  const response = await axiosInstance.delete(`/api/admin/users/${userId}`);
  return response.data;
};

// Admin: manage hotels
export const deleteHotel = async (hotelId: string) => {
  const response = await axiosInstance.delete(`/api/my-hotels/${hotelId}`);
  return response.data;
};

// Admin: manage bookings
export const fetchAllBookings = async () => {
  const response = await axiosInstance.get("/api/bookings");
  return response.data;
};

export const createAdminBooking = async (payload: AdminBookingPayload) => {
  const response = await axiosInstance.post("/api/admin/bookings", payload);
  return response.data;
};

export const updateBookingStatus = async (
  bookingId: string,
  payload: { status: string; cancellationReason?: string; refundAmount?: number }
) => {
  const response = await axiosInstance.patch(
    `/api/bookings/${bookingId}/status`,
    payload
  );
  return response.data;
};

export const updateBookingPayment = async (
  bookingId: string,
  payload: { paymentStatus: string; paymentMethod?: string }
) => {
  const response = await axiosInstance.patch(
    `/api/bookings/${bookingId}/payment`,
    payload
  );
  return response.data;
};

export const deleteBooking = async (bookingId: string) => {
  const response = await axiosInstance.delete(`/api/bookings/${bookingId}`);
  return response.data;
};

// Business Insights API functions
export const fetchBusinessInsightsDashboard = async () => {
  const response = await axiosInstance.get("/api/business-insights/dashboard");
  return response.data;
};

export const fetchBusinessInsightsForecast = async () => {
  const response = await axiosInstance.get("/api/business-insights/forecast");
  return response.data;
};

export const fetchBusinessInsightsPerformance = async () => {
  const response = await axiosInstance.get(
    "/api/business-insights/performance"
  );
  return response.data;
};
