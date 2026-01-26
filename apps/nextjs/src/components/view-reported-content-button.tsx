/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/media-has-caption */
import { Eye } from "lucide-react";
import type { FC } from "react";
import { useState } from "react";

import { api } from "@/utils/api";
import { getImageUrl, mediaBaseUrl } from "@/utils/imagekit";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

interface Props {
  contentFlagId: string;
}

const ViewReportedContentButton: FC<Props> = ({ contentFlagId }) => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: contentFlag } = api.admin.contentFlag.get.useQuery(
    {
      id: contentFlagId,
    },
    { enabled: isOpen },
  );

  const type = contentFlag?.post ? "post" : "story";
  const media = contentFlag?.post?.media?.[0] || contentFlag?.story?.media;

  return (
    <AlertDialog onOpenChange={setIsOpen}>
      <AlertDialogTrigger>
        <Button variant="ghost" size="icon">
          <Eye className="h-6 w-6" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        {!contentFlag && (
          <div className="flex items-center justify-center p-12">
            <Spinner className="h-8 w-8" />
          </div>
        )}

        {contentFlag && media && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Reported content</AlertDialogTitle>
              <AlertDialogDescription>The content below has been reported.</AlertDialogDescription>
            </AlertDialogHeader>

            <div className="py-4">
              {media.type === "VIDEO" && <video src={mediaBaseUrl + "tr:w-1024/" + media.url} className="w-full" />}

              {media.type === "IMAGE" && (
                <img src={getImageUrl(media.url, [{ width: "1024" }])} className="w-full" alt="Reported content" />
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ViewReportedContentButton;
