import type { ReactNode } from "react";
import * as Linking from "expo-linking";
import { StripeProvider } from "@stripe/stripe-react-native";

interface StripeWrapperProps {
  children: ReactNode;
}

// Native version - includes Stripe provider
export const StripeWrapper = ({ children }: StripeWrapperProps) => {
  return (
    <StripeProvider
      publishableKey={
        process.env.EXPO_PUBLIC_ENV === "development"
          ? "pk_test_51NRD2kAOFakuVL49ePoyAOtprfWGWToJy2T6MN5IR7dgYGZ86A02lHTlSbUtsbNkhx0hygz8IFz3gar25KZjk8xN00ykDIwD9I"
          : "pk_live_51NRD2kAOFakuVL49MuqiimY4b0enW6IUva32qyr9qpoISUtHqSmxAh376nReantAorVlM7kb3RwQVLXqP9hhsokt00s6tepc3W"
      }
      urlScheme={process.env.EXPO_PUBLIC_ENV === "development" ? Linking.createURL("/--/") : Linking.createURL("")}
      // merchantIdentifier="merchant.com.{{YOUR_APP_NAME}}" // required for Apple Pay
    >
      {children}
    </StripeProvider>
  );
};
