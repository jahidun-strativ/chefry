import type { FC } from "react";
import { createElement, useEffect, useState } from "react";
import type { TextInputProps } from "react-native";
import { Platform, View } from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";

type PortalTextInputProps = TextInputProps & {
  value: string;
  onChangeText: (t: string) => void;
};

export const PortalTextInput: FC<PortalTextInputProps> = (props) => {
  const [value, setValue] = useState(props.value);

  useEffect(() => {
    if (value !== props.value) setValue(props.value);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.value]);

  const onChangeText = (text: string) => {
    setValue(text);
    props.onChangeText(text);
  };

  return (
    <View className="flex flex-row rounded-lg border border-white bg-white/10">
      {createElement(BottomSheetTextInput, {
        ...props,
        value,
        onChangeText,
        numberOfLines: Platform.OS === "ios" ? undefined : props.numberOfLines,
        style: {
          width: "100%",
          color: "#fff",
          paddingLeft: 10,
          paddingRight: 10,
          paddingTop: 12,
          paddingBottom: 12,
          fontFamily: "Inter_400Regular",
          minHeight: Platform.OS === "ios" && props.numberOfLines ? 20 * props.numberOfLines : undefined,
          textAlignVertical: props.numberOfLines ? "top" : "auto",
          opacity: props.editable === false ? 0.5 : 1,
        },
        multiline: true,
      })}
    </View>
  );
};
