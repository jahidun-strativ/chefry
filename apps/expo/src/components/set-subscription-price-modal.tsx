import type { FC } from "react";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { Portal } from "@gorhom/portal";
import { Picker } from "@react-native-picker/picker";
import { AnimatePresence, MotiView } from "moti";

import { api } from "@/utils/api";
import createToast from "@/utils/createToast";
import BlurView from "./ui/blur-view";
import { Button } from "./ui/button";
import Spinner from "./ui/spinner";
import Typography from "./ui/typography";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SetSubscriptionPriceModal: FC<Props> = ({ isOpen, onClose }) => {
  const [subscriptionPrice, setSubscriptionPrice] = useState(5);

  const { data: stripePrice, isLoading, refetch: refetchStripePrice } = api.auth.stripe.mySubscriptionPrice.useQuery();

  useEffect(() => {
    if (stripePrice && stripePrice.unit_amount && stripePrice.unit_amount_decimal) {
      setSubscriptionPrice(stripePrice.unit_amount / 100);
    }
  }, [stripePrice]);

  const { mutate: setSubscriptionPriceMutation, isLoading: isUpdatingSubscriptionPrice } = api.auth.stripe.setSubscriptionPrice.useMutation(
    {
      onSuccess: async () => {
        await refetchStripePrice();
        createToast({
          message: "Subscription price updated!",
          type: "success",
        });
        onClose();
      },
      onError: (e) => {
        createToast({
          message: e.message,
          type: "error",
        });
      },
    },
  );

  const handleSetSubscriptionPrice = () => {
    if (isNaN(Number(subscriptionPrice))) {
      createToast({
        message: "Subscription price must be a number!",
        type: "error",
      });
      return;
    }

    if (Number(subscriptionPrice) <= 0) {
      createToast({
        message: "Subscription price must be larger than zero!",
        type: "error",
      });
      return;
    }

    if (Number(subscriptionPrice) > 100) {
      createToast({
        message: "Subscription price must be less than or exactly 100€",
        type: "error",
      });
      return;
    }

    setSubscriptionPriceMutation({ monthlyPrice: Number(subscriptionPrice) });
  };

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 300,
            }}
            className="absolute inset-0 z-50 flex h-full w-full items-center justify-center bg-black/70 p-6"
          >
            <KeyboardAvoidingView
              className="absolute flex h-full w-full items-center justify-center"
              behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
              <MotiView
                from={{ opacity: 0, translateY: 100 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: 100 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }}
                className="relative w-full overflow-hidden rounded-2xl border border-white shadow"
              >
                <BlurView cls="absolute inset-0 h-full w-full" />
                <View className="flex flex-col p-6 pb-2">
                  {isLoading && (
                    <View className="flex h-16 items-center justify-center">
                      <Spinner size={24} />
                    </View>
                  )}
                  {!isLoading && (
                    <View className="flex flex-col">
                      <Typography cls="text-2xl text-center mb-2" fontWeight="bold">
                        Subscription price
                      </Typography>

                      <Typography cls="mb-6 text-center">
                        Set your subscription price. This is the amount your startrackers will pay monthly to access your content.
                      </Typography>

                      <Picker
                        selectedValue={subscriptionPrice}
                        onValueChange={(itemValue) => setSubscriptionPrice(itemValue)}
                        mode="dropdown"
                        dropdownIconColor="#fff"
                      >
                        <Picker.Item
                          label="3 €"
                          value={3}
                          color="#fff"
                          style={{ backgroundColor: Platform.OS === "android" ? "rgba(0,0,0,0.5)" : undefined }}
                        />
                        <Picker.Item
                          label="5 €"
                          value={5}
                          color="#fff"
                          style={{ backgroundColor: Platform.OS === "android" ? "rgba(0,0,0,0.5)" : undefined }}
                        />
                        <Picker.Item
                          label="10 €"
                          value={10}
                          color="#fff"
                          style={{ backgroundColor: Platform.OS === "android" ? "rgba(0,0,0,0.5)" : undefined }}
                        />
                        <Picker.Item
                          label="15 €"
                          value={15}
                          color="#fff"
                          style={{ backgroundColor: Platform.OS === "android" ? "rgba(0,0,0,0.5)" : undefined }}
                        />
                        <Picker.Item
                          label="20 €"
                          value={20}
                          color="#fff"
                          style={{ backgroundColor: Platform.OS === "android" ? "rgba(0,0,0,0.5)" : undefined }}
                        />
                        <Picker.Item
                          label="30 €"
                          value={30}
                          color="#fff"
                          style={{ backgroundColor: Platform.OS === "android" ? "rgba(0,0,0,0.5)" : undefined }}
                        />
                        <Picker.Item
                          label="40 €"
                          value={40}
                          color="#fff"
                          style={{ backgroundColor: Platform.OS === "android" ? "rgba(0,0,0,0.5)" : undefined }}
                        />
                        <Picker.Item
                          label="50 €"
                          value={50}
                          color="#fff"
                          style={{ backgroundColor: Platform.OS === "android" ? "rgba(0,0,0,0.5)" : undefined }}
                        />
                        <Picker.Item
                          label="75 €"
                          value={75}
                          color="#fff"
                          style={{ backgroundColor: Platform.OS === "android" ? "rgba(0,0,0,0.5)" : undefined }}
                        />
                      </Picker>

                      <Button
                        disabled={isNaN(Number(subscriptionPrice))}
                        cls="mt-4 w-full"
                        variant="gradient"
                        isLoading={isUpdatingSubscriptionPrice}
                        onPress={handleSetSubscriptionPrice}
                      >
                        Update
                      </Button>

                      <Button onPress={onClose} cls="mt-1 w-full">
                        Cancel
                      </Button>
                    </View>
                  )}
                </View>
              </MotiView>
            </KeyboardAvoidingView>
          </MotiView>
        )}
      </AnimatePresence>
    </Portal>
  );
};

export default SetSubscriptionPriceModal;
