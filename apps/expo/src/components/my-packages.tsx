import { useMemo, useState } from "react";
import { Platform, View } from "react-native";

import type { RouterOutputs } from "@/utils/api";
import { api } from "@/utils/api";
import { cn } from "@/utils/cn";
import { constructMediaUrl } from "@/utils/imagekit";
import { Image } from "@/components/image";
import { Button } from "@/components/ui/button";
import Typography from "@/components/ui/typography";
import StartrackerIcon from "@/assets/startracker_icon.svg";
import LoadingPage from "./ui/loading-page";
import UnsubscribeBottomSheet from "./unsubscribe-bottom-sheet";

export function MyPackages() {
  const { data, isLoading } = api.auth.eventPackage.myPackages.useQuery();
  const eventPackages = useMemo(() => data || [], [data]);

  const [requestRemoveSubscription, setRequestRemoveSubscription] = useState<
    RouterOutputs["auth"]["user"]["mySubscriptions"][number] | null
  >(null);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <>
      {eventPackages.length === 0 && (
        <View className={cn("flex flex-col items-center justify-center p-6", Platform.OS === "android" && "py-0")}>
          <StartrackerIcon className="opacity-60" width={160} height={160} />
          <Typography variant="h2" fontWeight="bold" cls="text-center mt-6">
            No packages bought
          </Typography>
          <Typography variant="p" fontWeight="regular" cls="text-center text-lg leading-5 mt-2 mb-10">
            You have not bought to any packages yet.
          </Typography>
        </View>
      )}

      {eventPackages.map((eventPackage) => {
        const media = eventPackage.posts[0]?.media?.[0];

        return (
          <View className="mb-3 flex flex-row items-center py-1" key={eventPackage.id}>
            <View className="flex flex-1 flex-row items-center">
              <View className="relative mr-2 h-24 w-24 overflow-hidden rounded-xl border border-white bg-white">
                {media?.type === "IMAGE" && (
                  <Image source={constructMediaUrl(media)} contentFit="cover" className="absolute h-full w-full" />
                )}

                {media?.type === "VIDEO" && (
                  <Image
                    source={{ uri: media.thumbnail ? constructMediaUrl(media.thumbnail) : undefined }}
                    className="absolute h-full w-full"
                    contentFit="cover"
                  />
                )}
              </View>

              <View className="flex-1 px-3">
                <Typography fontWeight="bold" cls="text-lg" numberOfLines={1} variant="h3">
                  {eventPackage.name}
                </Typography>

                <Typography fontWeight="regular" cls="text-base" numberOfLines={1} variant="h3">
                  {eventPackage.createdBy.username}
                </Typography>

                <Typography fontWeight="regular" cls="text-base" numberOfLines={1} variant="h3">
                  {eventPackage._count.posts} posts
                </Typography>
              </View>
            </View>

            <Button href={`/event-package/${eventPackage.id}`} variant="outline" size="xs" cls="flex-none px-4 ml-2">
              View
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
