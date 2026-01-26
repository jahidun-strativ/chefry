import { useState } from "react";
import * as ImagePicker from "expo-image-picker";

import type { RouterOutputs } from "@/utils/api";
import { api } from "@/utils/api";
import createToast from "@/utils/createToast";
import { uploadMedia } from "@/utils/imagekit";
import useOpenState from "@/hooks/useOpenState";
import FullPageLoadingOverlay from "../full-page-loading-overlay";
import PickMediaCaptureTypeModal from "../pick-media-capture-type-modal";
import { Button } from "../ui/button";
import { CreateEventPackagePostModal } from "./create-event-package-post-modal";

type Media = RouterOutputs["auth"]["media"]["get"];

export interface CreatedEventPackagePost {
  media: Media;
  caption: string;
}

interface Props {
  onCreate: (post: CreatedEventPackagePost) => void;
}

export function CreateEventPackagePostButton({ onCreate }: Props) {
  const [publishPostModalOpen, openPublishPostModal, closePublishPostModal] = useOpenState();
  const [pickCaptureTypeModalOpen, openPickCaptureTypeModal, closePickCaptureTypeModal] = useOpenState();

  const [postType, setPostType] = useState<"STORY" | "POST">("POST");

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedMedia, setUploadedMedia] = useState<Media>();

  const { mutateAsync } = api.auth.media.create.useMutation();
  const { mutateAsync: createSignedUploadUrl } = api.auth.media.createSignedUploadUrl.useMutation();

  const [, requestCameraPermission] = ImagePicker.useCameraPermissions();

  const handlePickMedia = async (captureType: "LIBRARY" | "CAMERA_IMAGE" | "CAMERA_VIDEO") => {
    closePickCaptureTypeModal();

    try {
      setIsUploading(true);
      let pickedMedia: ImagePicker.ImagePickerAsset | undefined = undefined;
      if (captureType === "CAMERA_IMAGE" || captureType === "CAMERA_VIDEO") {
        await ImagePicker.getCameraPermissionsAsync();

        await requestCameraPermission();

        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: captureType === "CAMERA_IMAGE" ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
          // videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
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

      if (!pickedMedia) {
        setIsUploading(false);
        return;
      }

      const { mediaUpload, thumbnailUpload } = await uploadMedia(pickedMedia, createSignedUploadUrl, setUploadProgress);
      const media = await mutateAsync({ media: mediaUpload, thumbnail: thumbnailUpload });

      setUploadedMedia(media);

      // if (media.type === "IMAGE") {
      //   openCropMediaModal();
      // } else {
      //   openPublishPostModal();
      // }

      openPublishPostModal();

      setIsUploading(false);
    } catch (e) {
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

      <Button onPress={openPickCaptureTypeModal} variant="outline" size="sm">
        + Add content
      </Button>

      <PickMediaCaptureTypeModal
        isOpen={pickCaptureTypeModalOpen}
        onCancel={closePickCaptureTypeModal}
        onSelectType={handlePickMedia}
        postType={postType}
      />

      <CreateEventPackagePostModal
        isOpen={publishPostModalOpen && !!uploadedMedia}
        onClose={closePublishPostModal}
        mediaId={uploadedMedia?.id}
        onCreated={onCreate}
      />
    </>
  );
}
