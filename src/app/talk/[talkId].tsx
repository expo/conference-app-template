import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  Easing,
  useAnimatedReaction,
  useDerivedValue,
  withTiming,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import { ScrollView } from "react-native-gesture-handler";
import { Canvas, Fill, Shader, Skia, vec } from "@shopify/react-native-skia";

import { NotFound } from "@/components/NotFound";
import { ThemedView } from "@/components/Themed";
import { TalkDetails } from "@/components/TalkDetails";
import { useConferenceStore } from "@/store/conferenceStore";
import { theme } from "@/theme";
import { findSessionInDays } from "@/utils/sessions";
import { HeaderButton } from "@/components/HeaderButtons/HeaderButton";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { scheduleOnRN } from "react-native-worklets";
import { Bookmark } from "@/components/Bookmark";
import { osName } from "expo-device";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const source = Skia.RuntimeEffect.Make(`
uniform float sheetAnim;
uniform vec2 size;

vec4 main(vec2 pos) {
  vec2 normalized = pos/vec2(256);
  vec2 offset;
  float dist;
  offset = (pos - vec2(size.x/2, -size.y));
  dist = sqrt(pow(offset.x, 2.0) + pow(offset.y, 2.0)) / sqrt(pow(size.x/2, 2.0) + pow(size.y/2, 2.0));
  float anim = 1 - sheetAnim;

  offset = (pos - vec2(size.x*anim, size.y*anim));
  dist = sqrt(pow(offset.x, 2.0) + pow(offset.y, 2.0)) / sqrt(pow(size.x/2, 2.0) + pow(size.x/2, 2.0)) - pow(sheetAnim,1.3);
  float mixVal = max(0.0,dist);
  vec4 colorA = vec4(0.345, 0.769, 0.863, 1.0) + vec4(1.0, normalized.x, normalized.y,1.0) / 6.0;
  vec4 colorB = vec4(0.031, 0.494, 0.643, 1.0);

  vec4 color = mix(colorA, colorB, mixVal);
  return vec4(color);
}`)!;

export default function TalkDetail() {
  const params = useLocalSearchParams();
  const router = useRouter();

  // The screen can be the first one after a deep link, with no back stack
  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/(calendar)");
    }
  };
  const talkId = Array.isArray(params.talkId)
    ? params.talkId[0]
    : params.talkId;
  const days = useConferenceStore((state) => state.days);
  const { width, height } = useWindowDimensions();
  const drawerHeight = height * 0.8;

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const overscrollAmount = useSharedValue(0);

  const { session: talk, dayIndex } = findSessionInDays(talkId, days);

  const insets = useSafeAreaInsets();

  const sheetAnim = useSharedValue(0);
  const hasTriggeredHaptic = useSharedValue(false);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event;
    const scrollPastBottom = Math.max(
      0,
      contentOffset.y + layoutMeasurement.height - contentSize.height - 20,
    );
    overscrollAmount.value = scrollPastBottom;
  });

  useAnimatedReaction(
    () => overscrollAmount.value,
    (amount) => {
      if (amount > 0 && !hasTriggeredHaptic.value) {
        hasTriggeredHaptic.value = true;
        scheduleOnRN(triggerHaptic);
      } else if (amount === 0) {
        hasTriggeredHaptic.value = false;
      }

      const normalizedAmount = Math.min(amount / 100, 1);
      sheetAnim.value = withTiming(normalizedAmount, {
        duration: 600,
        easing: Easing.out(Easing.quad),
      });
    },
    [],
  );

  const uniforms = useDerivedValue(() => ({
    sheetAnim: sheetAnim.value,
    size: vec(width, drawerHeight),
  }));

  const opacityStyle = useAnimatedStyle(() => ({
    opacity: sheetAnim.value * 0.4,
  }));

  if (!talk) {
    return (
      <>
        <Stack.Screen
          options={{
            headerLeft: () =>
              Platform.select({
                ios: <HeaderButton buttonProps={{ onPress: goBack }} />,
                default: undefined,
              }),
          }}
        />
        <NotFound message="Talk not found" />
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () =>
            Platform.select({
              ios: (
                <HeaderButton
                  buttonProps={{ onPress: goBack }}
                  // eslint-disable-next-line react-native/no-inline-styles
                  style={{ padding: osName === "iPadOS" ? 40 : 0 }}
                />
              ),
              default: undefined,
            }),
          headerRight: () => (
            <Bookmark
              session={talk}
              // eslint-disable-next-line react-native/no-inline-styles
              style={{ padding: osName === "iPadOS" ? 40 : 0 }}
            />
          ),
        }}
      />

      <ThemedView
        style={styles.container}
        color={
          isLiquidGlassAvailable()
            ? theme.color.transparent
            : theme.color.background
        }
      >
        {isLiquidGlassAvailable() && osName !== "iPadOS" ? (
          <View style={[styles.absolute, { height: drawerHeight, width }]}>
            <Animated.View style={[opacityStyle, styles.absolute]}>
              <Canvas
                style={{
                  width: width,
                  height: drawerHeight,
                  transform: [{ scale: 2 }],
                }}
              >
                <Fill>
                  <Shader source={source} uniforms={uniforms} />
                </Fill>
              </Canvas>
            </Animated.View>
            <View style={{ height: drawerHeight }}>
              <Animated.View style={[opacityStyle, styles.absolute]}>
                <Canvas style={{ width: width, height: drawerHeight }}>
                  <Fill>
                    <Shader source={source} uniforms={uniforms} />
                  </Fill>
                </Canvas>
              </Animated.View>
            </View>
          </View>
        ) : null}
        <AnimatedScrollView
          onScroll={scrollHandler}
          style={styles.container}
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.contentContainer,
            {
              minHeight: drawerHeight,
              paddingBottom: insets.bottom + theme.space24,
              paddingTop: Platform.select({
                ios: theme.space24,
                default: undefined,
              }),
            },
          ]}
        >
          <TalkDetails talk={talk} dayIndex={dayIndex} />
        </AnimatedScrollView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  absolute: {
    position: "absolute",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    borderBottomLeftRadius: theme.borderRadius20,
    borderBottomRightRadius: theme.borderRadius20,
  },
});
