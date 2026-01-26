// Mock for @stripe/stripe-react-native on web
export const StripeProvider = ({ children }) => children;
export const usePaymentSheet = () => ({
  initPaymentSheet: () => Promise.resolve({ error: null }),
  presentPaymentSheet: () => Promise.resolve({ error: null }),
});
