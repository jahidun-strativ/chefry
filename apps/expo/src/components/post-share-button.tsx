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
      className="absolute left-0 flex items-center justify-center rounded-full border-2 border-white bg-[#222222]"
      style={{
        bottom: isMobile ? -32 : isTablet ? -36 : -40,
        width: isMobile ? 64 : isTablet ? 72 : 80,
        height: isMobile ? 64 : isTablet ? 72 : 80,
      }}
    >
      <Icon name="share" size={isMobile ? 18 : isTablet ? 20 : 22} color="white" />
    </ButtonBase>
  );
};

export default PostShareButton;
