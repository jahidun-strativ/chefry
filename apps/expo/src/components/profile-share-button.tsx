import type { FC } from "react";
import { Share } from "react-native";
import Icon from "@expo/vector-icons/FontAwesome";

import createToast from "@/utils/createToast";
import IconButton from "./ui/icon-button";

interface Props {
  username: string;
}

const ProfileShareButton: FC<Props> = ({ username }) => {
  return (
    <IconButton
      onPress={async () => {
        try {
          await Share.share({
            message: `Star Tracker ${username} profile: ${"https://app.startracker.one/profile/" + username}`,
            url: "https://app.startracker.one/profile/" + username,
          });
        } catch (e) {
          createToast({
            type: "error",
            message: "Something went wrong, could not share post",
          });
        }
      }}
      icon={<Icon name="share" size={24} color="white" />}
      cls="border-2 bg-black/10 border-white w-14 h-14"
      size="lg"
    />
  );
};

export default ProfileShareButton;
