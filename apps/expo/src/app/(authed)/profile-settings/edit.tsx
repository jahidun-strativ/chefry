import type { FC } from "react";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { useUser } from "@clerk/clerk-expo";

import { api } from "@/utils/api";
import createToast from "@/utils/createToast";
import type { INTEREST } from "@/utils/models";
import ChangeProfileImageButton from "@/components/change-profile-image-button";
import MainLayout from "@/components/main-layout";
import TagsEditor from "@/components/tags-editor";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";

const EditProfilePage: FC = () => {
  const { user } = useUser();
  const { data: me } = api.auth.user.me.useQuery();

  const [username, setUsername] = useState(me?.username ?? "");
  const [bio, setBio] = useState(me?.bio ?? "");

  const [tag, setTag] = useState<INTEREST | null>((me?.tags[0] as INTEREST) || null);

  useEffect(() => {
    if (me) {
      setTag((me?.tags[0] as INTEREST) || null);
    }
  }, [me]);

  const utils = api.useUtils();
  const { mutate, isLoading } = api.auth.user.update.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.auth.user.invalidate(), utils.auth.user.invalidate(), utils.auth.post.invalidate()]);
      createToast({
        type: "success",
        message: "Profile updated!",
      });
    },
    onError: (e) => {
      createToast({
        type: "error",
        message: e.message,
      });
    },
  });

  useEffect(() => {
    if (!me) return;

    if (me.username !== username) {
      setUsername(me.username);
    }

    if (me.bio !== bio) {
      setBio(me.bio ?? "");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  return (
    <MainLayout
      showBackButton
      contentType="scrollable"
      title="Edit profile"
      isLoading={!me}
      floatingButton={
        <Button
          variant="gradient"
          cls="w-full"
          isLoading={isLoading}
          onPress={() => {
            if (!/^[a-z0-9_-]+$/.test(username)) {
              createToast({
                type: "error",
                message: "Username can only contain lowercase (a-z) letters,underscores (_) and hyphens (-)",
              });
              return;
            }
            mutate({ bio, username, tags: tag ? [tag] : null });
          }}
        >
          Save
        </Button>
      }
    >
      <View className="h-2 md:h-3 lg:h-4" />

      <View className="max-w-2xl lg:max-w-3xl mx-auto w-full">
        <View className="flex items-center justify-center py-4 md:py-5 lg:py-6">
          <ChangeProfileImageButton />
        </View>

        <Input
          label="Username"
          autoCorrect={false}
          autoCapitalize="none"
          placeholder="Enter your name..."
          classes={{ root: "mb-4 md:mb-5 lg:mb-6" }}
          value={username}
          onChangeText={setUsername}
        />
        <Input
          label="Email address"
          value={user?.emailAddresses?.[0]?.emailAddress ?? ""}
          editable={false}
          classes={{ root: "opacity-50 mb-4 md:mb-5 lg:mb-6" }}
          onPressIn={() => {
            createToast({
              type: "error",
              message: "You cannot change your email address",
            });
          }}
        />
        <Input
          multiline
          label="Bio"
          placeholder="Enter your bio..."
          numberOfLines={6}
          value={bio}
          onChangeText={setBio}
          classes={{ inputWrapper: "h-32 md:h-40 lg:h-48 rounded-2xl", input: "px-4 md:px-5 lg:px-6 py-3 md:py-4 lg:py-5" }}
        />

        <TagsEditor tag={tag} onChange={setTag} />
      </View>
    </MainLayout>
  );
};

export default EditProfilePage;
