import { theme } from "@/theme";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText, ThemedView } from "./Themed";
import { Image } from "expo-image";
import openWebBrowserAsync from "@/utils/openWebBrowserAsync";
import { useConferenceStore } from "@/store/conferenceStore";
import type { Sponsor } from "@/config/types";

export function Sponsors() {
  const sponsorTiers = useConferenceStore((state) => state.sponsorTiers);

  if (!sponsorTiers.length) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText
        fontSize={theme.fontSize18}
        fontWeight="semiBold"
        style={styles.title}
      >
        Sponsors
      </ThemedText>
      <ThemedView style={styles.content} color={theme.color.backgroundElement}>
        {sponsorTiers.map((tier) => (
          <View key={tier.title}>
            <ThemedText color={theme.color.textSecondary} style={styles.level}>
              {tier.title}
            </ThemedText>
            <View style={styles.sponsors}>
              {tier.sponsors.map((sponsor) => (
                <SponsorCard key={sponsor.name} sponsor={sponsor} />
              ))}
            </View>
          </View>
        ))}
      </ThemedView>
    </ThemedView>
  );
}

function SponsorCard({ sponsor }: { sponsor: Sponsor }) {
  return (
    <Pressable
      style={styles.imageContainer}
      onPress={() => {
        openWebBrowserAsync(sponsor.url);
      }}
    >
      <Image
        source={{ uri: sponsor.logo }}
        style={styles.image}
        contentFit="contain"
        accessibilityLabel={sponsor.name}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: theme.space24,
  },
  content: {
    paddingBottom: theme.space16,
    paddingHorizontal: theme.space16,
  },
  image: {
    height: 58,
  },
  imageContainer: {
    backgroundColor: theme.colorWhite,
    borderRadius: theme.borderRadius12,
    padding: theme.space8,
  },
  level: {
    paddingVertical: theme.space16,
  },
  sponsors: {
    gap: theme.space16,
  },
  title: {
    paddingBottom: theme.space16,
    paddingHorizontal: theme.space16,
  },
});
