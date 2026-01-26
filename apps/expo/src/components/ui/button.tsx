import type { FC, PropsWithChildren, ReactNode } from "react";
import type { ColorValue, GestureResponderEvent, PressableProps } from "react-native";
import { Text, View } from "react-native";
import { Link } from "expo-router";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import { cn } from "@/utils/cn";
import { maxFontSizeMultiplier } from "@/utils/constants";
import { LinearGradient } from "../linear-gradient";
import ButtonBase from "./button-base";
import Spinner from "./spinner";

const buttonVariants = cva("rounded-full flex flex-row items-center justify-center overflow-hidden relative", {
  variants: {
    variant: {
      default: "bg-transparent text-white",
      white: "bg-white",
      black: "bg-black",
      outline: "bg-transparent border border-white",
      gradient: "",
      "gradient-border": "bg-white",
    },
    size: {
      default: "px-4 py-4",
      xs: "px-2 py-2",
      sm: "px-3 py-3",
      lg: "px-8 py-6",
      icon: "h-10 w-10",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

const ButtonGradientWrapper: FC<
  PropsWithChildren & {
    cls?: string;
    disabled?: boolean;
    variant: "gradient" | "gradient-border";
    gradient?: [ColorValue, ColorValue, ...ColorValue[]];
  }
> = ({ children, cls, disabled, gradient, variant }) => {
  return (
    <LinearGradient
      colors={
        gradient
          ? gradient
          : variant === "gradient"
            ? ["#938DFB", "#A56ED5", "#B457B8", "#C73993", "#DD1465", "#EB004C"]
            : ["#DF5D9E", "#B7A2F1"]
      }
      start={[0.3, 1.1]}
      end={[0.6, 0]}
      className={cn("w-full rounded-full", disabled && "opacity-50", variant === "gradient-border" && "p-0.5", cls)}
    >
      {children}
    </LinearGradient>
  );
};

export interface ButtonProps extends PressableProps, VariantProps<typeof buttonVariants> {
  href?: string;
  cls?: string;
  clsForce?: string;
  textCls?: string;
  gradient?: string[];
  disabled?: boolean;
  isLoading?: boolean;
  icon?: ReactNode;
}

const Button: FC<ButtonProps> = ({
  cls,
  clsForce,
  textCls,
  variant = "default",
  disabled: _disabled,
  size = "default",
  href,
  children,
  gradient,
  isLoading,
  icon,
  onPress,
  ...props
}) => {
  const disabled = _disabled ?? isLoading;
  const textClass = cn(
    variant === "default" && "text-white",
    variant === "gradient" && "text-white",
    variant === "white" && "text-black",
    variant === "black" && "text-white",
    variant === "outline" && "text-white",
    size === "default" && "text-lg",
    size === "xs" && "text-sm",
    size === "sm" && "text-base",
    size === "lg" && "text-lg",
    size === "icon" && "text-lg",
  );

  const content = (
    <>
      {typeof children === "string" && (
        <Text
          style={{ fontFamily: "Inter_500Medium" }}
          className={cn(textClass, textCls)}
          numberOfLines={1}
          maxFontSizeMultiplier={maxFontSizeMultiplier}
        >
          {children}
        </Text>
      )}
      {typeof children !== "string" && children}
    </>
  );

  const handlePress = (event: GestureResponderEvent) => onPress?.(event);

  const button = (
    <ButtonBase
      {...props}
      disabled={disabled}
      onPress={handlePress}
      cls={cn(
        buttonVariants({ variant, size, className: cn(variant !== "gradient" && cls, clsForce) }),
        disabled && variant !== "gradient" && "opacity-50",
      )}
    >
      {icon && !isLoading && (
        <>
          {icon}
          <View className="w-2" />
        </>
      )}
      {isLoading && <Spinner size={16} cls={cn("mr-4")} />}
      {content}
    </ButtonBase>
  );

  const buttonWithLink =
    href != null ? (
      <Link asChild={true} href={href}>
        {button}
      </Link>
    ) : (
      button
    );

  if (variant == "gradient" || variant == "gradient-border") {
    return (
      <ButtonGradientWrapper
        cls={clsForce ?? cls}
        disabled={disabled}
        variant={variant}
        gradient={gradient as [ColorValue, ColorValue, ...ColorValue[]]}
      >
        {buttonWithLink}
      </ButtonGradientWrapper>
    );
  } else {
    return buttonWithLink;
  }
};

export { Button, buttonVariants };
