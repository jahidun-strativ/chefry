import type { FC } from "react";
import { AnimatePresence, MotiView } from "moti";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const BottomSheetBackdrop: FC<Props> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 200, type: "timing" }}
          className="absolute inset-0 z-[999] h-full w-full bg-black/50"
          onTouchStart={onClose}
        />
      )}
    </AnimatePresence>
  );
};

export default BottomSheetBackdrop;
