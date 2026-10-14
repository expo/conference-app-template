import {
  Host,
  Button,
  Image,
  ButtonProps,
  ImageProps,
} from "@expo/ui/swift-ui";
import { buttonStyle, frame } from "@expo/ui/swift-ui/modifiers";
import { theme } from "@/theme";
import { StyleProp, ViewStyle } from "react-native";

const SIZE = theme.fontSize34;

type ButtonVariant = Parameters<typeof buttonStyle>[0];

export interface HeaderButtonProps {
  imageProps?: ImageProps;
  buttonProps?: ButtonProps & { variant?: ButtonVariant };
  style?: StyleProp<ViewStyle>;
}

export function HeaderButton({
  imageProps,
  buttonProps,
  style,
}: HeaderButtonProps) {
  const { variant = "glass", ...restButtonProps } = buttonProps ?? {};

  return (
    <Host matchContents style={[{ height: SIZE, width: SIZE }, style]}>
      <Button
        {...restButtonProps}
        modifiers={[buttonStyle(variant), ...(restButtonProps.modifiers ?? [])]}
      >
        <Image
          {...imageProps}
          systemName={imageProps?.systemName || "xmark"}
          color={imageProps?.color || "primary"}
          size={imageProps?.size || theme.fontSize24}
          modifiers={[
            frame({ height: SIZE }),
            ...(imageProps?.modifiers || []),
          ]}
        />
      </Button>
    </Host>
  );
}
