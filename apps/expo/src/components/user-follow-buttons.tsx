import type { FC } from "react";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { usePrevious } from "@uidotdev/usehooks";

import type { RouterOutputs } from "@/utils/api";
import { api } from "@/utils/api";
import { cn } from "@/utils/cn";
import { useResponsive } from "@/hooks/useResponsive";
import createToast from "@/utils/createToast";
import useOpenState from "@/hooks/useOpenState";
import DeleteSubscriptionBottomSheet from "./delete-subscription-bottom-sheet";
import SubscibeToUserBottomSheet from "./subscribe-to-user-bottom-sheet";
import { Button } from "./ui/button";
import Typography from "./ui/typography";

interface Props {
  username: string;
  isMe: boolean;
  user?: RouterOutputs["auth"]["user"]["byUsername"] | null;
  canSubscribe?: boolean;
  subscriptionPrice?: number;
}

const UserFollowButtons: FC<Props> = ({ username, user, canSubscribe, subscriptionPrice, isMe }) => {
  const { data: userFollow, refetch: refetchFollowStatus } = api.auth.userFollow.get.useQuery({ username });
  const { isMobile, isTablet } = useResponsive();

  const utils = api.useContext();
  const { mutate: toggleFollow, isLoading: isChangingFollowStatus } = api.auth.userFollow.toggleFollow.useMutation({
    onSuccess: async () => {
      await Promise.all([refetchFollowStatus(), utils.auth.user.invalidate(), utils.auth.post.invalidate(), utils.auth.story.invalidate()]),
        createToast({
          type: "success",
          message: "Follow status updated!",
        });
    },
    onError: (e) => {
      createToast({
        type: "error",
        message: "Something went wrong.",
      });
    },
  });

  const previousFollowType = usePrevious(userFollow?.type);
  useEffect(() => {
    if (!!previousFollowType && userFollow?.type === "STAR_TRACKER") {
      createToast({
        type: "success",
        message: "You are now a subscriber!",
      });
    }
    // eslint-disable-next-line
  }, [userFollow?.type]);

  const [unfollowType, setUnfollowType] = useState<"UNFOLLOW" | "CANCEL_SUBSCRIPTION" | null>(null);
  const [deleteSubscriptionBottomSheetOpen, setDeleteSubscriptionBottomSheetOpen] = useState(false);
  const handleCloseDeleteSubscriptionBottomSheet = useCallback(() => {
    setDeleteSubscriptionBottomSheetOpen(false);
    setUnfollowType(null);
  }, []);

  const [subscribeBottomSheetOpen, openSubscribeBottomSheet, closeSubscribeBottomSheet] = useOpenState();
  const handleToggleFollow = (type: "DEFAULT" | "STAR_TRACKER") => () => {
    if (!userFollow) {
      if (type === "DEFAULT") {
        toggleFollow({ username });
      } else {
        openSubscribeBottomSheet();
      }
    } else {
      if (userFollow.type === "STAR_TRACKER") {
        setUnfollowType(type === "DEFAULT" ? "UNFOLLOW" : "CANCEL_SUBSCRIPTION");
        setDeleteSubscriptionBottomSheetOpen(true);
      } else {
        if (type === "DEFAULT") {
          toggleFollow({ username });
        } else {
          openSubscribeBottomSheet();
        }
      }
    }
  };

  return (
    <>
      <View className={cn("flex w-full flex-row max-w-md lg:max-w-lg mx-auto", !isMe && user && "mt-4 md:mt-5 lg:mt-6", !canSubscribe && "items-center justify-center")}>
        {!isMe && user && (
          <>
            <Button
              variant={!userFollow ? "gradient-border" : "gradient"}
              gradient={["#938DFB", "#9589F6", "#9B7FEA", "#A56ED5"]}
              // cls="w-auto p-[1px] bg-[#3c203f]"
              clsForce={cn("w-auto p-[1px]", !userFollow && "bg-[#3c203f]")}
              disabled={isChangingFollowStatus}
              onPress={handleToggleFollow("DEFAULT")}
            >
              <View className={cn("flex flex-col items-center justify-center", !canSubscribe ? "w-32 md:w-36 lg:w-40 h-14 md:h-16 lg:h-18" : "w-24 md:w-28 lg:w-32 h-14 md:h-16 lg:h-18")}>
                {!userFollow && (
                  <>
                    <Typography allowFontScaling={false} cls="text-xs md:text-sm lg:text-base" fontWeight="bold">
                      Follow
                    </Typography>
                    <Typography allowFontScaling={false} cls="text-xs md:text-sm lg:text-base" fontWeight="medium">
                      Free
                    </Typography>
                  </>
                )}

                {userFollow && (
                  <>
                    <Typography allowFontScaling={false} cls="text-xs md:text-sm lg:text-base" fontWeight="bold">
                      Following
                    </Typography>
                  </>
                )}
              </View>
            </Button>

            {canSubscribe && (
              <>
                <View className="w-2 md:w-3 lg:w-4" />
                <Button
                  disabled={isChangingFollowStatus}
                  variant={userFollow?.type === "STAR_TRACKER" ? "gradient" : "gradient-border"}
                  clsForce={cn("w-auto flex-1 p-[1px]", userFollow?.type !== "STAR_TRACKER" && "bg-[#3c203f]")}
                  onPress={handleToggleFollow("STAR_TRACKER")}
                >
                  <View className="flex h-14 md:h-16 lg:h-18 flex-col items-center justify-center">
                    {userFollow?.type !== "STAR_TRACKER" && (
                      <>
                        <Typography allowFontScaling={false} cls="text-xs md:text-sm lg:text-base" fontWeight="bold">
                          Subscribe
                        </Typography>
                        <Typography allowFontScaling={false} cls="text-xs md:text-sm lg:text-base" fontWeight="bold">
                          ${subscriptionPrice}/month
                        </Typography>
                      </>
                    )}

                    {userFollow?.type === "STAR_TRACKER" && (
                      <>
                        <Typography allowFontScaling={false} cls="text-xs md:text-sm lg:text-base" fontWeight="bold">
                          Subscribed
                        </Typography>
                      </>
                    )}
                  </View>
                </Button>
              </>
            )}
          </>
        )}

        {/* {!isMe && user && (
          <>
            <View className="relative z-10" style={{ width: size, height: size }}>
              <ButtonBase
                onPress={handleToggleFollow("DEFAULT")}
                disabled={isChangingFollowStatus}
                className="absolute right-0 rounded-full bg-white p-0.5"
                style={{ width: userFollow ? 150 : size, height: size }}
              >
                <LinearGradient
                  colors={["#938DFB", "#9589F6", "#9B7FEA", "#A56ED5"]}
                  className={cn("flex h-full w-full justify-center rounded-full", userFollow ? "items-end" : "items-center")}
                >
                  <View className="flex items-center justify-center" style={{ width: size, height: size }}>
                    {!isChangingFollowStatus && <Icon name="user-plus" size={26} color="white" />}
                    {isChangingFollowStatus && <Spinner size={26} />}
                  </View>
                </LinearGradient>
              </ButtonBase>
            </View>
          </>
        )}

        {!isMe && user && canSubscribe && (
          <>
            <View className="relative z-0" style={{ width: size, height: size }}>
              <ButtonBase
                onPress={handleToggleFollow("STAR_TRACKER")}
                // onPress={() => subscribeToUser({ username })}
                className="absolute right-0 rounded-full bg-white p-0.5"
                style={{ width: userFollow?.type === "STAR_TRACKER" ? 150 : size, height: size }}
                disabled={isChangingFollowStatus}
              >
                <LinearGradient
                  colors={["rgba(165, 110, 213, 1)", "#B457B8", "#C73993"]}
                  start={[0.0, 0.5]}
                  end={[1.0, 0.5]}
                  className={cn(
                    "flex h-full w-full justify-center rounded-full",
                    userFollow?.type === "STAR_TRACKER" ? "items-end" : "items-center",
                  )}
                >
                  <View className="flex items-center justify-center" style={{ width: size, height: size }}>
                    <StartrackerIcon width={26} height={26} />
                  </View>
                </LinearGradient>
              </ButtonBase>
            </View>
          </>
        )} */}
      </View>

      <DeleteSubscriptionBottomSheet
        isOpen={Boolean(unfollowType) && deleteSubscriptionBottomSheetOpen}
        unfollowType={unfollowType}
        username={username}
        onClose={handleCloseDeleteSubscriptionBottomSheet}
      />

      <SubscibeToUserBottomSheet onClose={closeSubscribeBottomSheet} username={username} isOpen={subscribeBottomSheetOpen} />
    </>
  );
};

export default UserFollowButtons;
