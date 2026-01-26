/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import type { FC } from "react";
import { Fragment, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

import { api } from "@/utils/api";

async function registerForPushNotificationsAsync() {
  // Skip push notifications on web - only support native platforms
  if (Platform.OS === "web") {
    return null;
  }

  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      // alert("Failed to get push token for push notification!");
      return null;
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    token = (await Notifications.getExpoPushTokenAsync({ projectId: "0a16acb0-666e-4b5c-911f-a04ffd800ccb" })).data;
  } else {
    // alert("Must use physical device for Push Notifications");
  }

  return token;
}

export const RegisterPushNotifications: FC = () => {
  const { isSignedIn } = useAuth();

  const [initialized, setInitialized] = useState(false);

  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>();

  const { mutate } = api.auth.user.setPushToken.useMutation();
  const { push } = useRouter();
  
  useEffect(() => {
    // Skip push notifications on web - only support native platforms
    if (Platform.OS === "web") {
      return;
    }

    if (!isSignedIn || initialized) return;
    setInitialized(true);

    void registerForPushNotificationsAsync().then((token) => {
      if (token) {
        mutate({ pushToken: token });
      }
    });
  }, [isSignedIn, initialized, mutate]);

  useEffect(() => {
    // Skip notification listeners on web - only support native platforms
    if (Platform.OS === "web") {
      return;
    }

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      // setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const postId = response.notification.request.content.data?.postId as string | undefined;
      if (postId && typeof postId === "string") {
        push(`/post/${postId}`);
      }
    });

    return () => {
      if (notificationListener.current) Notifications.removeNotificationSubscription(notificationListener.current);
      if (responseListener.current) Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [push]);

  return <Fragment />;
};
