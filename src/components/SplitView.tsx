import React, { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { useThemeColor } from "@/components/Themed";
import { useLayout } from "@/hooks/useLayout";
import { theme } from "@/theme";

type Props = {
  list: ReactNode;
  detail: ReactNode;
};

/** A list and a detail pane side by side, for wide windows. */
export function SplitView({ list, detail }: Props) {
  const backgroundColor = useThemeColor(theme.color.background);
  const { horizontalInsets } = useLayout();

  return (
    <View style={[styles.split, { backgroundColor }, horizontalInsets]}>
      <View style={styles.listColumn}>{list}</View>
      <View style={styles.detailColumn}>{detail}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  detailColumn: {
    flex: 6,
    paddingRight: theme.space16,
  },
  listColumn: {
    flex: 5,
  },
  split: {
    flex: 1,
    flexDirection: "row",
  },
});
