"use client";

import type { FC } from "react";
import { Download } from "lucide-react";

import { openAppStore } from "@/utils/openAppStore";
import { Button } from "./ui/button";

export const DownloadAppButton: FC = () => {
  return (
    <Button size="lg" onClick={openAppStore}>
      <Download size={22} className="mr-2" />
      Download app
    </Button>
  );
};
