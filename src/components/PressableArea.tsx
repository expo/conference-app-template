import { PropsWithChildren } from "react";
import { Pressable, PressableProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PressableArea(props: PropsWithChildren<PressableProps>) {
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
  }));

  return (
    <AnimatedPressable
      {...props}
      style={[props.style, animatedStyle]}
      onPressIn={() => {
        opacity.set(withTiming(0.75, { duration: 150 }));
      }}
      onPressOut={() => {
        opacity.set(withTiming(1, { duration: 150 }));
      }}
    />
  );
}
