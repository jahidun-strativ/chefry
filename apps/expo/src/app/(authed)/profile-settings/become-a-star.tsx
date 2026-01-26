import type { FC } from "react";
import { useEffect } from "react";
import { View } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import Icon from "@expo/vector-icons/Feather";

import { api } from "@/utils/api";
import createToast from "@/utils/createToast";
import MainLayout from "@/components/main-layout";
import { RequestVerificationForm } from "@/components/request-verification-form";
import { Button } from "@/components/ui/button";
import Typography from "@/components/ui/typography";

const VerificationPage: FC = () => {
  const { data: me } = api.auth.user.me.useQuery();

  const handleCopyVerificationCodeToClipboard = () => {
    if (me?.verificationReferenceNumber) {
      void Clipboard.setStringAsync(me?.verificationReferenceNumber);
      createToast({
        type: "success",
        message: "Reference number copied to clipboard!",
      });
    }
  };

  const { replace } = useRouter();
  useEffect(() => {
    if (me && me.verified) {
      replace("/profile-settings");
    }
  }, [me, replace]);

  return (
    <MainLayout showBackButton contentType="scrollable" title="Verification" isLoading={!me} classes={{ content: "px-4" }}>
      {me?.verified && (
        <View className="mt-4 flex w-full flex-col items-center justify-center rounded-2xl border border-white p-6 pb-4 pt-8">
          <Icon name="check-circle" color="white" size={46} />
          <Typography cls="mb-8 mt-4 text-center text-2xl" fontWeight="medium">
            Verified
          </Typography>

          <Typography cls="mb-2 text-center text-sm" fontWeight="medium">
            Reference number
          </Typography>

          <Typography cls="mb-3 text-center text-3xl" fontWeight="medium">
            {me?.verificationReferenceNumber?.toUpperCase()}
          </Typography>

          <Button onPress={handleCopyVerificationCodeToClipboard} cls="w-20 mx-auto mb-12" variant="outline" size="xs">
            Copy
          </Button>

          <Button onPress={() => Linking.openURL("mailto:support@startracker.one")} variant="outline" size="sm" cls="w-full">
            Contact admin
          </Button>
        </View>
      )}

      {!me?.verified && (
        <View className="mt-4 w-full rounded-2xl border border-white p-6 pb-4 pt-8">
          <Typography cls="mb-1 text-center text-sm" fontWeight="medium">
            Verification required
          </Typography>
          <Typography cls="mb-2 text-center text-3xl" fontWeight="medium">
            {me?.verificationReferenceNumber?.toUpperCase()}
          </Typography>

          <Button onPress={handleCopyVerificationCodeToClipboard} cls="w-20 mx-auto mb-12" variant="outline" size="xs">
            Copy
          </Button>

          <Typography cls="mb-2 text-center text-xl" fontWeight="medium">
            Verification required
          </Typography>

          <Typography cls="mb-4 text-center text-sm">
            To become a Star on Star Tracker, your account must be verified. To start the verification process, fill in the form below and
            click "Request verification".
          </Typography>

          <Typography cls="mb-4 text-center text-sm">
            Our support staff will receive your request and be in touch shortly to let you know what is required.
          </Typography>

          <Typography cls="mb-4 text-center text-sm">
            The reference number above will be a reference for your verification case. If you have any trouble, feel free to contact our
            support at support@startracker.one
          </Typography>

          <Typography cls="mb-4 text-center text-sm">
            IMPORTANT! If you are not the person/team you say you are on the account Star Tracker will remove your account without further
            notice.
          </Typography>

          <RequestVerificationForm hasRequested={!!me?.requestedVerification} />
        </View>
      )}
    </MainLayout>
  );
};

export default VerificationPage;
