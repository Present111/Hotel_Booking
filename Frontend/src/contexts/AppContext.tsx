import React, { useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useQuery } from "react-query";
import * as apiClient from "../api-client";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { useToast } from "../hooks/use-toast";
import { AuthUser } from "../../../shared/types";

const STRIPE_PUB_KEY = import.meta.env.VITE_STRIPE_PUB_KEY || "";

type ToastMessage = {
  title: string;
  description?: string;
  type: "SUCCESS" | "ERROR" | "INFO";
};

export type AppContext = {
  showToast: (toastMessage: ToastMessage) => void;
  isLoggedIn: boolean;
  currentUser?: AuthUser;
  stripePromise: Promise<Stripe | null>;
  showGlobalLoading: (message?: string) => void;
  hideGlobalLoading: () => void;
  isGlobalLoading: boolean;
  globalLoadingMessage: string;
};

export const AppContext = React.createContext<AppContext | undefined>(
  undefined
);

const stripePromise = loadStripe(STRIPE_PUB_KEY);

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [globalLoadingMessage, setGlobalLoadingMessage] = useState(
    "Hotel room is getting ready..."
  );
  const { toast } = useToast();

  const getStoredUser = (): AuthUser | undefined => {
    const localToken = localStorage.getItem("session_id");
    const userId = localStorage.getItem("user_id");
    const role = localStorage.getItem("user_role") as AuthUser["role"] | null;

    if (localToken && userId && role) {
      return {
        userId,
        role,
      };
    }

    return undefined;
  };

  // Always run validation query - let it handle token checking internally
  const { data } = useQuery<AuthUser>(
    "validateToken",
    apiClient.validateToken,
    {
      retry: false,
      refetchOnWindowFocus: false, // Don't refetch on focus
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Always enabled - let validateToken handle missing tokens
      enabled: true,
      // Add fallback for JWT authentication
      onError: (error: any) => {
        // If validateToken fails, check if we have a token in localStorage
        const storedToken = localStorage.getItem("session_id");
        const storedUserId = localStorage.getItem("user_id");

        if (storedToken && error.response?.status === 401) {
          console.log(
            "JWT token found but validation failed - possible token expiration"
          );

          // If we also have a user ID, log the fallback usage
          if (storedUserId) {
            console.log("JWT session fallback - using stored token for UI only");
          }
        }
      },
    }
  );

  const storedUser = getStoredUser();
  const currentUser = data || storedUser;
  const finalIsLoggedIn = !!currentUser;

  const showToast = (toastMessage: ToastMessage) => {
    const variant =
      toastMessage.type === "SUCCESS"
        ? "success"
        : toastMessage.type === "ERROR"
        ? "destructive"
        : "info";

    toast({
      variant,
      title: toastMessage.title,
      description: toastMessage.description,
    });
  };

  const showGlobalLoading = (message?: string) => {
    if (message) {
      setGlobalLoadingMessage(message);
    }
    setIsGlobalLoading(true);
  };

  const hideGlobalLoading = () => {
    setIsGlobalLoading(false);
  };

  return (
    <AppContext.Provider
      value={{
        showToast,
        isLoggedIn: finalIsLoggedIn,
        currentUser: currentUser || undefined,
        stripePromise,
        showGlobalLoading,
        hideGlobalLoading,
        isGlobalLoading,
        globalLoadingMessage,
      }}
    >
      {isGlobalLoading && <LoadingSpinner message={globalLoadingMessage} />}
      {children}
    </AppContext.Provider>
  );
};
