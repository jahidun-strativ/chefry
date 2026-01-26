import type { ReactNode } from "react";

interface StripeWrapperProps {
  children: ReactNode;
}

// Web version - no Stripe provider needed
export const StripeWrapper = ({ children }: StripeWrapperProps) => {
  return <>{children}</>;
};
