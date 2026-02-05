import React, { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";

import { api } from "@/utils/api";
import { cn } from "@/utils/cn";
import { useResponsive } from "@/hooks/useResponsive";
import { constructMediaUrl } from "@/utils/imagekit";
import { Image } from "@/components/image";
import ButtonBase from "../ui/button-base";
import Typography from "../ui/typography";
import { BuyEventPackageBottomSheet } from "./buy-event-package-bottom-sheet";

interface Props {
  username: string;
  isMe?: boolean;
  meVerified?: boolean;
}

export function EventPackagesOverview({ username, isMe, meVerified }: Props) {
  const { data, isLoading } = api.auth.eventPackage.list.useQuery({ username });
  const { isMobile, isTablet } = useResponsive();

  const eventPackages = useMemo(() => data || [], [data]);
  const eventPackagesCount = eventPackages?.length ?? 0;

  const showScrollView = useMemo(() => {
    if (isMe && meVerified && eventPackagesCount > 0) return true;
    if (eventPackagesCount > 2) return true;
    return false;
  }, [isMe, meVerified, eventPackagesCount]);

  const [buyEventPackageId, setBuyEventPackageId] = useState<string | null>(null);

  const { push } = useRouter();

  const eventPackagesList = useMemo(
    () =>
      eventPackages?.map((eventPackage) => {
        const media = eventPackage.posts?.find((p) => p.media?.[0]?.type === "IMAGE")?.media?.[0] || eventPackage.posts[0]?.media?.[0];

        const button = (
          <ButtonBase
            key={eventPackage.id}
            onPress={() => {
              if (!isMe) {
                if (eventPackage.boughtBy.length === 0) {
                  setBuyEventPackageId(eventPackage.id);
                } else {
                  push(`/event-package/${eventPackage.id}`);
                }
              }
            }}
            className={cn(
              "flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-white",
              !showScrollView && "flex-1",
              showScrollView && (isMobile ? "w-28" : isTablet ? "w-32" : "w-36"),
            )}
            style={{
              height: isMobile ? 120 : isTablet ? 140 : 160,
            }}
          >
            {media?.type === "IMAGE" && <Image source={constructMediaUrl(media)} contentFit="cover" className="absolute h-full w-full" />}

            {media?.type === "VIDEO" && (
              <Image
                source={{ uri: media.thumbnail ? constructMediaUrl(media.thumbnail) : undefined }}
                className="absolute h-full w-full"
                contentFit="cover"
              />
            )}

            <LinearGradient
              className="absolute z-20 flex h-full w-full flex-col items-center justify-end"
              style={{ padding: isMobile ? 12 : isTablet ? 14 : 16 }}
              colors={["rgba(0,0,0,0.4)", "rgba(0,0,0,1)"]}
            >
              <Typography variant="h3" numberOfLines={2} className="text-center leading-5 md:leading-6" style={{ fontSize: isMobile ? 13 : isTablet ? 14 : 16 }}>
                {eventPackage.name}
              </Typography>

              <Typography variant="p" className="text-center" style={{ fontSize: isMobile ? 11 : isTablet ? 12 : 14 }}>
                {eventPackage._count.posts} posts
              </Typography>

              {(eventPackage.boughtBy.length === 0 || isMe) && (
                <Typography variant="p" fontWeight="bold" style={{ fontSize: isMobile ? 14 : isTablet ? 16 : 18 }}>
                  {eventPackage.price / 100} €
                </Typography>
              )}

              {eventPackage.boughtBy.length > 0 && !isMe && (
                <View className="mt-1 rounded-full bg-white" style={{ paddingHorizontal: isMobile ? 10 : isTablet ? 12 : 14, paddingVertical: isMobile ? 4 : isTablet ? 5 : 6 }}>
                  <Typography variant="p" className="text-black" fontWeight="bold" style={{ fontSize: isMobile ? 11 : isTablet ? 12 : 14 }}>
                    View
                  </Typography>
                </View>
              )}
            </LinearGradient>
          </ButtonBase>
        );

        if (isMe) {
          return (
            <Link key={eventPackage.id} asChild href={`/edit-event-package/${eventPackage.id}`}>
              {button}
            </Link>
          );
        } else {
          return button;
        }
      }),
    [eventPackages, showScrollView, push, isMe],
  );

  // const createButton = useMemo(() => {
  //   if (!isMe || !meVerified) {
  //     return null;
  //   }

  //   if (eventPackagesCount !== 0) {
  //     return (
  //       <Link href="/profile/create-event-package">
  //         <View
  //           className={cn(
  //             "flex h-32 w-32 flex-col items-center justify-center overflow-hidden rounded-3xl border border-white bg-black/50",
  //           )}
  //         >
  //           <Icon name="plus" size={32} color="white" />
  //         </View>
  //       </Link>
  //     );
  //   }
  // }, [meVerified, isMe, eventPackagesCount]);

  if (isLoading) {
    return null;
  }

  return (
    <>
      <View className="max-w-2xl lg:max-w-3xl mx-auto w-full">
        {!showScrollView && <View className="flex flex-row gap-2 md:gap-3 lg:gap-4 pt-4 md:pt-5 lg:pt-6">{eventPackagesList}</View>}

        {showScrollView && (
          <ScrollView horizontal className="flex flex-row gap-2 md:gap-3 lg:gap-4 pb-2 md:pb-3 lg:pb-4 pt-4 md:pt-5 lg:pt-6">
            {/* {createButton} */}
            {eventPackagesList}
          </ScrollView>
        )}

        {/* {isMe && meVerified && eventPackagesCount === 0 && (
          <View className="mt-4 flex items-center justify-center pt-6">{createButton}</View>
        )} */}
      </View>
      <BuyEventPackageBottomSheet
        open={!!buyEventPackageId}
        eventPackageId={buyEventPackageId}
        onClose={() => setBuyEventPackageId(null)}
      />
    </>
  );
}
