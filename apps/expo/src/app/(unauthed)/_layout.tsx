import type { FC } from "react";
import { Platform } from "react-native";
import { Slot, Stack } from "expo-router";

const UnauthedLayout: FC = () => {
  if (Platform.OS === "ios") {
    return (
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    );
  } else {
    return <Slot />;
  }
};

export default UnauthedLayout;
