import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image } from "expo-image";
import { StyleSheet, View, ViewStyle } from "react-native";
import { useState } from "react";

import { theme } from "@/theme";
import { ThemedView, useThemeColor } from "./Themed";

export function SpeakerImage({
  profilePicture,
  size,
  style,
  animated,
}: {
  profilePicture?: string | null;
  size?: "small" | "medium" | "large" | "xlarge";
  style?: ViewStyle;
  animated?: boolean;
}) {
  const borderColor = useThemeColor(theme.color.border);
  const [isLoading, setIsLoading] = useState(false);
  const imageSize = (() => {
    switch (size) {
      case "small":
        return styles.imageSizeSmall;
      case "large":
        return styles.imageSizeLarge;
      case "xlarge":
        return styles.imageSizeExtraLarge;
      case "medium":
      default:
        return styles.imageSizeMedium;
    }
  })();
  const imageStyles = [styles.profileImage, imageSize];

  const fallbackIconSize = (() => {
    switch (size) {
      case "large":
        return 50;
      case "xlarge":
        return 100;
      case "medium":
      default:
        return 30;
    }
  })();

  const placeholder = (
    <View style={[imageStyles, styles.fallbackImage]}>
      <MaterialCommunityIcons
        name="account"
        size={fallbackIconSize}
        color={theme.colorWhite}
      />
    </View>
  );

  return (
    <ThemedView
      lightColor="rgba(255,255,255,0.15)"
      darkColor="rgba(0,0,0,0.15)"
      style={[imageSize, styles.imageContainer, style, { borderColor }]}
    >
      {profilePicture ? (
        <Image
          source={{ uri: profilePicture }}
          style={imageStyles}
          transition={animated && isLoading ? 300 : 0}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
        />
      ) : (
        placeholder
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fallbackImage: {
    alignItems: "center",
    backgroundColor: theme.color.tint.dark,
    justifyContent: "center",
  },
  imageContainer: {
    borderRadius: 100,
    borderWidth: 1,
    marginRight: theme.space12,
    overflow: "hidden",
  },
  imageSizeExtraLarge: {
    height: 200,
    width: 200,
  },
  imageSizeLarge: {
    height: 96,
    width: 96,
  },
  imageSizeMedium: {
    height: 60,
    width: 60,
  },
  imageSizeSmall: {
    height: 42,
    width: 42,
  },
  profileImage: {
    height: 70,
    width: 50,
    ...StyleSheet.absoluteFill,
  },
});
