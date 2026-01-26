import { useState } from "react";
import { useRouter } from "expo-router";

import { api } from "@/utils/api";
import createToast from "@/utils/createToast";
import { CreateEventPackageContent } from "@/components/event-package/create-event-package-content";
import type { CreatedEventPackagePost } from "@/components/event-package/create-event-package-post-button";
import { EventPackageDetailsForm } from "@/components/event-package/event-package-details-form";
import MainLayout from "@/components/main-layout";
import { Button } from "@/components/ui/button";

const steps = ["Details", "Content"] as const;

export default function CreateEventPackagePage() {
  const [currentStep, setCurrentStep] = useState<(typeof steps)[number]>(steps[0]);

  const [details, setDetails] = useState<{ name: string; description: string; price: null | number }>({
    name: "",
    description: "",
    price: null,
  });

  const [createdPosts, setCreatedPosts] = useState<CreatedEventPackagePost[]>([]);

  const handleGoToStep = (step: (typeof steps)[number]) => {
    if (step === "Details") {
      setCurrentStep(step);
    } else if (step === "Content") {
      if (details.name === "" || details.description === "" || details.price == null) {
        createToast({
          type: "error",
          message: "Please fill all required fields",
        });
        return;
      }
      setCurrentStep("Content");
    }
  };

  const utils = api.useUtils();
  const router = useRouter();
  const { mutate, isLoading } = api.auth.eventPackage.create.useMutation({
    onSuccess: async () => {
      await utils.auth.eventPackage.invalidate();
      createToast({
        type: "success",
        message: "Event package created!",
      });
      router.replace("/profile");
    },
    onError: (e) => {
      createToast({
        type: "error",
        message: e.message,
      });
    },
  });

  const handleCreateEventPackage = () => {
    if (details.name === "" || details.description === "" || details.price == null) {
      createToast({
        type: "error",
        message: "Please fill all required fields",
      });
      return;
    }

    if (createdPosts.length === 0) {
      createToast({
        type: "error",
        message: "Please add at least one post",
      });
      return;
    }

    mutate({
      name: details.name,
      description: details.description,
      price: details.price,
      posts: createdPosts.map((post) => ({
        mediaId: post.media.id,
        caption: post.caption,
        cropX: post.media.cropX,
        cropY: post.media.cropY,
        cropWidth: post.media.cropWidth,
        cropHeight: post.media.cropHeight,
      })),
    });
  };

  return (
    <MainLayout
      title="Add new package"
      showBackButton
      contentType="scrollable"
      floatingButton={
        <Button
          variant="gradient"
          disabled={isLoading}
          cls="mt-6"
          onPress={() => {
            if (currentStep === "Details") {
              handleGoToStep("Content");
            } else if (currentStep === "Content") {
              handleCreateEventPackage();
            }
          }}
        >
          Create package
        </Button>
      }
    >
      {/* <View className="mt-4 flex flex-row items-center px-4"> */}
      {/* {steps.map((step, index) => {
          const isDone = steps.indexOf(step) < steps.indexOf(currentStep);
          const isActive = step === currentStep;
          return (
            <Fragment key={step}>
              {index !== 0 && <View className="h-0.5 flex-1 bg-white/50" />}
              <ButtonBase className="mx-3 flex flex-row items-center justify-center" onPress={() => handleGoToStep(step)}>
                <View
                  className={cn(
                    "mr-2 flex h-6 w-6 items-center justify-center rounded-full",
                    isDone && "bg-white",
                    isActive && "bg-white/40",
                    !isDone && !isActive && "border border-white/40",
                  )}
                >
                  {isActive && <View className="h-2 w-2 rounded-full bg-white" />}
                  {!isDone && !isActive && <View className="h-2 w-2 rounded-full bg-white/40" />}
                  {isDone && <Icon size={12} name="check" color="#000" />}
                </View>
                <Typography fontWeight="bold">{step}</Typography>
              </ButtonBase>
              {index !== steps.length - 1 && <View className="h-0.5 flex-1 bg-white/50" />}
            </Fragment>
          );
        })}
      </View> */}

      <EventPackageDetailsForm details={details} setDetails={setDetails} />
      <CreateEventPackageContent posts={createdPosts} onChange={setCreatedPosts} />
    </MainLayout>
  );
}
