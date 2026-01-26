/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { FC } from "react";
import { useState } from "react";
import { Platform, View } from "react-native";
import Popover from "react-native-popover-view";
import * as ImagePicker from "expo-image-picker";
import Icon from "@expo/vector-icons/Feather";

import type { RouterOutputs } from "@/utils/api";
import { api } from "@/utils/api";
import createToast from "@/utils/createToast";
import { uploadMedia } from "@/utils/imagekit";
import useOpenState from "@/hooks/useOpenState";
import CreatePostModal from "./create-post-modal";
import FullPageLoadingOverlay from "./full-page-loading-overlay";
import PickMediaCaptureTypeModal from "./pick-media-capture-type-modal";
import BlurView from "./ui/blur-view";
import { Button } from "./ui/button";
import ButtonBase from "./ui/button-base";

type Media = RouterOutputs["auth"]["media"]["get"];

const CreatePostButton: FC = () => {
  const [pickPostTypePopoverOpen, openPickPostTypePopover, closePickPostTypePopover] = useOpenState();
  const [publishPostModalOpen, openPublishPostModal, closePublishPostModal] = useOpenState();
  const [pickCaptureTypeModalOpen, openPickCaptureTypeModal, closePickCaptureTypeModal] = useOpenState();

  const [postType, setPostType] = useState<"STORY" | "POST">("POST");
  const handleOpenPickCaptureTypeModal = (postType: "STORY" | "POST") => () => {
    closePickPostTypePopover();
    setPostType(postType);
    openPickCaptureTypeModal();
  };

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedMedia, setUploadedMedia] = useState<Media>();

  const { mutateAsync: createMedia } = api.auth.media.create.useMutation();
  const { mutateAsync: createSignedUploadUrl } = api.auth.media.createSignedUploadUrl.useMutation();

  // Always call hooks (required by React), but handle web case in the component
  const cameraPermissions = ImagePicker.useCameraPermissions();
  const requestCameraPermission = cameraPermissions[1];

  // Skip on web - image picker requires native modules
  if (Platform.OS === "web") {
    return null;
  }

  const handlePickMedia = async (captureType: "LIBRARY" | "CAMERA_IMAGE" | "CAMERA_VIDEO") => {
    setUploadProgress(0);
    closePickCaptureTypeModal();

    try {
      setIsUploading(true);
      let pickedMedia: ImagePicker.ImagePickerAsset | undefined = undefined;
      if (captureType === "CAMERA_IMAGE" || captureType === "CAMERA_VIDEO") {
        await ImagePicker.getCameraPermissionsAsync();

        await requestCameraPermission();

        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: captureType === "CAMERA_IMAGE" ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
          allowsEditing: false,
          allowsMultipleSelection: false,
        });

        if (result.canceled) {
          setIsUploading(false);
          return;
        }

        pickedMedia = result.assets?.[0];
      } else {
        await ImagePicker.getMediaLibraryPermissionsAsync();

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsMultipleSelection: false,
        });

        if (result.canceled) {
          setIsUploading(false);
          return;
        }
        pickedMedia = result.assets?.[0];
      }
      closePickPostTypePopover();

      if (!pickedMedia) {
        setIsUploading(false);
        return;
      }

      const { mediaUpload, thumbnailUpload } = await uploadMedia(pickedMedia, createSignedUploadUrl, setUploadProgress);
      const media = await createMedia({ media: mediaUpload, thumbnail: thumbnailUpload });

      setUploadedMedia(media);

      // if (media.type === "IMAGE") {
      //   openCropMediaModal();
      // } else {
      //   openPublishPostModal();
      // }

      openPublishPostModal();

      setIsUploading(false);
    } catch (e) {
      console.log(e);
      //
      setUploadProgress(0);
      setIsUploading(false);
      setPostType("POST");
      createToast({
        type: "error",
        message: "Something went wrong",
      });
    }
  };

  return (
    <>
      <FullPageLoadingOverlay isLoading={isUploading} loadingMessage={`Uploading ${uploadProgress.toFixed(0)}%`} />

      <Popover
        isVisible={pickPostTypePopoverOpen}
        from={(sourceRef) => (
          <ButtonBase ref={sourceRef as any} onPress={!isUploading ? openPickPostTypePopover : undefined} cls="mx-1.5">
            <View className="flex items-center justify-center rounded-full border border-white" style={{ width: 50, height: 50 }}>
              <Icon name="plus" size={24} color="white" />
            </View>
          </ButtonBase>
        )}
        popoverStyle={{
          backgroundColor: "rgba(0,0,0,0.6)",
          borderRadius: 16,
          overflow: "hidden",
          bottom: Platform.OS === "android" ? 30 : undefined,
        }}
        backgroundStyle={{
          backgroundColor: "rgba(0,0,0,0.7)",
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        onRequestClose={closePickPostTypePopover}
      >
        <View className="h-full w-full">
          <BlurView cls="flex w-64 flex-col overflow-hidden rounded-[16px] border border-white/40 p-0">
            <Button onPress={handleOpenPickCaptureTypeModal("POST")} cls="">
              New post
            </Button>
            <View className="h-[1px] bg-white/40" />
            <Button onPress={handleOpenPickCaptureTypeModal("STORY")}>New story</Button>
            <View className="h-[1px] bg-white/40" />

            <Button onPress={() => closePickPostTypePopover()} href="/create-event-package">
              New event package
            </Button>
          </BlurView>
        </View>
      </Popover>

      <PickMediaCaptureTypeModal
        isOpen={pickCaptureTypeModalOpen}
        onCancel={closePickCaptureTypeModal}
        onSelectType={handlePickMedia}
        postType={postType}
      />

      <CreatePostModal
        isOpen={publishPostModalOpen && !!uploadedMedia}
        onClose={closePublishPostModal}
        mediaId={uploadedMedia?.id}
        postType={postType}
      />
      {/* <CreatePostModal isOpen={true} onClose={closePublishPostModal} mediaId={"cll1dnrk40002p40gf720whw3"} postType={postType} /> */}
      {/* <CreatePostModal isOpen={true} onClose={closePublishPostModal} mediaId={"cll1dq4mb0000l80h1zki3m5f"} /> */}
    </>
  );
};

export default CreatePostButton;
