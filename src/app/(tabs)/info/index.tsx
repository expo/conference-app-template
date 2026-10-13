import { useScrollToTop } from "@react-navigation/native";
import React from "react";
import { Platform } from "react-native";

import { InfoCard } from "@/components/InfoCard";
import { useThemeColor } from "@/components/Themed";
import { VenueInfo } from "@/components/VenueInfo";
import { theme } from "@/theme";
import { ScrollView } from "react-native-gesture-handler";
import { PoweredByExpo } from "@/components/PoweredByExpo";
import { Sponsors } from "@/components/Sponsors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import conference from "../../../../conference.config";

export default function Info() {
  const backgroundColor = useThemeColor(theme.color.background);
  const ref = React.useRef(null);
  const { bottom } = useSafeAreaInsets();

  useScrollToTop(ref);

  return (
    <ScrollView
      style={{ backgroundColor }}
      ref={ref}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingBottom: Platform.select({ android: 100 + bottom, default: 0 }),
      }}
    >
      <VenueInfo />
      {conference.infoSections.map((section) => (
        <InfoCard key={section.id} section={section} />
      ))}
      <Sponsors />
      <PoweredByExpo />
    </ScrollView>
  );
}
