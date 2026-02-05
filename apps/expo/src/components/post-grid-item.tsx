import type { FC } from "react";
import { Platform, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";

import type { RouterOutputs } from "@startracker/api";

import { cn } from "@/utils/cn";
import { useResponsive } from "@/hooks/useResponsive";
import { getImageUrl } from "@/utils/imagekit";
import { Image } from "@/components/image";
import toPurchaseIcon from "@/assets/to-purchase.png";
import BlurView from "./ui/blur-view";
import ButtonBase from "./ui/button-base";
import Typography from "./ui/typography";

interface Props {
  post: RouterOutputs["auth"]["post"]["list"]["items"][number];
  linkPrefix?: string;
  isStartracker: boolean;
  index: number;
}

const PostGridItem: FC<Props> = ({ post, index: _index, isStartracker, linkPrefix }) => {
  const media = post.media[0];
  const { isMobile, isTablet, isDesktop } = useResponsive();

  return (
    <Link asChild href={`${linkPrefix || ""}/post/${post.id}`}>
      <ButtonBase className={cn("flex w-full flex-col px-1 md:px-1.5 lg:px-2 py-1 md:py-1.5 lg:py-2", "h-[130px] md:h-[140px] lg:h-[150px]")}>
        <LinearGradient
          colors={
            post.starPost
              ? ["#938DFB", "#9589F6", "#9B7FEA", "#A56ED5", "#B457B8", "#C73993", "#DD1465", "#EB004C"]
              : ["#FFFFFF", "#FFFFFF"]
          }
          start={[0.0, 0.5]}
          end={[1.0, 0.5]}
          className="relative flex-1 rounded-lg p-[1px]"
        >
          <View className="h-full w-full rounded-lg">
            {media && media.type === "IMAGE" && (
              <Image
                source={{
                  uri: getImageUrl(media.url, [{ width: "300" }]),
                  thumbhash: media.thumbhash ?? undefined,
                }}
                className="h-full w-full rounded-lg"
                contentFit="cover"
              />
            )}

            {media && media.type === "VIDEO" && (
              <Image
                source={{
                  uri: media.thumbnail
                    ? getImageUrl(media.thumbnail.url, [{ width: "300" }])
                    : getImageUrl(media.url + "/ik-thumbnail.jpg", [{ width: "300" }]),
                  thumbhash: media.thumbhash ?? undefined,
                }}
                className="h-full w-full rounded-lg"
                contentFit="cover"
              />
            )}

            {post.starPost && !isStartracker && (
              <View className="absolute flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-[#9A82EE]/40">
                <BlurView cls={cn("absolute h-full w-full", Platform.OS === "android" ? "bg-black" : "bg-black/80")} />
                {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */}
                <Image source={toPurchaseIcon as any} style={{ width: isMobile ? 60 : isTablet ? 64 : 80, height: isMobile ? 60 : isTablet ? 64 : 80 }} contentFit="contain" />
                <Typography cls="mt-4 md:mt-5 lg:mt-6" variant="h2">
                  Star content
                </Typography>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* <View className="h-14">
          <Typography numberOfLines={2} cls="text-sm mt-1 leading-5" className="leading-5">
            <Typography cls="text-sm leading-5" fontWeight="bold">
              {post.createdBy.username}{" "}
            </Typography>
            {post.starPost && !isStartracker && post.caption
              ? post.caption.length > 25
                ? `${post.caption.substring(0, 25)}...`
                : post.caption
              : post.caption}
          </Typography>
        </View> */}
      </ButtonBase>
    </Link>
  );
};

export default PostGridItem;
