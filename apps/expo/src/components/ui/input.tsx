import type { FC, ReactNode } from "react";
import { memo } from "react";
import type { TextInputProps } from "react-native";
import { Platform, TextInput, View } from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";

import { cn } from "@/utils/cn";
import Typography from "./typography";

export interface InputProps extends TextInputProps {
  classes?: { root?: string; input?: string; inputWrapper?: string };
  label?: string;
  bottomSheetInput?: boolean;
  suffix?: string | ReactNode;
}

const Input: FC<InputProps> = ({ classes = {}, label, bottomSheetInput, suffix, ...props }) => {
  const InputComponent = bottomSheetInput ? BottomSheetTextInput : TextInput;

  return (
    <View className={classes.root}>
      {label && (
        <Typography cls="mb-1.5 md:mb-2 lg:mb-2.5 ml-3 md:ml-4 lg:ml-5 text-xs md:text-sm lg:text-base" variant="h3">
          {label}
        </Typography>
      )}
      <View className={cn("flex flex-row rounded-full border border-white bg-red-500 bg-white/10", classes.inputWrapper)}>
        <InputComponent
          // className={cn("h-12 flex-1 rounded-full px-6 text-base text-white", classes.input, props.multiline ? "" : "h-12")}
          {...props}
          className={cn("flex-1 px-6 py-5 text-white", classes.input)}
          numberOfLines={Platform.OS === "ios" ? undefined : props.numberOfLines}
          style={{
            fontFamily: "Inter_400Regular",
            minHeight: Platform.OS === "ios" && props.numberOfLines ? 20 * props.numberOfLines : undefined,
            textAlignVertical: props.numberOfLines ? "top" : "auto",
            opacity: props.editable === false ? 0.5 : 1,
          }}
          placeholderTextColor="#999"
        />
        {suffix && (
          <View className="-mb-2 flex flex-none items-center justify-center rounded-r-full border-l border-white bg-white/10 px-5">
            {typeof suffix === "string" && <Typography cls="text-2xl">{suffix}</Typography>}
          </View>
        )}
      </View>
    </View>
  );
};

export default memo(Input);
