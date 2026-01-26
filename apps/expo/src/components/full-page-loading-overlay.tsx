import type { FC } from "react";
import { Portal } from "@gorhom/portal";
import { AnimatePresence, MotiView } from "moti";

import Spinner from "./ui/spinner";
import Typography from "./ui/typography";

interface Props {
  isLoading: boolean;
  loadingMessage?: string;
}

const FullPageLoadingOverlay: FC<Props> = ({ isLoading, loadingMessage }) => {
  return (
    <Portal>
      <AnimatePresence>
        {isLoading && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex h-full w-full flex-col items-center justify-center bg-black/50"
          >
            <Spinner cls="h-12" size={40} />
            {loadingMessage && (
              <Typography variant="p" cls="mt-4 text-lg text-white">
                {loadingMessage}
              </Typography>
            )}
          </MotiView>
        )}
      </AnimatePresence>
    </Portal>
  );
};

export default FullPageLoadingOverlay;
