import type { FC } from "react";
import { useState } from "react";
import { Pressable, View } from "react-native";
import Icon from "@expo/vector-icons/MaterialIcons";

import { cn } from "@/utils/cn";
import type { InputProps } from "./ui/input";
import Input from "./ui/input";

export const PasswordInput: FC<InputProps> = (props) => {
  const [secureTextInput, setSecureTextInput] = useState(true);

  return (
    <View className="relative">
      <Input
        {...props}
        secureTextEntry={secureTextInput}
        classes={{ ...(props?.classes ?? {}), input: cn("pr-12", props.classes?.input) }}
      />
      <Pressable
        className="absolute bottom-0 right-0 top-4 flex w-12 items-center justify-center"
        onPress={() => setSecureTextInput(!secureTextInput)}
      >
        <Icon size={20} name={secureTextInput ? "remove-red-eye" : "lock"} color="white" />
      </Pressable>
    </View>
  );
};
