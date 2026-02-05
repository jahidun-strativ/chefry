export interface MediaUpload {
  width: number;
  height: number;
  size: number;
  duration?: number;
  fileType: "image" | "video";
  url: string;
}

interface WebFileAsset {
  file: File;
  type: "image" | "video";
  width: number;
  height: number;
  duration?: number;
}

const uploadMediaToFirebase = async ({
  file,
  signedUploadUrl,
  contentType,
  filename,
  width,
  height,
  type,
  onProgressChange,
}: {
  signedUploadUrl: string;
  file: File;
  contentType: string;
  type: "image" | "video";
  width: number;
  height: number;
  filename: string;
  onProgressChange: (progress: number) => void;
}): Promise<MediaUpload> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUploadUrl, true);

    // Set headers
    xhr.setRequestHeader("Content-Type", contentType);

    xhr.upload.onprogress = function (e) {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        onProgressChange?.(Math.round(percentComplete * 10) / 10);
      }
    };

    xhr.onload = function () {
      if (xhr.status === 200 || xhr.status === 201) {
        console.log("Upload complete.");
        resolve({ fileType: type, width, height, size: file.size, url: filename });
      } else {
        console.log("Error occurred during upload.", xhr.status);
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = function () {
      console.log("Network error during upload.");
      reject(new Error("Network error during upload"));
    };

    xhr.send(file);
  });
};

const compressImage = (file: File, maxWidth: number, quality = 0.8): Promise<{ file: File; width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"));
              return;
            }
            const compressedFile = new File([blob], file.name, { type: "image/jpeg" });
            resolve({ file: compressedFile, width, height });
          },
          "image/jpeg",
          quality,
        );
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

const getVideoThumbnail = (file: File): Promise<{ file: File; width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    video.preload = "metadata";
    video.onloadedmetadata = () => {
      video.currentTime = 0.1; // Seek to 0.1 seconds
    };

    video.onseeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to create thumbnail"));
            return;
          }
          const thumbnailFile = new File([blob], `thumbnail_${file.name}.jpg`, { type: "image/jpeg" });
          resolve({ file: thumbnailFile, width: canvas.width, height: canvas.height });
        },
        "image/jpeg",
        0.8,
      );
    };

    video.onerror = () => reject(new Error("Failed to load video"));
    video.src = URL.createObjectURL(file);
  });
};

const getVideoDimensions = (file: File): Promise<{ width: number; height: number; duration: number }> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration,
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error("Failed to load video metadata"));
    };

    video.src = URL.createObjectURL(file);
  });
};

export async function uploadMediaWeb(
  fileAsset: WebFileAsset,
  createSignedUploadUrl: (input: { uri: string }) => Promise<{ signedUploadUrl: string; contentType: string; filename: string }>,
  onProgressChange: (progress: number) => void,
): Promise<{ mediaUpload: MediaUpload; thumbnailUpload: MediaUpload | null }> {
  if (fileAsset.type === "image") {
    // Compress image
    const { file: compressedFile, width, height } = await compressImage(fileAsset.file, 1536, 0.2);

    // Create a data URL for the file to pass to createSignedUploadUrl
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(compressedFile);
    });

    const { signedUploadUrl, contentType, filename } = await createSignedUploadUrl({
      uri: dataUrl,
    });

    const mediaUpload = await uploadMediaToFirebase({
      signedUploadUrl,
      contentType,
      file: compressedFile,
      width,
      height,
      filename,
      type: "image",
      onProgressChange,
    });

    return { mediaUpload, thumbnailUpload: null };
  } else {
    // Get video dimensions and duration
    const { width, height, duration } = await getVideoDimensions(fileAsset.file);

    // Generate thumbnail
    const { file: thumbnailFile, width: thumbnailWidth, height: thumbnailHeight } = await getVideoThumbnail(fileAsset.file);

    const thumbnailDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(thumbnailFile);
    });

    const {
      signedUploadUrl: thumbnailSignedUploadUrl,
      contentType: thumbnailContentType,
      filename: thumbnailFilename,
    } = await createSignedUploadUrl({
      uri: thumbnailDataUrl,
    });

    const thumbnailUpload = await uploadMediaToFirebase({
      signedUploadUrl: thumbnailSignedUploadUrl,
      contentType: thumbnailContentType,
      file: thumbnailFile,
      width: thumbnailWidth,
      height: thumbnailHeight,
      filename: thumbnailFilename,
      type: "image",
      onProgressChange: (progress) => onProgressChange(progress * 0.2),
    });

    const videoDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(fileAsset.file);
    });

    const { signedUploadUrl, contentType, filename } = await createSignedUploadUrl({
      uri: videoDataUrl,
    });

    const mediaUpload = await uploadMediaToFirebase({
      signedUploadUrl,
      contentType,
      file: fileAsset.file,
      width,
      height,
      filename,
      type: "video",
      onProgressChange: (progress) => onProgressChange(20 + progress * 0.8),
    });

    return { mediaUpload: { ...mediaUpload, duration }, thumbnailUpload };
  }
}
