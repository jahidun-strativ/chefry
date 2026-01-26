import type { FC } from "react";
import { useLocalSearchParams } from "expo-router";

import MainLayout from "@/components/main-layout";
import ProfileScreen from "@/components/profile-screen";
import useScrollTracker from "@/hooks/useScrollTracker";

const ViewProfilePage: FC = () => {
  const { username } = useLocalSearchParams() as { username: string };

  const [isScrolled, onScroll] = useScrollTracker("/discover/view-profile/" + username);

  return (
    <MainLayout showBackButton contentType="custom" isScrolled={isScrolled}>
      <ProfileScreen linkPrefix="/discover" username={username} onScroll={onScroll} />
    </MainLayout>
  );
};

export default ViewProfilePage;
