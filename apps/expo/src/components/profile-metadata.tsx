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
    <View className="mx-auto mt-3 flex max-w-[240px] flex-row justify-center space-x-2 px-2">
      {metaInfoArray.map((item, index) => (
        <View key={index} className="flex flex-1 flex-col items-center justify-center">
          {item.value == null ? (
            <Skeleton height={20} width={20} cls="opacity-30" />
          ) : (
            <Typography fontWeight="bold" cls="text-lg text-center" allowFontScaling={false}>
              {item?.value || 0}
            </Typography>
          )}
          <Typography variant="p" cls="text-xs" allowFontScaling={false}>
            {item.label}
          </Typography>
        </View>
      ))}
    </View>
  );
};
