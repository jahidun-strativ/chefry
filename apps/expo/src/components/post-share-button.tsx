import type { FC } from "react";
import { Share } from "react-native";
import Icon from "@expo/vector-icons/FontAwesome";

import createToast from "@/utils/createToast";
import ButtonBase from "./ui/button-base";

interface Props {
  postId: string;
}

const PostShareButton: FC<Props> = ({ postId }) => {
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
      className="absolute -bottom-8 left-0 flex h-20 w-20 items-center justify-center rounded-full border-2 border-white bg-[#222222]"
    >
      <Icon name="share" size={24} color="white" />
    </ButtonBase>
  );
};

export default PostShareButton;
