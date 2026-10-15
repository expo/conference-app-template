import ExpoModulesCore
import UIKit

// iOS 27.1 shows the tab bar in a system "vertical bar" on foldable iPhones.
// When React Native mounts the tab bar controller after launch, the vertical
// bar stays empty until the scene is reactivated, so the app has no tabs.
// Hiding and showing the tab bar again makes the system attach it.
public class VerticalBarModule: Module {
  public func definition() -> ModuleDefinition {
    Name("VerticalBar")

    AsyncFunction("refreshTabBar") {
      guard #available(iOS 18.0, *) else { return }
      for scene in UIApplication.shared.connectedScenes {
        guard let windowScene = scene as? UIWindowScene else { continue }
        for window in windowScene.windows {
          guard Self.hasVerticalBar(window), let root = window.rootViewController else { continue }
          Self.visit(root) { controller in
            guard let tabBarController = controller as? UITabBarController,
                  tabBarController.tabBar.window != nil,
                  !tabBarController.isTabBarHidden else { return }
            tabBarController.setTabBarHidden(true, animated: false)
            tabBarController.setTabBarHidden(false, animated: false)
          }
        }
      }
    }.runOnQueue(.main)
  }

  // `verticalBarEdge` is iOS 27.1 API. Read it through key-value coding so
  // the module also compiles with older SDKs, where it reports no bar.
  private static func hasVerticalBar(_ window: UIWindow) -> Bool {
    let traits = window.traitCollection
    guard traits.responds(to: NSSelectorFromString("verticalBarEdge")) else { return false }
    let edge = traits.value(forKey: "verticalBarEdge") as? Int ?? 0
    return edge != 0
  }

  private static func visit(_ controller: UIViewController, _ body: (UIViewController) -> Void) {
    body(controller)
    controller.children.forEach { visit($0, body) }
    if let presented = controller.presentedViewController {
      visit(presented, body)
    }
  }
}
