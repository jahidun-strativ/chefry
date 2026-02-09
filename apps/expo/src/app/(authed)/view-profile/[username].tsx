import type { FC } from "react";
import { useLocalSearchParams, usePathname } from "expo-router";

import MainLayout from "@/components/main-layout";
import ProfileScreen from "@/components/profile-screen";
import useScrollTracker from "@/hooks/useScrollTracker";

const ViewProfilePage: FC = () => {
  const { username } = useLocalSearchParams<{ username: string }>();
  const pathname = usePathname();
  const [isScrolled, onScroll] = useScrollTracker(pathname);

  return (
    <MainLayout showBackButton contentType="custom" isScrolled={isScrolled}>
      <ProfileScreen linkPrefix="/feed" username={username} onScroll={onScroll} />
    </MainLayout>
  );
};

export default ViewProfilePage;
