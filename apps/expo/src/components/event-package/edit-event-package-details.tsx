import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";

import type { RouterOutputs } from "@startracker/api";

import { api } from "@/utils/api";
import createToast from "@/utils/createToast";
import { Button } from "../ui/button";
import { EventPackageDetailsForm } from "./event-package-details-form";

type EventPackage = RouterOutputs["auth"]["eventPackage"]["getWithPosts"];

interface Props {
  eventPackage: EventPackage;
}

export function EditEventPackageDetails({ eventPackage }: Props) {
  const [details, setDetails] = useState<{ name: string; description: string; price: null | number }>({
    name: eventPackage?.name ?? "",
    description: eventPackage?.description ?? "",
    price: eventPackage?.price ?? null,
  });

  useEffect(() => {
    if (eventPackage) {
      setDetails({
        name: eventPackage.name,
        description: eventPackage.description,
        price: eventPackage.price / 100,
      });
    }
  }, [eventPackage]);

  const hasChanged = useMemo(() => {
    if (!eventPackage) return false;

    return details.name !== eventPackage.name || details.description !== eventPackage.description || details.price !== eventPackage.price;
  }, [details, eventPackage]);

  const utils = api.useUtils();
  const { mutate, isLoading } = api.auth.eventPackage.update.useMutation({
    onSuccess: async () => {
      await utils.auth.eventPackage.invalidate();
      createToast({
        message: "Event package updated!",
        type: "success",
      });
    },
    onError: (e) => {
      createToast({
        message: e.message,
        type: "error",
      });
    },
  });

  const handleUpdate = () => {
    if (!hasChanged || !eventPackage) return;

    if (!details.name) {
      createToast({
        message: "Please enter a name",
        type: "error",
      });
      return;
    }

    if (!details.description) {
      createToast({
        message: "Please enter a description",
        type: "error",
      });
      return;
    }

    if (details.price == null) {
      createToast({
        message: "Please enter a price",
        type: "error",
      });
      return;
    }

    mutate({
      id: eventPackage.id,
      name: details.name,
      description: details.description,
      price: details.price,
    });
  };

  return (
    <View className="flex flex-col">
      <EventPackageDetailsForm details={details} setDetails={setDetails} />

      <View className="h-6" />

      <Button isLoading={isLoading} disabled={!hasChanged} variant="gradient" onPress={handleUpdate}>
        Save changes
      </Button>
    </View>
  );
}
