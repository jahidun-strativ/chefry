import React, { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";

import { api } from "@/utils/api";
import { cn } from "@/utils/cn";
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
              "flex h-32 flex-col items-center justify-center overflow-hidden rounded-3xl border border-white",
              !showScrollView && "flex-1",
              showScrollView && "w-32",
            )}
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
              className="absolute z-20 flex h-full w-full flex-col items-center justify-end p-3"
              colors={["rgba(0,0,0,0.4)", "rgba(0,0,0,1)"]}
            >
              <Typography variant="h3" numberOfLines={2} className="text-center text-base leading-6">
                {eventPackage.name}
              </Typography>

              <Typography variant="p" className="text-center text-sm">
                {eventPackage._count.posts} posts
              </Typography>

              {(eventPackage.boughtBy.length === 0 || isMe) && (
                <Typography variant="p" className="text-lg" fontWeight="bold">
                  {eventPackage.price / 100} €
                </Typography>
              )}

              {eventPackage.boughtBy.length > 0 && !isMe && (
                <View className="mt-1 rounded-full bg-white px-3 py-0">
                  <Typography variant="p" className="text-black" fontWeight="bold">
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
      <View>
        {!showScrollView && <View className="flex flex-row gap-3 pt-6">{eventPackagesList}</View>}

        {showScrollView && (
          <ScrollView horizontal className="flex flex-row gap-3 pb-2 pt-6">
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
