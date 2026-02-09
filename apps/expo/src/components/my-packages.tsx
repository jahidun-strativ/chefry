/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useMemo, useState } from "react";
import { Platform, View } from "react-native";

import type { RouterOutputs } from "@/utils/api";
import { api } from "@/utils/api";
import { cn } from "@/utils/cn";
import { useResponsive } from "@/hooks/useResponsive";
import { constructMediaUrl } from "@/utils/imagekit";
import { Image } from "@/components/image";
import { Button } from "@/components/ui/button";
import Typography from "@/components/ui/typography";
import toPurchaseIcon from "@/assets/to-purchase.png";
import LoadingPage from "./ui/loading-page";
import UnsubscribeBottomSheet from "./unsubscribe-bottom-sheet";

export function MyPackages() {
  const { data, isLoading } = api.auth.eventPackage.myPackages.useQuery();
  const eventPackages = useMemo(() => data || [], [data]);
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const [requestRemoveSubscription, setRequestRemoveSubscription] = useState<
    RouterOutputs["auth"]["user"]["mySubscriptions"][number] | null
  >(null);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <>
      {eventPackages.length === 0 && (
        <View className={cn("flex flex-col items-center justify-center p-6 md:p-8 lg:p-12", Platform.OS === "android" && "py-0")}>
          <Image source={toPurchaseIcon} style={{ width: isMobile ? 160 : isTablet ? 180 : 200, height: isMobile ? 160 : isTablet ? 180 : 200, opacity: 0.6 }} contentFit="contain" />
          <Typography variant="h2" fontWeight="bold" cls="text-center mt-6 md:mt-8 lg:mt-10">
            No packages bought
          </Typography>
          <Typography variant="p" fontWeight="regular" cls="text-center mt-2 md:mt-3 lg:mt-4 mb-10 md:mb-12 lg:mb-14">
            You have not bought to any packages yet.
          </Typography>
        </View>
      )}

      {eventPackages.map((eventPackage) => {
        const media = eventPackage.posts[0]?.media?.[0];

        return (
          <View className="mb-3 md:mb-4 lg:mb-5 flex flex-row items-center py-1 md:py-2 lg:py-3" key={eventPackage.id}>
            <View className="flex flex-1 flex-row items-center">
              <View className="relative mr-2 md:mr-3 lg:mr-4 h-24 w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 overflow-hidden rounded-xl border border-white bg-white">
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

              <View className="flex-1 px-3 md:px-4 lg:px-5">
                <Typography fontWeight="bold" cls="text-lg md:text-xl lg:text-2xl" numberOfLines={1} variant="h3">
                  {eventPackage.name}
                </Typography>

                <Typography fontWeight="regular" cls="text-base md:text-lg lg:text-xl" numberOfLines={1} variant="h3">
                  {eventPackage.createdBy.username}
                </Typography>

                <Typography fontWeight="regular" cls="text-base md:text-lg lg:text-xl" numberOfLines={1} variant="h3">
                  {eventPackage._count.posts} posts
                </Typography>
              </View>
            </View>

            <Button href={`/event-package/${eventPackage.id}`} variant="outline" size="xs" cls="flex-none px-4 md:px-5 lg:px-6 ml-2 md:ml-3 lg:ml-4">
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
