import { theme } from "@/theme";
import { StyleSheet, View } from "react-native";
import { Host, Picker } from "@expo/ui/swift-ui";
import { GlassView } from "expo-glass-effect";

interface DayPickerProps {
  options: string[];
  selectedIndex: number;
  onSelectDay: (dayIndex: number) => void;
}

export function DayPicker({
  options,
  selectedIndex,
  onSelectDay,
}: DayPickerProps) {
  if (options.length < 2) {
    return null;
  }

  return (
    <View style={{ paddingBottom: theme.space24 }}>
      <GlassView style={styles.glassView}>
        <Host matchContents style={styles.dayPicker}>
          <Picker
            options={options}
            selectedIndex={selectedIndex}
            onOptionSelected={({ nativeEvent: { index } }) => {
              onSelectDay(index);
            }}
            variant="segmented"
          />
        </Host>
      </GlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  dayPicker: {
    height: 31, // fixed height to prevent jumping
  },
  glassView: {
    borderRadius: theme.borderRadius80,
    height: 32,
    marginHorizontal: theme.space16,
    marginTop: theme.space16,
    width: "auto",
  },
});
