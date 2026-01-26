import type { Dispatch, SetStateAction } from "react";
import { View } from "react-native";

import useOpenState from "@/hooks/useOpenState";
import { Button } from "../ui/button";
import Input from "../ui/input";
import Typography from "../ui/typography";
import SetEventPackagePriceModal from "./set-event-package-price-modal";

export interface EventPackageDetails {
  name: string;
  description: string;
  price: null | number;
}

interface Props {
  details: EventPackageDetails;
  setDetails: Dispatch<SetStateAction<EventPackageDetails>>;
}

export function EventPackageDetailsForm({ setDetails, details }: Props) {
  const [setPriceModalOpen, openSetPriceModal, closeSetPriceModal] = useOpenState();

  const handleChangePrice = (price: number | null) => {
    setDetails((prev) => ({ ...prev, price }));
  };

  return (
    <View className="flex flex-col">
      <Input
        label="Name *"
        placeholder="Package name"
        value={details.name}
        onChangeText={(text) => setDetails((prev) => ({ ...prev, name: text }))}
      />

      <View className="h-6" />

      <Input
        label="Description *"
        placeholder="Package description"
        numberOfLines={6}
        multiline
        value={details.description}
        onChangeText={(text) => setDetails((prev) => ({ ...prev, description: text }))}
        classes={{ inputWrapper: "rounded-3xl" }}
      />

      <View className="h-6" />

      <View>
        <Typography cls="mb-1.5 ml-3 text-sm" variant="h3">
          Price *
        </Typography>

        <View className="mb-6 flex flex-row items-center justify-between px-3">
          <Typography className={details.price != null ? "text-3xl" : ""}>
            {details.price == null && "No price set"}
            {details.price != null && `${details.price} €`}
          </Typography>

          <Button onPress={openSetPriceModal} variant="outline" size="xs" cls="px-6">
            Update price
          </Button>
        </View>
      </View>

      <SetEventPackagePriceModal
        isOpen={setPriceModalOpen}
        onClose={closeSetPriceModal}
        price={details.price}
        onChange={handleChangePrice}
      />
    </View>
  );
}
