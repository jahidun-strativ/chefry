import type { FC } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { Portal } from "@gorhom/portal";
import { Picker } from "@react-native-picker/picker";
import { AnimatePresence, MotiView } from "moti";

import BlurView from "../ui/blur-view";
import { Button } from "../ui/button";
import Typography from "../ui/typography";

interface Props {
  isOpen: boolean;
  price: number | null;
  onChange: (price: number | null) => void;
  onClose: () => void;
}

const SetEventPackagePriceModal: FC<Props> = ({ isOpen, price, onChange, onClose }) => {
  // const handleSetSubscriptionPrice = () => {
  //   if (isNaN(Number(subscriptionPrice))) {
  //     createToast({
  //       message: "Subscription price must be a number!",
  //       type: "error",
  //     });
  //     return;
  //   }

  //   if (Number(subscriptionPrice) <= 0) {
  //     createToast({
  //       message: "Subscription price must be larger than zero!",
  //       type: "error",
  //     });
  //     return;
  //   }

  //   if (Number(subscriptionPrice) > 100) {
  //     createToast({
  //       message: "Subscription price must be less than or exactly 100€",
  //       type: "error",
  //     });
  //     return;
  //   }
  // };

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
                  <View className="flex flex-col">
                    <Typography cls="text-2xl text-center mb-2" fontWeight="bold">
                      Package price
                    </Typography>

                    <Typography cls="mb-6 text-center">
                      Set your package price. This is the amount your startrackers will pay monthly to access your content.
                    </Typography>

                    <Picker
                      selectedValue={price}
                      onValueChange={(itemValue) => onChange(itemValue)}
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
                    {/* 
                      <Button
                        disabled={isNaN(Number(subscriptionPrice))}
                        cls="mt-4 w-full"
                        variant="gradient"
                        isLoading={isUpdatingSubscriptionPrice}
                        onPress={handleSetSubscriptionPrice}
                      >
                        Update
                      </Button> */}

                    <Button onPress={onClose} cls="mt-1 w-full">
                      Close and set price
                    </Button>
                  </View>
                </View>
              </MotiView>
            </KeyboardAvoidingView>
          </MotiView>
        )}
      </AnimatePresence>
    </Portal>
  );
};

export default SetEventPackagePriceModal;
