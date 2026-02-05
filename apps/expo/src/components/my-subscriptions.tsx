import { useMemo, useState } from "react";
import { Platform, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import Icon from "@expo/vector-icons/Feather";

import type { RouterOutputs } from "@/utils/api";
import { api } from "@/utils/api";
import { cn } from "@/utils/cn";
import { useResponsive } from "@/hooks/useResponsive";
import { getImageUrl } from "@/utils/imagekit";
import { Image } from "@/components/image";
import { Button } from "@/components/ui/button";
import Typography from "@/components/ui/typography";
import StartrackerIcon from "@/assets/startracker_icon.svg";
import LoadingPage from "./ui/loading-page";
import UnsubscribeBottomSheet from "./unsubscribe-bottom-sheet";

export function MySubscriptions() {
  const { data, isLoading } = api.auth.user.mySubscriptions.useQuery();
  const subscriptions = useMemo(() => data || [], [data]);
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const [requestRemoveSubscription, setRequestRemoveSubscription] = useState<
    RouterOutputs["auth"]["user"]["mySubscriptions"][number] | null
  >(null);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <>
      {subscriptions.length === 0 && (
        <View className={cn("flex flex-col items-center justify-center p-6 md:p-8 lg:p-12", Platform.OS === "android" && "py-0")}>
          <StartrackerIcon className="opacity-60" width={isMobile ? 160 : isTablet ? 180 : 200} height={isMobile ? 160 : isTablet ? 180 : 200} />
          <Typography variant="h2" fontWeight="bold" cls="text-center mt-6 md:mt-8 lg:mt-10">
            No active subscriptions
          </Typography>
          <Typography variant="p" fontWeight="regular" cls="text-center mt-2 md:mt-3 lg:mt-4 mb-10 md:mb-12 lg:mb-14">
            You have not subscribed to any users yet.
          </Typography>
        </View>
      )}

      {subscriptions.map((subscription) => {
        const user = subscription.userFollow.followedUser;
        const subscriptionIsCancelled = Boolean(subscription?.cancel_at_period_end);

        return (
          <View className="mb-3 md:mb-4 lg:mb-5 flex flex-row items-center py-1 md:py-2 lg:py-3" key={subscription.id}>
            <View className="flex flex-1 flex-row items-center">
              <LinearGradient
                colors={["#938DFB", "#9589F6", "#9B7FEA", "#A56ED5", "#B457B8", "#C73993", "#DD1465", "#EB004C"]}
                start={[0.0, 0.5]}
                end={[1.0, 0.5]}
                className={cn("z-10 mr-4 md:mr-5 lg:mr-6 aspect-square w-14 md:w-16 lg:w-18 rounded-full p-[1px]")}
              >
                {user && user?.image && (
                  <Image
                    source={{
                      uri: getImageUrl(user.image.url, [{ width: "200", height: "200" }]),
                      thumbhash: user.image.thumbhash ?? undefined,
                    }}
                    className="aspect-square w-full rounded-full bg-[#222222]"
                    contentFit="fill"
                  />
                )}
                {user && !user?.image && (
                  <View className="flex aspect-square w-full items-center justify-center rounded-full bg-[#222222]">
                    <Icon name="user" color="white" size={32} />
                  </View>
                )}
              </LinearGradient>
              <View className="flex-1 px-2 md:px-3 lg:px-4">
                <Link href={`/view-profile/${user.username}`}>
                  <Typography fontWeight="bold" cls="text-lg md:text-xl lg:text-2xl" numberOfLines={1} variant="h3">
                    {user.username}
                  </Typography>
                </Link>
                <Typography cls="text-sm md:text-base lg:text-lg" variant="p">
                  {subscriptionIsCancelled ? (
                    <>Cancelled but you have access until {new Date(subscription.current_period_end * 1000).toLocaleDateString()}</>
                  ) : (
                    <>Next payment is due on {new Date(subscription.current_period_end * 1000).toLocaleDateString()}</>
                  )}
                </Typography>
              </View>
            </View>
            <Button onPress={() => setRequestRemoveSubscription(subscription)} variant="outline" size="xs" cls="flex-none px-2 md:px-3 lg:px-4 ml-2 md:ml-3 lg:ml-4">
              Unsubscribe
            </Button>
          </View>
        );
      })}
      <UnsubscribeBottomSheet
        isOpen={!!requestRemoveSubscription}
        subscription={requestRemoveSubscription}
        onClose={() => setRequestRemoveSubscription(null)}
      />
    </>
  );
}
