import type { FC } from "react";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { Link } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useUser } from "@clerk/clerk-expo";
import Icon from "@expo/vector-icons/Octicons";

import { api, getBaseUrl } from "@/utils/api";
import createToast from "@/utils/createToast";
import MainLayout from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import Typography from "@/components/ui/typography";
import useWarmUpBrowser from "@/hooks/useWarmUpBrowser";

const AcceptTermsPage: FC = () => {
  useWarmUpBrowser();

  const { user } = useUser();
  // const { signOut } = useAuth();

  const [username, setUsername] = useState("");

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const handleToggleAcceptedTerms = () => setAcceptedTerms((prev) => !prev);

  const utils = api.useUtils();
  const { mutateAsync: createUser, isLoading } = api.auth.user.create.useMutation({
    onSuccess: async () => {
      await utils.auth.user.invalidate();
    },
  });

  const handleCreateUser = async () => {
    try {
      if (!user?.username && username) {
        if (!/^[a-z0-9_-]+$/.test(username)) {
          createToast({
            type: "error",
            message: "Username can only contain lowercase (a-z) letters,underscores (_) and hyphens (-)",
          });
          return;
        }
        await createUser({ username });
      } else {
        await createUser({});
      }
    } catch (e) {
      createToast({
        type: "error",
        message: e instanceof Error ? e.message : "Failed to create user",
      });
    }
  };

  const handleOpenTerms = () => {
    void WebBrowser.openBrowserAsync(getBaseUrl() + "/terms");
  };

  return (
    <MainLayout
      title={user?.username ? "Terms & Conditions" : "Finish account creation"}
      contentType="scrollable"
      description={
        user?.username
          ? "Before you start using the app you must agree to our terms and conditions."
          : "Pick a username to start using Star Tracker. Once you've picked a name you need to accept our terms and conditions."
      }
    >
      <View className="px-2">
        {!user?.username && (
          <View className="mt-8">
            <Input
              autoCapitalize="none"
              autoCorrect={false}
              value={username}
              onChangeText={setUsername}
              placeholder="Select a username..."
              label="Username"
            />
          </View>
        )}

        <View className="mt-12 flex flex-row items-center">
          <Pressable onPress={handleToggleAcceptedTerms} className="mr-6 h-6 w-6 overflow-hidden rounded-lg border-2 border-white">
            {acceptedTerms && (
              <View className="flex h-full w-full items-center justify-center bg-white">
                <Icon size={20} name="check" color="black" />
              </View>
            )}
          </Pressable>

          <Typography variant="p" cls="text-base">
            I have read and accept the{" "}
            <Link href="/accept-terms" className="underline" onPress={handleOpenTerms}>
              Terms and conditions
            </Link>
          </Typography>
        </View>

        <Button
          cls={user?.username ? "mt-12" : "mt-8"}
          variant="gradient"
          onPress={handleCreateUser}
          disabled={!acceptedTerms || (!user?.username && !username)}
          isLoading={isLoading}
        >
          Start using Star Tracker
        </Button>

        {/* <Button
          size="sm"
          onPress={() => void signOut()}
          variant="gradient"
          cls="border border-white"
          gradient={["#938DFB", "#9589F6", "#9B7FEA", "#A56ED5"]}
        >
          Logout
        </Button> */}
      </View>
    </MainLayout>
  );
};

export default AcceptTermsPage;
