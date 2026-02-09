import type { FC } from "react";
import { Share } from "react-native";
import Icon from "@expo/vector-icons/FontAwesome";

import { useResponsive } from "@/hooks/useResponsive";
import createToast from "@/utils/createToast";
import IconButton from "./ui/icon-button";

interface Props {
  username: string;
}

const ProfileShareButton: FC<Props> = ({ username }) => {
  const { isMobile, isTablet } = useResponsive();
  const iconSize = isMobile ? 14 : isTablet ? 18 : 20;
  const buttonSize = isMobile ? 44 : isTablet ? 50 : 54;
  
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
      icon={<Icon name="share" size={iconSize} color="white" />}
      cls="border-2 bg-black/10 border-white"
      style={{ width: buttonSize, height: buttonSize }}
      size="base"
    />
  );
};

export default ProfileShareButton;
