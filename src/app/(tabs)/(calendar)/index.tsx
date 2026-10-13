import { useScrollToTop } from "@react-navigation/native";
import { Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Keyboard, Platform, RefreshControl, StyleSheet } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

import { ActivityCard } from "@/components/ActivityCard";
import { NotFound } from "@/components/NotFound";
import { TalkCard } from "@/components/TalkCard";
import { matchesSearch } from "@/utils/search";
import { useConferenceStore } from "@/store/conferenceStore";
import { DayPicker } from "@/components/DayPicker";
import { ThemedText, ThemedView, useThemeColor } from "@/components/Themed";
import { theme } from "@/theme";
import { Session } from "@/types";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { formatDayShort, getInitialDayIndex } from "@/utils/formatDate";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CurrentlyLive,
  type CurrentlyLiveSession,
} from "@/components/CurrentlyLive";
import conference from "../../../../conference.config";

const AnimatedFlatList = Animated.FlatList;

const HEADER_SCROLL_OFFSET = isLiquidGlassAvailable() ? 110 : 90;

export default function Schedule() {
  const days = useConferenceStore((state) => state.days);
  const venueTimezone = useConferenceStore((state) => state.venueTimezone);
  const [selectedDayIndex, setSelectedDayIndex] = useState(() =>
    getInitialDayIndex(days, venueTimezone),
  );
  const scrollRef = useRef<FlatList>(null);
  useScrollToTop(scrollRef as any);
  const backgroundColor = useThemeColor(theme.color.background);
  const isLiquidGlass = isLiquidGlassAvailable();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const animatedTranslateY = useSharedValue(0);
  const isScrolledDown = useSharedValue(false);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    animatedTranslateY.value = interpolate(
      event.contentOffset.y,
      [-HEADER_SCROLL_OFFSET, 0],
      [0, HEADER_SCROLL_OFFSET],
      Extrapolation.CLAMP,
    );

    isScrolledDown.value = event.contentOffset.y > 10;
  });

  const stickyHeaderStyle = useAnimatedStyle(() => {
    if (Platform.OS !== "ios") {
      return {};
    }

    return {
      transform: [{ translateY: animatedTranslateY.value }],
      backgroundColor: isLiquidGlass ? "transparent" : backgroundColor,
    };
  });

  // The selection can point past the end after a dev dataset switch
  const activeDayIndex = Math.min(
    selectedDayIndex,
    Math.max(days.length - 1, 0),
  );

  const renderItem = useCallback(
    ({ item }: { item: Session }) => {
      if (item.isServiceSession) {
        return <ActivityCard session={item} />;
      } else {
        return (
          <TalkCard key={item.id} session={item} dayIndex={activeDayIndex} />
        );
      }
    },
    [activeDayIndex],
  );

  const refreshSchedule = useConferenceStore((state) => state.refreshData);

  const params = useLocalSearchParams<{ q?: string }>();
  const searchText = params?.q ?? "";

  const daySessions = days[activeDayIndex]?.sessions ?? [];
  const data = searchText
    ? daySessions.filter((session) => matchesSearch(session, searchText))
    : daySessions;

  useFocusEffect(() => {
    refreshSchedule({ ttlMs: 60_000 });
  });

  const handleSelectDay = useCallback(
    (dayIndex: number) => {
      setSelectedDayIndex(dayIndex);
      if (isScrolledDown.value) {
        scrollRef.current?.scrollToOffset({
          offset: -30 - insets.top,
          animated: true,
        });
      }
    },
    [insets.top, isScrolledDown],
  );

  const dayOptions = useMemo(
    () => days.map((day) => formatDayShort(day.date)),
    [days],
  );

  const renderStickyHeader = useMemo(
    () => (
      <Animated.View style={stickyHeaderStyle}>
        <DayPicker
          options={dayOptions}
          selectedIndex={activeDayIndex}
          onSelectDay={handleSelectDay}
        />
      </Animated.View>
    ),
    [dayOptions, handleSelectDay, activeDayIndex, stickyHeaderStyle],
  );

  if (!days.length) {
    return <NotFound message="Schedule unavailable" />;
  }

  const handleRefreshSchedule = async () => {
    setIsRefreshing(true);
    await Promise.all([
      new Promise((resolve) => setTimeout(resolve, 1000)),
      refreshSchedule(),
    ]);
    setIsRefreshing(false);
  };

  const handleScrollToSession = (currentlyLive: CurrentlyLiveSession) => {
    setSelectedDayIndex(currentlyLive.dayIndex);
    setTimeout(() => {
      scrollRef.current?.scrollToIndex({
        index: currentlyLive.sessionIndex,
        animated: true,
        viewOffset: Platform.select({
          android: 50,
          default: isLiquidGlass
            ? isScrolledDown.value
              ? 155
              : 87
            : isScrolledDown.value
              ? 125
              : 120,
        }),
      });
    }, 200);
  };

  return (
    <>
      {conference.features.currentlyLive && (
        <Stack.Screen
          options={{
            headerTitle: () => (
              <CurrentlyLive scrollToSession={handleScrollToSession} />
            ),
          }}
        />
      )}
      <AnimatedFlatList
        ref={scrollRef}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefreshSchedule}
          />
        }
        style={{ backgroundColor }}
        contentContainerStyle={{
          paddingBottom: Platform.select({
            android: 100 + insets.bottom,
            default: 0,
          }),
        }}
        contentInsetAdjustmentBehavior="automatic"
        scrollToOverflowEnabled
        onScroll={scrollHandler}
        onScrollBeginDrag={() => Keyboard.dismiss()}
        keyboardShouldPersistTaps="handled"
        data={data}
        ListHeaderComponent={renderStickyHeader}
        stickyHeaderIndices={[0]}
        keyExtractor={(item: Session) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          searchText ? (
            <ThemedView style={styles.noResultsContainer}>
              <ThemedText>
                No sessions found for{" "}
                <ThemedText fontWeight="bold">{searchText}</ThemedText>
              </ThemedText>
            </ThemedView>
          ) : null
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  noResultsContainer: {
    padding: theme.space24,
  },
});
