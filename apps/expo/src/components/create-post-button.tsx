/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { FC } from "react";
import { useRef, useState } from "react";
import { Platform, View } from "react-native";
import Popover from "react-native-popover-view";
import * as ImagePicker from "expo-image-picker";
import Icon from "@expo/vector-icons/Feather";

import type { RouterOutputs } from "@/utils/api";
import { api } from "@/utils/api";
import createToast from "@/utils/createToast";
import { uploadMedia } from "@/utils/imagekit";
import { uploadMediaWeb } from "@/utils/upload-media-web";
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
    if (Platform.OS === "web") {
      // On web, directly trigger file input
      fileInputRef.current?.click();
    } else {
      openPickCaptureTypeModal();
    }
  };

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedMedia, setUploadedMedia] = useState<Media>();

  const { mutateAsync: createMedia } = api.auth.media.create.useMutation();
  const { mutateAsync: createSignedUploadUrl } = api.auth.media.createSignedUploadUrl.useMutation();

  // File input ref for web
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Always call hooks (required by React), but handle web case in the component
  const cameraPermissions = ImagePicker.useCameraPermissions();
  const requestCameraPermission = cameraPermissions[1];

  // Web file handler
  const handleWebFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    closePickPostTypePopover();

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        createToast({
          type: "error",
          message: "Please select an image or video file",
        });
        setIsUploading(false);
        return;
      }

      // Get image dimensions
      let width = 0;
      let height = 0;
      let duration: number | undefined;

      if (isImage) {
        const img = new Image();
        const imgUrl = URL.createObjectURL(file);
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            width = img.width;
            height = img.height;
            URL.revokeObjectURL(imgUrl);
            resolve();
          };
          img.onerror = () => {
            URL.revokeObjectURL(imgUrl);
            reject(new Error("Failed to load image"));
          };
          img.src = imgUrl;
        });
      } else {
        const video = document.createElement("video");
        const videoUrl = URL.createObjectURL(file);
        await new Promise<void>((resolve, reject) => {
          video.onloadedmetadata = () => {
            width = video.videoWidth;
            height = video.videoHeight;
            duration = video.duration;
            URL.revokeObjectURL(videoUrl);
            resolve();
          };
          video.onerror = () => {
            URL.revokeObjectURL(videoUrl);
            reject(new Error("Failed to load video"));
          };
          video.src = videoUrl;
        });
      }

      const { mediaUpload, thumbnailUpload } = await uploadMediaWeb(
        {
          file,
          type: isImage ? "image" : "video",
          width,
          height,
          duration,
        },
        createSignedUploadUrl,
        setUploadProgress,
      );

      const media = await createMedia({ media: mediaUpload, thumbnail: thumbnailUpload });
      setUploadedMedia(media);
      openPublishPostModal();
      setIsUploading(false);
    } catch (e) {
      console.error(e);
      setUploadProgress(0);
      setIsUploading(false);
      createToast({
        type: "error",
        message: e instanceof Error ? e.message : "Something went wrong",
      });
    }
  };

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

      {/* Hidden file input for web */}
      {Platform.OS === "web" && (
        <input
          ref={fileInputRef as React.RefObject<HTMLInputElement>}
          type="file"
          accept="image/*,video/*"
          style={{ display: "none" }}
          onChange={handleWebFileSelect}
        />
      )}

      <Popover
        isVisible={pickPostTypePopoverOpen}
        from={(sourceRef) => (
          <ButtonBase ref={sourceRef as any} onPress={!isUploading ? openPickPostTypePopover : undefined} cls="mx-1.5">
            <View className="flex items-center justify-center rounded-full border border-white" style={{ width: 44, height: 44 }}>
              <Icon name="plus" size={18} color="white" />
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

      {Platform.OS !== "web" && (
        <PickMediaCaptureTypeModal
          isOpen={pickCaptureTypeModalOpen}
          onCancel={closePickCaptureTypeModal}
          onSelectType={handlePickMedia}
          postType={postType}
        />
      )}

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
