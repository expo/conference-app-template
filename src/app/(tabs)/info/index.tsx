import { useScrollToTop } from "expo-router/react-navigation";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

import { InfoCard } from "@/components/InfoCard";
import { useThemeColor } from "@/components/Themed";
import { VenueInfo } from "@/components/VenueInfo";
import { theme } from "@/theme";
import { ScrollView } from "react-native-gesture-handler";
import { PoweredByExpo } from "@/components/PoweredByExpo";
import { Sponsors } from "@/components/Sponsors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useConferenceStore } from "@/store/conferenceStore";
import { READABLE_MAX_WIDTH, useLayout } from "@/hooks/useLayout";
import conference from "../../../../conference.config";

export default function Info() {
  const backgroundColor = useThemeColor(theme.color.background);
  const infoSections = useConferenceStore((state) => state.infoSections);
  const ref = React.useRef(null);
  const { bottom } = useSafeAreaInsets();
  const { horizontalInsets } = useLayout();

  useScrollToTop(ref);

  return (
    <ScrollView
      style={{ backgroundColor }}
      ref={ref}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[
        {
          paddingBottom: Platform.select({ android: 100 + bottom, default: 0 }),
        },
        horizontalInsets,
      ]}
    >
      <View style={styles.readable}>
        <VenueInfo />
        {infoSections.map((section) => (
          <InfoCard key={section.id} section={section} />
        ))}
        <Sponsors />
        {conference.features.poweredByExpo !== false && <PoweredByExpo />}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Wide windows center the content at a comfortable reading width
  readable: {
    alignSelf: "center",
    maxWidth: READABLE_MAX_WIDTH,
    width: "100%",
  },
});
