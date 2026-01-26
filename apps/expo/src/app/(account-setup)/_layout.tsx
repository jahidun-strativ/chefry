import type { FC } from "react";
import { Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

const UnauthedLayout: FC = () => {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // headerStyle: { backgroundColor: "transparent" },
        // contentStyle: {
        //   backgroundColor: "transparent",
        // },
      }}
    />
  );
};

export default UnauthedLayout;
