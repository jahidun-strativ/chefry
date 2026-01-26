/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FC } from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { QueryObserverResult } from "@tanstack/react-query";

import { api } from "@/utils/api";
import { cn } from "@/utils/cn";
import StartrackerIcon from "@/assets/startracker_icon.svg";
import ButtonBase from "./ui/button-base";

interface Props {
  username: string;
  paidUntil?: Date;
  followStatus?: "DEFAULT" | "STAR_TRACKER" | null;
  refetchFollowStatus: () => Promise<QueryObserverResult<any, any>>;
}

const StartrackerFollowUserButton: FC<Props> = ({ username, followStatus, refetchFollowStatus }) => {
  const utils = api.useContext();

  const { mutate: subscribeToUser, isLoading } = api.auth.stripe.startSubscription.useMutation({});

  // const { mutate } = api.auth.userFollow.toggleFollow.useMutation({
  //   onSuccess: () =>
  //     Promise.all([
  //       refetchFollowStatus(),
  //       utils.auth.user.metaInfo.refetch({ username }),
  //       utils.auth.user.myStarFollows.invalidate(),
  //       utils.auth.story.list.invalidate(),
  //     ]),
  //   onMutate: async () => {
  //     await utils.auth.post.postReactions.cancel();
  //     const prevFollowStatus = utils.auth.user.followStatus.getData({ username });
  //     if (prevFollowStatus === "STAR_TRACKER") {
  //       utils.auth.user.followStatus.setData({ username }, "DEFAULT");
  //     } else if (prevFollowStatus === "DEFAULT") {
  //       utils.auth.user.followStatus.setData({ username }, "STAR_TRACKER");
  //     } else {
  //       utils.auth.user.followStatus.setData({ username }, "STAR_TRACKER");
  //     }
  //   },
  //   onError: () => {
  //     createToast({
  //       type: "error",
  //       title: "Something went wrong.",
  //     });
  //   },
  // });

  const size = 70;

  return (
    <View className="relative z-0" style={{ width: size, height: size }}>
      <ButtonBase
        onPress={() => subscribeToUser({ username })}
        className="absolute right-0 rounded-full bg-white p-0.5"
        style={{ width: followStatus === "STAR_TRACKER" ? 150 : size, height: size }}
        disabled={isLoading}
      >
        <LinearGradient
          colors={["rgba(165, 110, 213, 1)", "#B457B8", "#C73993"]}
          start={[0.0, 0.5]}
          end={[1.0, 0.5]}
          className={cn("flex h-full w-full justify-center rounded-full", followStatus === "STAR_TRACKER" ? "items-end" : "items-center")}
        >
          <View className="flex items-center justify-center" style={{ width: size, height: size }}>
            <StartrackerIcon width={30} height={30} />
          </View>
        </LinearGradient>
      </ButtonBase>
    </View>
  );
};

export default StartrackerFollowUserButton;
