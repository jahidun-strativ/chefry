import { useState } from "react";
import { View } from "react-native";

import { api } from "@/utils/api";
import createToast from "@/utils/createToast";
import { Button } from "./ui/button";
import Input from "./ui/input";

interface Props {
  hasRequested: boolean;
}

export function RequestVerificationForm({ hasRequested }: Props) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [agency, setAgency] = useState("");

  const utils = api.useUtils();
  const { mutate, isLoading } = api.auth.user.requestVerifiction.useMutation({
    onSuccess: async () => {
      await utils.auth.user.me.refetch();
      createToast({
        type: "success",
        message: "Verification request sent!",
      });
    },
    onError: (e) => {
      createToast({
        type: "error",
        message: "Something went wrong.",
      });
    },
  });

  return (
    <View className="flex flex-col">
      {!hasRequested && (
        <>
          <Input label="Full name" value={fullName} onChangeText={setFullName} />
          <View className="h-4" />
          <Input label="Cell phone" value={phone} onChangeText={setPhone} />
          <View className="h-4" />
          <Input label="Agency/management" value={agency} onChangeText={setAgency} />
          <View className="h-6" />
        </>
      )}

      <Button
        onPress={() => mutate({ agency, fullName, phone })}
        disabled={hasRequested || fullName === "" || phone === "" || agency === ""}
        variant="gradient"
        size="sm"
        isLoading={isLoading}
      >
        {hasRequested ? "Verification request sent" : "Request verification"}
      </Button>
      <View className="h-8" />
    </View>
  );
}
