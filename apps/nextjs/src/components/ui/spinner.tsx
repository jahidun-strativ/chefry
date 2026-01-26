import type { FC } from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SpinnerProps {
  className?: string;
}

export const Spinner: FC<SpinnerProps> = ({ className }) => {
  return <Loader2 className={cn("h-4 w-4  animate-spin text-[#9A82EE]", className)} />;
};
