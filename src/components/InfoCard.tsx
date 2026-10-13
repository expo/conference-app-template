import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StyleSheet } from "react-native";

import { Button } from "./Button";
import { ThemedText, ThemedView, useThemeColor } from "./Themed";
import openWebBrowserAsync from "@/utils/openWebBrowserAsync";
import { theme } from "@/theme";
import type { InfoSection } from "@/config/types";

/** A card on the Info tab, driven by an infoSections entry in the config. */
export function InfoCard({ section }: { section: InfoSection }) {
  const handlePress = () => {
    openWebBrowserAsync(section.url);
  };

  const iconColor = useThemeColor({
    light: theme.color.textSecondary.light,
    dark: theme.colorWhite,
  });

  return (
    <ThemedView style={styles.container} color={theme.color.backgroundElement}>
      {section.icon ? (
        <MaterialIcons
          name={
            section.icon as React.ComponentProps<typeof MaterialIcons>["name"]
          }
          size={theme.fontSize42}
          color={iconColor}
        />
      ) : null}
      {section.title ? (
        <ThemedText
          fontWeight="semiBold"
          fontSize={theme.fontSize14}
          color={{
            light: theme.color.textSecondary.light,
            dark: theme.colorWhite,
          }}
        >
          {section.title}
        </ThemedText>
      ) : null}
      <ThemedText style={styles.text} color={theme.color.textSecondary}>
        {section.description}
      </ThemedText>
      <Button onPress={handlePress} title={section.buttonTitle} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderRadius: theme.borderRadius32,
    gap: theme.space16,
    marginBottom: theme.space16,
    marginHorizontal: theme.space16,
    padding: theme.space24,
  },
  text: {
    marginBottom: theme.space8,
    textAlign: "center",
  },
});
