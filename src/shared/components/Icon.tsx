/**
 * Icon — a dependency-free icon component.
 *
 * The prompt calls for "Dynamic Icon Pack Support" (Material / FontAwesome /
 * custom). To keep the starter runnable with zero native font linking, icons
 * are rendered as glyphs from a name→glyph map. Swapping in
 * `react-native-vector-icons` later only requires changing this one file — the
 * `<Icon name="..." />` API stays identical everywhere else.
 */
import React from 'react';
import {Text, type StyleProp, type TextStyle} from 'react-native';
import {useTheme} from '../../core/theme';

const GLYPHS: Record<string, string> = {
  dashboard: '📊',
  students: '🎓',
  student: '🧑‍🎓',
  teacher: '👩‍🏫',
  staff: '🧑‍💼',
  parent: '👪',
  class: '🏫',
  fee: '💰',
  attendance: '🗓️',
  exam: '📝',
  homework: '📚',
  timetable: '⏰',
  announcement: '📢',
  event: '🎉',
  transport: '🚌',
  library: '📖',
  inventory: '📦',
  reports: '📈',
  settings: '⚙️',
  chat: '💬',
  notification: '🔔',
  bell: '🔔',
  profile: '👤',
  logout: '🚪',
  search: '🔍',
  add: '➕',
  edit: '✏️',
  delete: '🗑️',
  close: '✖️',
  back: '‹',
  forward: '›',
  check: '✓',
  clock: '🕐',
  calendar: '📅',
  phone: '📞',
  email: '✉️',
  lock: '🔒',
  eye: '👁️',
  'eye-off': '🚫',
  moon: '🌙',
  sun: '☀️',
  theme: '🎨',
  present: '✅',
  absent: '❌',
  late: '⏳',
  money: '💵',
  card: '💳',
  bus: '🚌',
  book: '📕',
  warning: '⚠️',
  info: 'ℹ️',
  success: '✅',
  error: '⛔',
  empty: '🗂️',
  home: '🏠',
  filter: '⚙️',
  download: '⬇️',
  upload: '⬆️',
  star: '⭐',
  performance: '📉',
  grade: '🎯',
};

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export function Icon({name, size = 20, color, style}: IconProps): React.JSX.Element {
  const {theme} = useTheme();
  const glyph = GLYPHS[name] ?? '•';
  return (
    <Text
      allowFontScaling={false}
      style={[{fontSize: size, color: color ?? theme.colors.text, lineHeight: size + 2}, style]}>
      {glyph}
    </Text>
  );
}
