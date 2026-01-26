import type { FC } from "react";
import { MotiView } from "moti";

import ButtonBase from "./button-base";

interface Props {
  checked: boolean;
  onToggle: () => void;
}

const Toggle: FC<Props> = ({ checked, onToggle }) => {
  return (
    <ButtonBase onPress={onToggle} className="relative h-[30px] w-[60px] rounded-full border border-white">
      <MotiView
        className="aspect-square h-full rounded-full bg-white"
        animate={{ translateX: checked ? 30 : 0 }}
        transition={{ duration: 150, type: "timing" }}
      />
    </ButtonBase>
  );
};

export default Toggle;
