import type { FC } from "react";
import { useMemo } from "react";
import { View } from "react-native";

import { api } from "@/utils/api";
import { useResponsive } from "@/hooks/useResponsive";
import createToast from "@/utils/createToast";
import type { INTEREST } from "@/utils/models";
import { INTERESTS } from "@/utils/models";
import InterestCard from "@/components/interest-card";
import MainLayout from "@/components/main-layout";

const EditInterestsPage: FC = () => {
  const { data: interestsData, isLoading, refetch } = api.auth.user.myInterests.useQuery();
  const interests = useMemo(() => (interestsData || []) as INTEREST[], [interestsData]);
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  const numColumns = isMobile ? 2 : isTablet ? 3 : 4;
  
  const interestRows = useMemo(() => {
    const rows: INTEREST[][] = [];
    for (let i = 0; i < INTERESTS.length; i += numColumns) {
      rows.push(INTERESTS.slice(i, i + numColumns));
    }
    return rows;
  }, [numColumns]);

  const utils = api.useContext();
  const { mutate: updateUser } = api.auth.user.update.useMutation({
    onSuccess: async () => {
      await utils.auth.user.me.invalidate();
      await refetch();
      createToast({
        type: "success",
        message: "Interests updated!",
      });
    },
    onMutate: async ({ interests }) => {
      if (interests) {
        await utils.auth.user.myInterests.cancel();
        utils.auth.user.myInterests.setData(undefined, interests);
      }
    },
    onError: (e) => {
      createToast({
        type: "error",
        message: "Something went wrong",
      });
    },
  });

  const handleToggleSelect = (interest: INTEREST) => {
    const newInterests = interests.includes(interest) ? interests.filter((i) => i !== interest) : [...interests, interest];
    updateUser({ interests: newInterests });
  };

  return (
    <MainLayout contentType="scrollable" title="Edit your interests" isLoading={isLoading && interests.length === 0} showBackButton>
      <View className="mt-6 md:mt-8 lg:mt-10 flex h-full flex-col gap-3 md:gap-4 lg:gap-5 pb-32 max-w-4xl lg:max-w-6xl mx-auto w-full">
        {interestRows.map((row, i) => (
          <View key={i} className="flex flex-row gap-3 md:gap-4 lg:gap-5">
            {row.map((interest) => (
              <View className="flex-1" key={interest}>
                <InterestCard interest={interest} isSelected={interests.includes(interest)} onToggleSelect={handleToggleSelect} />
              </View>
            ))}
            {row.length < numColumns && Array.from({ length: numColumns - row.length }).map((_, idx) => (
              <View key={`empty-${idx}`} className="flex-1" />
            ))}
          </View>
        ))}
      </View>
    </MainLayout>
  );
};

export default EditInterestsPage;
