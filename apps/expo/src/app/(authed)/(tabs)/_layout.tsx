import type { FC } from "react";
import { useCallback } from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Tabs, usePathname } from "expo-router";
import Icon from "@expo/vector-icons/Feather";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { MotiView } from "moti";

import { api } from "@/utils/api";
import { cn } from "@/utils/cn";
import CreatePostButton from "@/components/create-post-button";
import BlurView from "@/components/ui/blur-view";
import ButtonBase from "@/components/ui/button-base";

const TabsLayout: FC = () => {
  const { data: me } = api.auth.user.me.useQuery();
  const { bottom: _bottom } = useSafeAreaInsets();
  const bottom = Platform.OS === "android" ? _bottom + 10 : _bottom;

  const renderTabBar = useCallback(
    ({ navigation, state }: BottomTabBarProps) => {
      const icons = me?.verified ? (["star", "plus", "search"] as const) : (["star", "search"] as const);

      return (
        <BlurView
          cls={cn(
            "absolute bottom-0 left-0 right-0 flex flex-row items-center justify-center pt-4",
            Platform.OS === "android" ? "bg-black/60" : "bg-black/20",
          )}
          style={{ paddingBottom: bottom || 15, height: (bottom || 15) + 55 }}
        >
          {state.routes.map((route, routeIndex) => {
            const isFocused = state?.index === routeIndex;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (Platform.OS === "android") {
                if (!isFocused && !event.defaultPrevented) {
                  // @ts-ignore
                  navigation.navigate({ name: route.name, merge: true });
                }
              } else {
                if (!isFocused && !event.defaultPrevented) {
                  // @ts-ignore
                  navigation.navigate({ name: route.name, merge: true });
                }
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            };

            if (route.name === "new-post") {
              if (me?.verified) return <CreatePostButton key={routeIndex} />;
              else return null;
            } else {
              return (
                <ButtonBase key={routeIndex} onPress={onPress} onLongPress={onLongPress} cls="mx-1.5">
                  <MotiView
                    from={{ width: 50, height: 50 }}
                    animate={{ width: isFocused ? 80 : 50, height: 50 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                    }}
                    className="flex items-center justify-center rounded-full border border-white"
                  >
                    <Icon name={icons[routeIndex]} size={24} color="white" />
                  </MotiView>
                </ButtonBase>
              );
            }
          })}
        </BlurView>
      );
    },
    [me, bottom],
  );

  return (
    <>
      {me?.verified ? (
        <Tabs
          tabBar={renderTabBar}
          screenOptions={{
            header: () => null,
          }}
          backBehavior="history"
        >
          <Tabs.Screen name="feed" options={{ href: "/feed " }} />
          <Tabs.Screen name="new-post" />
          <Tabs.Screen name="discover" options={{ href: "/discover" }} />
        </Tabs>
      ) : (
        <Tabs
          tabBar={renderTabBar}
          screenOptions={{
            header: () => null,
          }}
          backBehavior="history"
        >
          <Tabs.Screen name="feed" options={{ href: "/feed " }} />
          <Tabs.Screen name="discover" options={{ href: "/discover" }} />
          <Tabs.Screen name="new-post" options={{ href: null }} />
        </Tabs>
      )}
    </>
  );
};

export default TabsLayout;
