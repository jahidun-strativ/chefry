import type { FC } from "react";
import { useMemo } from "react";
import { View } from "react-native";

import { api } from "@/utils/api";
import createToast from "@/utils/createToast";
import type { INTEREST } from "@/utils/models";
import { INTERESTS } from "@/utils/models";
import InterestCard from "@/components/interest-card";
import MainLayout from "@/components/main-layout";

const interestPairs = INTERESTS.reduce<INTEREST[][]>((acc, curr, i) => {
  if (i % 2 === 0) {
    acc.push([curr]);
  } else {
    acc[acc.length - 1]?.push(curr);
  }
  return acc;
}, []);

const EditInterestsPage: FC = () => {
  const { data: interestsData, isLoading, refetch } = api.auth.user.myInterests.useQuery();
  const interests = useMemo(() => (interestsData || []) as INTEREST[], [interestsData]);

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
      <View className="mt-6 flex h-full flex-col gap-3 pb-32">
        {interestPairs.map((pair, i) => (
          <View key={i} className="flex flex-row gap-3">
            {pair.map((interest) => (
              <View className="flex-1 " key={interest}>
                <InterestCard interest={interest} isSelected={interests.includes(interest)} onToggleSelect={handleToggleSelect} />
              </View>
            ))}
            {pair.length === 1 && <View className="flex-1" />}
          </View>
        ))}
      </View>
    </MainLayout>
  );
};

export default EditInterestsPage;
