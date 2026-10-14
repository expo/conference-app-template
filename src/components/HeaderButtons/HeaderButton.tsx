import { HeaderButtonProps } from "./HeaderButton.ios";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { theme } from "@/theme";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Pressable } from "react-native-gesture-handler";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function HeaderButton({ imageProps, buttonProps }: HeaderButtonProps) {
  const scale = useSharedValue(1);
  const color = imageProps?.color;
  const iconColor = typeof color === "number" ? theme.colorGrey : color;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  return (
    <AnimatedPressable
      hitSlop={20}
      onPress={buttonProps?.onPress}
      onPressIn={() => {
        scale.set(withTiming(0.8));
      }}
      onPressOut={() => {
        scale.set(withTiming(1));
      }}
      style={animatedStyle}
    >
      <MaterialCommunityIcons
        // Todo: fix this type
        name={(imageProps?.systemName as any) || "cross"}
        size={theme.fontSize24}
        color={iconColor || theme.colorGrey}
      />
    </AnimatedPressable>
  );
}
