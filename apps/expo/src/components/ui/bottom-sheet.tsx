import type { FC, PropsWithChildren } from "react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { BottomSheetModal, BottomSheetView, useBottomSheetDynamicSnapPoints } from "@gorhom/bottom-sheet";
import { AnimatePresence, MotiView } from "moti";

import { cn } from "@/utils/cn";
import BottomSheetBackdrop from "./bottom-sheet-backdrop";
import Spinner from "./spinner";

interface Props extends PropsWithChildren {
  open: boolean;
  title?: string;
  description?: string;
  classes?: { content?: string };
  isLoading?: boolean;
  onClose: () => void;
}

const BottomSheet: FC<Props> = ({ open, onClose, children, isLoading, classes = {} }) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const initialSnapPoints = useMemo(() => ["CONTENT_HEIGHT"], []);

  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(initialSnapPoints);

  useEffect(() => {
    if (open) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.close();
    }
  }, [open]);

  const Backdrop = useCallback(() => <BottomSheetBackdrop isOpen={open} onClose={onClose} />, [open, onClose]);

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      backdropComponent={Backdrop}
      snapPoints={animatedSnapPoints}
      handleHeight={animatedHandleHeight}
      contentHeight={animatedContentHeight}
      onDismiss={onClose}
      style={{ zIndex: 1000 }}
      containerStyle={{ zIndex: 1000 }}
      backgroundStyle={{ backgroundColor: "#48464B" }}
    >
      <BottomSheetView className="z-[1000]" onLayout={handleContentLayout}>
        <AnimatePresence>
          {isLoading && (
            <MotiView key="loading" className="absolute flex h-full w-full items-center justify-center">
              <Spinner size={26} />
            </MotiView>
          )}

          {!isLoading && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key="content"
              className={cn("flex flex-col p-6 pt-2", classes?.content)}
            >
              {children}
            </MotiView>
          )}
        </AnimatePresence>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default BottomSheet;
