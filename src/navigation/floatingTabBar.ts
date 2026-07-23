/**
 * Floating, fully-rounded bottom tab bar shape — shared across every role's tab
 * navigator (Admin/Teacher/Parent) so the capsule look and its spacing/shadow
 * math live in exactly one place. Kept as a plain function (not a hook) since
 * it just builds a style object from values the caller already has.
 */
import type {EdgeInsets} from 'react-native-safe-area-context';
import type {Theme} from '../core/theme';

export function floatingTabBarStyle(theme: Theme, insets: EdgeInsets) {
  return {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 0,
    marginHorizontal: theme.spacing.md,
    marginBottom: Math.max(insets.bottom, theme.spacing.md),
    borderRadius: theme.radius.pill,
    height: theme.components.tab.height,
    paddingBottom: 6,
    paddingTop: 6,
    shadowColor: theme.colors.shadow,
    shadowOpacity: theme.dark ? 0.5 : 0.22,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: 10},
    elevation: 20,
  };
}
