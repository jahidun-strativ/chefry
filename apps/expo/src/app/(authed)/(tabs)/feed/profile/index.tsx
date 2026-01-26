import type { FC } from "react";

import { api } from "@/utils/api";
import MainLayout from "@/components/main-layout";
import ProfileScreen from "@/components/profile-screen";
import useScrollTracker from "@/hooks/useScrollTracker";

const MyProfilePage: FC = () => {
  const { data: me } = api.auth.user.me.useQuery();
  const username = me?.username;

  // const { data: connectedAccount } = api.auth.stripe.connectedAccount.useQuery(undefined, { enabled: !!username });
  const [isScrolled, onScroll] = useScrollTracker("/feed/profile");

  return (
    <MainLayout contentType="custom" isLoading={!username} isScrolled={isScrolled} showBackButton showProfileButton>
      <ProfileScreen username={username ?? ""} onScroll={onScroll} linkPrefix="/feed/profile" />
    </MainLayout>
  );
};

export default MyProfilePage;
