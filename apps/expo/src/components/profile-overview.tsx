import type { FC } from "react";
import { memo, useMemo } from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import Icon from "@expo/vector-icons/Feather";
import { linkIt } from "react-linkify-it";

import { api } from "@/utils/api";
import { cn } from "@/utils/cn";
import { getImageUrl } from "@/utils/imagekit";
import { Image } from "@/components/image";
import ListTypePicker from "@/components/list-type-picker";
import Typography from "@/components/ui/typography";
import useOpenState from "@/hooks/useOpenState";
import { EventPackagesOverview } from "./event-package/event-packages-overview";
import { ProfileBioText } from "./profile-bio-text";
import { ProfileMetadata } from "./profile-metadata";
import ProfileShareButton from "./profile-share-button";
import StoriesPlayer from "./stories-player";
import { SubscriptionInformation } from "./subscription-information";
import ButtonBase from "./ui/button-base";
import Skeleton from "./ui/skeleton";
import VerifiedTick from "./ui/verified-tick";
import UserFollowButtons from "./user-follow-buttons";

interface Props {
  listType: "grid" | "list";
  username: string;
  onMeasured?: (height: number) => void;
  onChangeListType: (value: "grid" | "list") => void;
}

const ProfileOverview: FC<Props> = ({ username, onChangeListType, listType, onMeasured }) => {
  const { data: me } = api.auth.user.me.useQuery();
  const { data: canSubscribe } = api.auth.stripe.canSubscribe.useQuery({ username });
  const { data: subscriptionPrice } = api.auth.stripe.subscriptionPrice.useQuery({ username });
  const { data: user } = api.auth.user.byUsername.useQuery({ username });
  const { data: metaInfo } = api.auth.user.metaInfo.useQuery({ username });

  const { data: postCount } = api.auth.post.count.useQuery({ username });

  const { data: stories_ } = api.auth.story.list.useQuery({ username });

  const stories = useMemo(() => stories_ || [], [stories_]);
  const storiesCount = stories?.length ?? 0;
  const storiesAreViewed = useMemo(() => stories?.every((story) => story?.isViewed), [stories]);

  const [storiesPlayerOpen, openStoriesPlayer, closeStoriesPlayer] = useOpenState();

  const isMe = me?.username === username;

  // prettier-ignore
  // eslint-disable-next-line
  const urlRegex = /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/igm
  const bioWithLinks = linkIt(
    user?.bio || "",
    (match, key) => {
      return (
        <Typography
          key={key}
          cls="text-white text-sm text-blue-500"
          fontWeight="bold"
          variant="p"
          onPress={() => WebBrowser.openBrowserAsync(match)}
        >
          {match}
        </Typography>
      );
    },
    urlRegex,
  );

  return (
    <>
      <View className="w-full px-2 pt-12" onLayout={(e) => onMeasured?.(e.nativeEvent.layout.height)}>
        <View className="flex w-full flex-row items-center justify-center">
          <ButtonBase cls="z-20" disabled={storiesCount === 0} onPress={openStoriesPlayer}>
            <LinearGradient
              colors={
                storiesCount === 0
                  ? ["rgba(100, 100, 100, 0.5)", "rgba(100, 100, 100, 0.9)"]
                  : storiesAreViewed
                    ? ["#666666", "#999999"]
                    : ["#938DFB", "#9589F6", "#9B7FEA", "#A56ED5", "#B457B8", "#C73993", "#DD1465", "#EB004C"]
              }
              start={[0.0, 0.5]}
              end={[1.0, 0.5]}
              className={cn("z-10 aspect-square w-24 rounded-full", storiesCount == 0 ? "p-0.5" : "p-[3px]")}
            >
              {!user && <Skeleton cls="w-full h-full rounded-full overflow-hidden opacity-50" width={150} height={150} />}

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
          </ButtonBase>

          <View className="mx-4 flex flex-1 flex-col">
            <View className="flex flex-row items-center">
              <Typography fontWeight="bold" cls="text-xl text-center" allowFontScaling={false}>
                {user ? user.username : <Skeleton height={20} width={60} />}
              </Typography>
              {user?.verified && <VerifiedTick cls="ml-2" />}
            </View>

            {user?.bio && <ProfileBioText bio={user.bio} />}
          </View>

          <ProfileShareButton username={user?.username || ""} />
        </View>

        <ProfileMetadata metaInfo={metaInfo} />

        <UserFollowButtons
          user={user}
          isMe={isMe}
          username={username}
          canSubscribe={canSubscribe}
          subscriptionPrice={subscriptionPrice || undefined}
        />

        <EventPackagesOverview username={username} isMe={isMe} meVerified={!!(me?.verified && me?.stripeConnectedAccountId)} />

        <View className="mt-6 flex flex-col">
          <SubscriptionInformation canSubscribe={Boolean(canSubscribe)} username={username} />

          {postCount != null && postCount !== 0 ? (
            <View className="mb-3 mt-6 flex items-center justify-center">
              <ListTypePicker value={listType} onChange={onChangeListType} />
            </View>
          ) : (
            <View className="h-4" />
          )}
        </View>
      </View>
      <StoriesPlayer open={storiesPlayerOpen} stories={stories} onClose={closeStoriesPlayer} />
    </>
  );
};

export default memo(ProfileOverview);
