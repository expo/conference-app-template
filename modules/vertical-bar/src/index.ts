import { Platform } from "react-native";
import { requireOptionalNativeModule } from "expo";

type VerticalBarModule = {
  refreshTabBar(): Promise<void>;
};

const native =
  Platform.OS === "ios"
    ? requireOptionalNativeModule<VerticalBarModule>("VerticalBar")
    : null;

/**
 * Makes the iOS 27.1 vertical bar on foldable iPhones show the tab bar.
 * Call after the tab bar mounts. Does nothing on other devices, on Android,
 * or when the native module is not in the build.
 */
export async function refreshVerticalBarTabs() {
  await native?.refreshTabBar();
}
