import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Window width, in points, from which screens switch to wide layouts. */
export const WIDE_LAYOUT_MIN_WIDTH = 700;

/** Comfortable maximum width for single-column reading content. */
export const READABLE_MAX_WIDTH = 720;

/**
 * Layout facts for the current window, not the device.
 *
 * The window is what matters: an unfolded iPhone Duo, an iPad, and an iPad
 * in split view can all be wide or narrow. `horizontalInsets` holds the
 * leading and trailing safe area, which includes the iOS 27.1 vertical bar
 * on foldable iPhones. Scroll views do not apply it on their own, so lists
 * must pad their content with it.
 */
export function useLayout() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return {
    width,
    height,
    isWide: width >= WIDE_LAYOUT_MIN_WIDTH,
    horizontalInsets: {
      paddingLeft: insets.left,
      paddingRight: insets.right,
    },
  };
}
