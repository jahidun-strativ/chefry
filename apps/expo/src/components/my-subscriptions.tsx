import { useMemo, useState } from "react";
import { Platform, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import Icon from "@expo/vector-icons/Feather";

import type { RouterOutputs } from "@/utils/api";
import { api } from "@/utils/api";
import { cn } from "@/utils/cn";
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

  const [requestRemoveSubscription, setRequestRemoveSubscription] = useState<
    RouterOutputs["auth"]["user"]["mySubscriptions"][number] | null
  >(null);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <>
      {subscriptions.length === 0 && (
        <View className={cn("flex flex-col items-center justify-center p-6", Platform.OS === "android" && "py-0")}>
          <StartrackerIcon className="opacity-60" width={160} height={160} />
          <Typography variant="h2" fontWeight="bold" cls="text-center mt-6">
            No active subscriptions
          </Typography>
          <Typography variant="p" fontWeight="regular" cls="text-center text-lg leading-5 mt-2 mb-10">
            You have not subscribed to any users yet.
          </Typography>
        </View>
      )}

      {subscriptions.map((subscription) => {
        const user = subscription.userFollow.followedUser;
        const subscriptionIsCancelled = Boolean(subscription?.cancel_at_period_end);

        return (
          <View className="mb-3 flex flex-row items-center py-1" key={subscription.id}>
            <View className="flex flex-1 flex-row items-center">
              <LinearGradient
                colors={["#938DFB", "#9589F6", "#9B7FEA", "#A56ED5", "#B457B8", "#C73993", "#DD1465", "#EB004C"]}
                start={[0.0, 0.5]}
                end={[1.0, 0.5]}
                className={cn("z-10 mr-4 aspect-square w-14 rounded-full p-[1px]")}
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
              <View className="flex-1">
                <Link href={`/view-profile/${user.username}`}>
                  <Typography fontWeight="bold" cls="text-lg" numberOfLines={1} variant="h3">
                    {user.username}
                  </Typography>
                </Link>
                <Typography cls="text-sm" variant="p">
                  {subscriptionIsCancelled ? (
                    <>Cancelled but you have access until {new Date(subscription.current_period_end * 1000).toLocaleDateString()}</>
                  ) : (
                    <>Next payment is due on {new Date(subscription.current_period_end * 1000).toLocaleDateString()}</>
                  )}
                </Typography>
              </View>
            </View>
            <Button onPress={() => setRequestRemoveSubscription(subscription)} variant="outline" size="xs" cls="flex-none px-2 ml-2">
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
