import type { FC } from "react";
import { Share } from "react-native";
import Icon from "@expo/vector-icons/FontAwesome";

import { useResponsive } from "@/hooks/useResponsive";
import createToast from "@/utils/createToast";
import ButtonBase from "./ui/button-base";

interface Props {
  postId: string;
}

const PostShareButton: FC<Props> = ({ postId }) => {
  const { isMobile, isTablet } = useResponsive();
  const buttonSize = isMobile ? 64 : isTablet ? 72 : 80;
  const iconSize = isMobile ? 18 : isTablet ? 20 : 22;
  
  return (
    <ButtonBase
      onPress={async () => {
        try {
          await Share.share({
            message: `Startracker post: ${"https://app.startracker.one/post/" + postId}`,
            url: process.env.NEXT_PUBLIC_WEB_URL + "/post/" + postId,
          });
        } catch (e) {
          createToast({
            type: "error",
            message: "Something went wrong",
          });
        }
      }}
      className="absolute flex items-center justify-center rounded-full border-2 border-white bg-[#222222]"
      style={{
        bottom: 10,
        left: 10,
        width: buttonSize,
        height: buttonSize,
      }}
    >
      <Icon name="share" size={iconSize} color="white" />
    </ButtonBase>
  );
};

export default PostShareButton;
