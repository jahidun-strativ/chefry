import type { FC } from "react";
import { View } from "react-native";

import Skeleton from "./ui/skeleton";
import Typography from "./ui/typography";

interface Props {
  metaInfo:
    | {
        followerCount: number;
        startrackerCount: number;
        postsCount: number;
        starPostsCount: number;
      }
    | undefined;
}

export const ProfileMetadata: FC<Props> = ({ metaInfo }) => {
  const metaInfoArray = [
    // { label: "Followers", value: metaInfo?.followerCount },
    { label: "Starposts", value: metaInfo?.starPostsCount },
    { label: "Posts", value: metaInfo?.postsCount },
    // { label: "Subscribers", value: metaInfo?.startrackerCount },
  ];

  return (
    <View className="mx-auto mt-3 md:mt-4 lg:mt-5 flex max-w-[240px] md:max-w-[280px] lg:max-w-[320px] flex-row justify-center space-x-2 md:space-x-3 lg:space-x-4 px-2">
      {metaInfoArray.map((item, index) => (
        <View key={index} className="flex flex-1 flex-col items-center justify-center">
          {item.value == null ? (
            <Skeleton height={20} width={20} cls="opacity-30" />
          ) : (
            <Typography fontWeight="bold" cls="text-base md:text-lg lg:text-xl text-center" allowFontScaling={false}>
              {item?.value || 0}
            </Typography>
          )}
          <Typography variant="p" cls="text-xs md:text-sm lg:text-base" allowFontScaling={false}>
            {item.label}
          </Typography>
        </View>
      ))}
    </View>
  );
};
