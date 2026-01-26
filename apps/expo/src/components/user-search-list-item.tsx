import type { FC } from "react";
import { useState } from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import Icon from "@expo/vector-icons/Feather";

import type { RouterOutputs } from "@startracker/api";

import { api } from "@/utils/api";
import createToast from "@/utils/createToast";
import { getImageUrl } from "@/utils/imagekit";
import { Image } from "@/components/image";
import ButtonBase from "./ui/button-base";
import IconButton from "./ui/icon-button";
import Skeleton from "./ui/skeleton";
import Spinner from "./ui/spinner";
import Typography from "./ui/typography";
import VerifiedTick from "./ui/verified-tick";

interface Props {
  user?: RouterOutputs["auth"]["user"]["search"][number];
  isRecentSearch?: boolean;
  onPressUser?: (username: string) => void;
  onDeleteSearch?: (username: string) => Promise<void>;
}

const UserSearchListItem: FC<Props> = ({ user, onPressUser, isRecentSearch, onDeleteSearch }) => {
  const utils = api.useContext();
  const { mutate, isLoading: isLoadingFollow } = api.auth.userFollow.toggleFollow.useMutation({
    onSuccess: async (_, { username }) => {
      await Promise.all([utils.auth.user.invalidate(), utils.auth.post.invalidate(), utils.auth.story.invalidate()]);
      createToast({
        type: "success",
        message: "Follow status of " + username + " updated!",
      });
    },
    onError: (e) => {
      createToast({
        type: "error",
        message: "Something went wrong.",
      });
    },
  });

  const [isDeletingSearch, setIsDeletingSearch] = useState(false);
  const handleDeleteSearch = async () => {
    if (!user || !onDeleteSearch) return;

    setIsDeletingSearch(true);
    try {
      await onDeleteSearch(user.username);
    } catch (e) {
      createToast({
        type: "error",
        message: "Something went wrong.",
      });
    }
  };

  return (
    <View className="flex flex-row items-center py-1.5">
      <Link asChild onPress={() => user && onPressUser?.(user.username)} disabled={!user} href={`/discover/view-profile/${user?.username}`}>
        <ButtonBase className="flex flex-1 flex-row items-center">
          <LinearGradient
            colors={["#938DFB", "#9589F6", "#9B7FEA", "#A56ED5", "#B457B8", "#C73993", "#DD1465", "#EB004C"]}
            start={[0.0, 0.5]}
            end={[1.0, 0.5]}
            className="mr-3 h-12 w-12 rounded-full p-[1px]"
          >
            {!user && <Skeleton cls="w-full h-full rounded-full overflow-hidden opacity-50" width={150} height={150} />}

            {!!user && user.image && (
              <Image
                source={{
                  uri: getImageUrl(user.image.url, [{ width: "64", height: "64" }]),
                  thumbhash: user.image.thumbhash ?? undefined,
                }}
                className="aspect-square w-full rounded-full bg-[#222222]"
                contentFit="fill"
              />
            )}
            {!!user && !user?.image && (
              <View className="flex aspect-square w-full items-center justify-center rounded-full bg-[#222222]">
                <Icon name="user" color="white" size={18} />
              </View>
            )}
          </LinearGradient>

          <Typography fontWeight="bold">{user ? user.username : <Skeleton width={100} height={16} />}</Typography>

          {user?.verified && <VerifiedTick cls="ml-2" />}
        </ButtonBase>
      </Link>
      {!isRecentSearch && (
        <View>
          {user && !isLoadingFollow && user.followers.length === 0 && (
            <IconButton onPress={() => mutate({ username: user.username })} iconName="user-plus" cls="w-[40px] h-[40px]" />
          )}
          {user && !isLoadingFollow && user.followers.length !== 0 && (
            <ButtonBase onPress={() => mutate({ username: user.username })}>
              <LinearGradient
                colors={["#938DFB", "#9589F6", "#9B7FEA", "#A56ED5", "#B457B8", "#C73993", "#DD1465", "#EB004C"]}
                start={[0.0, 0.0]}
                end={[1.0, 1.0]}
                className="flex h-[40px] w-[40px] items-center justify-center rounded-full"
              >
                <Icon name="check" color="white" size={20} />
              </LinearGradient>
            </ButtonBase>
          )}
          {isLoadingFollow && (
            <View className="flex h-[40px] w-[40px] items-center justify-center">
              <Spinner size={24} />
            </View>
          )}
          {!user && <Skeleton width={30} height={30} radius={15} />}
        </View>
      )}
      {isRecentSearch && (
        <>
          {isDeletingSearch && (
            <View className="flex h-[40px] w-[40px] items-center justify-center">
              <Spinner size={24} />
            </View>
          )}

          {!isDeletingSearch && <IconButton onPress={handleDeleteSearch} iconName="x" cls="w-[40px] h-[40px]" size="xs" />}
        </>
      )}
    </View>
  );
};

export default UserSearchListItem;
