/**
 * Central SVG icon registry — every icon glyph the app uses lives here as a
 * small stroke-based (Feather/Lucide-style) vector, all sharing one 24x24
 * grid, stroke width and line caps so they read as a single consistent set.
 *
 * Add a new icon by adding one entry to `ICONS`; `Icon.tsx` picks it up
 * automatically by name — nothing else needs to change.
 */
import React from 'react';
import Svg, {G, Circle, Line, Path, Polygon, Polyline, Rect} from 'react-native-svg';

export interface IconRenderProps {
  size: number;
  color: string;
  strokeWidth: number;
}

export type IconRenderer = (props: IconRenderProps) => React.JSX.Element;

function Frame({size, color, strokeWidth, children}: IconRenderProps & {children: React.ReactNode}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        {children}
      </G>
    </Svg>
  );
}

export const ICONS: Record<string, IconRenderer> = {
  dashboard: p => (
    <Frame {...p}>
      <Rect x={3} y={3} width={7.5} height={7.5} rx={1.5} />
      <Rect x={13.5} y={3} width={7.5} height={7.5} rx={1.5} />
      <Rect x={3} y={13.5} width={7.5} height={7.5} rx={1.5} />
      <Rect x={13.5} y={13.5} width={7.5} height={7.5} rx={1.5} />
    </Frame>
  ),
  students: p => (
    <Frame {...p}>
      <Circle cx={8.5} cy={8} r={3} />
      <Path d="M2.5 20a6 6 0 0 1 12 0" />
      <Circle cx={17} cy={7.5} r={2.3} />
      <Path d="M14.7 12.7a4.8 4.8 0 0 1 5.3 5.3" />
    </Frame>
  ),
  student: p => (
    <Frame {...p}>
      <Path d="M12 4 2 9l10 5 10-5-10-5Z" />
      <Path d="M6 11.5V17c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5" />
      <Path d="M22 9v5" />
    </Frame>
  ),
  teacher: p => (
    <Frame {...p}>
      <Rect x={3} y={4} width={18} height={12} rx={1.5} />
      <Line x1={9} y1={20} x2={15} y2={20} />
      <Line x1={12} y1={16} x2={12} y2={20} />
      <Path d="M7 11.5 10 9l2 2 4-3.5" />
    </Frame>
  ),
  staff: p => (
    <Frame {...p}>
      <Rect x={5} y={3} width={14} height={18} rx={2} />
      <Rect x={9} y={1.2} width={6} height={2.6} rx={1} />
      <Circle cx={12} cy={10.5} r={2.6} />
      <Path d="M8 17c0-2.2 1.8-3.5 4-3.5s4 1.3 4 3.5" />
    </Frame>
  ),
  parent: p => (
    <Frame {...p}>
      <Circle cx={8} cy={8} r={3} />
      <Path d="M3 20c0-3 2.2-5.5 5-5.5s5 2.5 5 5.5" />
      <Circle cx={18} cy={14} r={2} />
      <Path d="M15 20c0-2 1.3-3.5 3-3.5s3 1.5 3 3.5" />
    </Frame>
  ),
  class: p => (
    <Frame {...p}>
      <Path d="M3 21V9l9-5 9 5v12" />
      <Line x1={3} y1={21} x2={21} y2={21} />
      <Rect x={10} y={13} width={4} height={8} />
      <Line x1={7} y1={13} x2={7} y2={16} />
      <Line x1={17} y1={13} x2={17} y2={16} />
    </Frame>
  ),
  fee: p => (
    <Frame {...p}>
      <Path d="M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5V3Z" />
      <Line x1={9} y1={8} x2={15} y2={8} />
      <Line x1={9} y1={12} x2={15} y2={12} />
      <Line x1={9} y1={16} x2={13} y2={16} />
    </Frame>
  ),
  attendance: p => (
    <Frame {...p}>
      <Rect x={3} y={4} width={18} height={17} rx={2} />
      <Line x1={3} y1={9} x2={21} y2={9} />
      <Line x1={8} y1={2} x2={8} y2={6} />
      <Line x1={16} y1={2} x2={16} y2={6} />
      <Path d="M8 14.2 10.3 16.5 16 11" />
    </Frame>
  ),
  exam: p => (
    <Frame {...p}>
      <Rect x={5} y={4} width={14} height={17} rx={2} />
      <Rect x={9} y={2} width={6} height={3.5} rx={1} />
      <Line x1={8} y1={11.5} x2={16} y2={11.5} />
      <Line x1={8} y1={15} x2={16} y2={15} />
      <Line x1={8} y1={18.5} x2={13} y2={18.5} />
    </Frame>
  ),
  homework: p => (
    <Frame {...p}>
      <Path d="M2 5.5c2.5-1.3 5.5-1.3 8 0v13c-2.5-1.3-5.5-1.3-8 0Z" />
      <Path d="M22 5.5c-2.5-1.3-5.5-1.3-8 0v13c2.5-1.3 5.5-1.3 8 0Z" />
    </Frame>
  ),
  timetable: p => (
    <Frame {...p}>
      <Rect x={3} y={4} width={18} height={16} rx={1.5} />
      <Line x1={3} y1={10} x2={21} y2={10} />
      <Line x1={3} y1={15} x2={21} y2={15} />
      <Line x1={9} y1={4} x2={9} y2={20} />
    </Frame>
  ),
  announcement: p => (
    <Frame {...p}>
      <Path d="M3 10v4a1 1 0 0 0 1 1h2l4 4V5L6 9H4a1 1 0 0 0-1 1Z" />
      <Path d="M14 8a4 4 0 0 1 0 8" />
      <Path d="M17 5a8 8 0 0 1 0 14" />
    </Frame>
  ),
  event: p => (
    <Frame {...p}>
      <Rect x={3} y={4} width={18} height={17} rx={2} />
      <Line x1={3} y1={9} x2={21} y2={9} />
      <Line x1={8} y1={2} x2={8} y2={6} />
      <Line x1={16} y1={2} x2={16} y2={6} />
      <Path d="M12 12l1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3 1-2Z" />
    </Frame>
  ),
  transport: p => (
    <Frame {...p}>
      <Rect x={3} y={5} width={18} height={11} rx={2} />
      <Line x1={3} y1={11} x2={21} y2={11} />
      <Line x1={7} y1={5} x2={7} y2={11} />
      <Line x1={17} y1={5} x2={17} y2={11} />
      <Circle cx={7.5} cy={18} r={1.6} />
      <Circle cx={16.5} cy={18} r={1.6} />
    </Frame>
  ),
  library: p => (
    <Frame {...p}>
      <Rect x={4} y={4} width={4} height={16} rx={0.6} />
      <Rect x={10} y={4} width={4} height={16} rx={0.6} />
      <Path d="M16.3 4.8 19.7 6l-2.3 14.9-3.4-1.2Z" />
    </Frame>
  ),
  inventory: p => (
    <Frame {...p}>
      <Path d="M3 8l9-5 9 5-9 5-9-5Z" />
      <Path d="M3 8v9l9 5 9-5V8" />
      <Line x1={12} y1={13} x2={12} y2={22} />
    </Frame>
  ),
  reports: p => (
    <Frame {...p}>
      <Line x1={4} y1={20} x2={20} y2={20} />
      <Rect x={6} y={13} width={3} height={7} />
      <Rect x={10.5} y={9} width={3} height={11} />
      <Rect x={15} y={5} width={3} height={15} />
    </Frame>
  ),
  settings: p => (
    <Frame {...p}>
      <Circle cx={12} cy={12} r={3.2} />
      <Line x1={12} y1={2} x2={12} y2={5} />
      <Line x1={12} y1={19} x2={12} y2={22} />
      <Line x1={2} y1={12} x2={5} y2={12} />
      <Line x1={19} y1={12} x2={22} y2={12} />
      <Line x1={4.9} y1={4.9} x2={7} y2={7} />
      <Line x1={17} y1={17} x2={19.1} y2={19.1} />
      <Line x1={19.1} y1={4.9} x2={17} y2={7} />
      <Line x1={7} y1={17} x2={4.9} y2={19.1} />
    </Frame>
  ),
  chat: p => (
    <Frame {...p}>
      <Path d="M21 11.5a8.4 8.4 0 0 1-8.9 8.4 8.6 8.6 0 0 1-3.8-.9L3 20l1.1-5a8.3 8.3 0 0 1-1-4A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4Z" />
    </Frame>
  ),
  notification: p => (
    <Frame {...p}>
      <Path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
      <Path d="M10 21a2 2 0 0 0 4 0" />
    </Frame>
  ),
  bell: p => (
    <Frame {...p}>
      <Path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
      <Path d="M10 21a2 2 0 0 0 4 0" />
    </Frame>
  ),
  profile: p => (
    <Frame {...p}>
      <Circle cx={12} cy={8.5} r={3.5} />
      <Path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" />
    </Frame>
  ),
  logout: p => (
    <Frame {...p}>
      <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <Path d="M16 17l5-5-5-5" />
      <Line x1={21} y1={12} x2={9} y2={12} />
    </Frame>
  ),
  search: p => (
    <Frame {...p}>
      <Circle cx={11} cy={11} r={7} />
      <Line x1={21} y1={21} x2={16.5} y2={16.5} />
    </Frame>
  ),
  add: p => (
    <Frame {...p}>
      <Line x1={12} y1={4} x2={12} y2={20} />
      <Line x1={4} y1={12} x2={20} y2={12} />
    </Frame>
  ),
  edit: p => (
    <Frame {...p}>
      <Path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
      <Line x1={14} y1={7} x2={17} y2={10} />
    </Frame>
  ),
  delete: p => (
    <Frame {...p}>
      <Line x1={4} y1={7} x2={20} y2={7} />
      <Path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
      <Path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
      <Line x1={10} y1={11} x2={10} y2={17} />
      <Line x1={14} y1={11} x2={14} y2={17} />
    </Frame>
  ),
  close: p => (
    <Frame {...p}>
      <Line x1={5} y1={5} x2={19} y2={19} />
      <Line x1={19} y1={5} x2={5} y2={19} />
    </Frame>
  ),
 back: p => (
  <Frame {...p}>
    <Polygon points="17 5, 8 12, 17 19" />
  </Frame>
),
  forward: p => (
    <Frame {...p}>
      <Polyline points="9 5 16 12 9 19" />
    </Frame>
  ),
  check: p => (
    <Frame {...p}>
      <Polyline points="4 12 9.5 17.5 20 6" />
    </Frame>
  ),
  clock: p => (
    <Frame {...p}>
      <Circle cx={12} cy={12} r={9} />
      <Line x1={12} y1={7} x2={12} y2={12} />
      <Line x1={12} y1={12} x2={16} y2={14} />
    </Frame>
  ),
  calendar: p => (
    <Frame {...p}>
      <Rect x={3} y={4} width={18} height={17} rx={2} />
      <Line x1={3} y1={9} x2={21} y2={9} />
      <Line x1={8} y1={2} x2={8} y2={6} />
      <Line x1={16} y1={2} x2={16} y2={6} />
    </Frame>
  ),
  phone: p => (
    <Frame {...p}>
      <Path d="M6.6 3.5 9.3 9 6.9 11.4a12.4 12.4 0 0 0 5.7 5.7l2.4-2.4 5.5 2.7v3.1a1.7 1.7 0 0 1-1.9 1.7A18 18 0 0 1 3 5.4 1.7 1.7 0 0 1 4.7 3.5Z" />
    </Frame>
  ),
  email: p => (
    <Frame {...p}>
      <Rect x={3} y={5} width={18} height={14} rx={2} />
      <Path d="M3 6.5 12 13l9-6.5" />
    </Frame>
  ),
  lock: p => (
    <Frame {...p}>
      <Rect x={5} y={11} width={14} height={10} rx={2} />
      <Path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </Frame>
  ),
  eye: p => (
    <Frame {...p}>
      <Path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
      <Circle cx={12} cy={12} r={3} />
    </Frame>
  ),
  'eye-off': p => (
    <Frame {...p}>
      <Path d="M3 3l18 18" />
      <Path d="M10.6 5.2A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a17.5 17.5 0 0 1-3.2 4.1M7 7.3A17.6 17.6 0 0 0 2 12s3.6 7 10 7c1.3 0 2.5-.2 3.6-.6" />
      <Path d="M9.5 10.5a3 3 0 0 0 4.2 4.2" />
    </Frame>
  ),
  moon: p => (
    <Frame {...p}>
      <Path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
    </Frame>
  ),
  sun: p => (
    <Frame {...p}>
      <Circle cx={12} cy={12} r={4.5} />
      <Line x1={12} y1={1.5} x2={12} y2={4} />
      <Line x1={12} y1={20} x2={12} y2={22.5} />
      <Line x1={1.5} y1={12} x2={4} y2={12} />
      <Line x1={20} y1={12} x2={22.5} y2={12} />
      <Line x1={4.6} y1={4.6} x2={6.3} y2={6.3} />
      <Line x1={17.7} y1={17.7} x2={19.4} y2={19.4} />
      <Line x1={19.4} y1={4.6} x2={17.7} y2={6.3} />
      <Line x1={6.3} y1={17.7} x2={4.6} y2={19.4} />
    </Frame>
  ),
  theme: p => (
    <Frame {...p}>
      <Path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.9 1.8-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.7-1.6 1.6-1.6H16a4 4 0 0 0 4-4c0-4.4-3.6-8.2-8-8.2Z" />
      <Circle cx={7.5} cy={10.5} r={1} fill={p.color} stroke="none" />
      <Circle cx={10.5} cy={7} r={1} fill={p.color} stroke="none" />
      <Circle cx={15} cy={7.5} r={1} fill={p.color} stroke="none" />
    </Frame>
  ),
  present: p => (
    <Frame {...p}>
      <Circle cx={12} cy={12} r={9} />
      <Polyline points="8 12.5 11 15.5 16 9" />
    </Frame>
  ),
  absent: p => (
    <Frame {...p}>
      <Circle cx={12} cy={12} r={9} />
      <Line x1={9} y1={9} x2={15} y2={15} />
      <Line x1={15} y1={9} x2={9} y2={15} />
    </Frame>
  ),
  late: p => (
    <Frame {...p}>
      <Line x1={6} y1={3} x2={18} y2={3} />
      <Line x1={6} y1={21} x2={18} y2={21} />
      <Path d="M7 3c0 4 3 5 5 6-2 1-5 2-5 6M17 3c0 4-3 5-5 6 2 1 5 2 5 6" />
    </Frame>
  ),
  money: p => (
    <Frame {...p}>
      <Rect x={2.5} y={6} width={19} height={12} rx={1.5} />
      <Circle cx={12} cy={12} r={3} />
      <Line x1={5.5} y1={9} x2={5.5} y2={9} />
      <Line x1={18.5} y1={15} x2={18.5} y2={15} />
    </Frame>
  ),
  card: p => (
    <Frame {...p}>
      <Rect x={2.5} y={5} width={19} height={14} rx={2} />
      <Line x1={2.5} y1={10} x2={21.5} y2={10} />
      <Line x1={6} y1={15} x2={10} y2={15} />
    </Frame>
  ),
  bus: p => (
    <Frame {...p}>
      <Rect x={3} y={5} width={18} height={11} rx={2} />
      <Line x1={3} y1={11} x2={21} y2={11} />
      <Line x1={7} y1={5} x2={7} y2={11} />
      <Line x1={17} y1={5} x2={17} y2={11} />
      <Circle cx={7.5} cy={18} r={1.6} />
      <Circle cx={16.5} cy={18} r={1.6} />
    </Frame>
  ),
  book: p => (
    <Frame {...p}>
      <Path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <Line x1={8} y1={3} x2={8} y2={21} />
    </Frame>
  ),
  warning: p => (
    <Frame {...p}>
      <Path d="M12 3.5 22 20H2Z" />
      <Line x1={12} y1={10} x2={12} y2={14.5} />
      <Line x1={12} y1={17.3} x2={12} y2={17.3} />
    </Frame>
  ),
  info: p => (
    <Frame {...p}>
      <Circle cx={12} cy={12} r={9} />
      <Line x1={12} y1={11} x2={12} y2={16} />
      <Line x1={12} y1={7.5} x2={12} y2={7.5} />
    </Frame>
  ),
  success: p => (
    <Frame {...p}>
      <Circle cx={12} cy={12} r={9} />
      <Polyline points="8 12.5 11 15.5 16 9" />
    </Frame>
  ),
  error: p => (
    <Frame {...p}>
      <Path d="M8 2h8l6 6v8l-6 6H8l-6-6V8Z" />
      <Line x1={9} y1={9} x2={15} y2={15} />
      <Line x1={15} y1={9} x2={9} y2={15} />
    </Frame>
  ),
  empty: p => (
    <Frame {...p}>
      <Path d="M4 12h4l2 3h4l2-3h4" />
      <Path d="M6 4h12l2 8v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6Z" />
    </Frame>
  ),
  home: p => (
    <Frame {...p}>
      <Path d="M4 11 12 4l8 7" />
      <Path d="M6 9.5V20a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9.5" />
      <Rect x={10} y={14} width={4} height={7} />
    </Frame>
  ),
  filter: p => (
    <Frame {...p}>
      <Path d="M4 5h16l-6 8v6l-4 2v-8Z" />
    </Frame>
  ),
  download: p => (
    <Frame {...p}>
      <Line x1={12} y1={3} x2={12} y2={15} />
      <Polyline points="7 11 12 16 17 11" />
      <Line x1={4} y1={20} x2={20} y2={20} />
    </Frame>
  ),
  upload: p => (
    <Frame {...p}>
      <Line x1={12} y1={21} x2={12} y2={9} />
      <Polyline points="7 13 12 8 17 13" />
      <Line x1={4} y1={20} x2={20} y2={20} />
    </Frame>
  ),
  star: p => (
    <Frame {...p}>
      <Polygon points="12 2.5 15 9.2 22 10 16.8 14.8 18.2 21.5 12 18 5.8 21.5 7.2 14.8 2 10 9 9.2" />
    </Frame>
  ),
  performance: p => (
    <Frame {...p}>
      <Polyline points="3 17 9 11 13 15 21 6" />
      <Polyline points="15 6 21 6 21 12" />
    </Frame>
  ),
  grade: p => (
    <Frame {...p}>
      <Circle cx={12} cy={12} r={8.5} />
      <Circle cx={12} cy={12} r={5} />
      <Circle cx={12} cy={12} r={1.5} fill={p.color} stroke="none" />
    </Frame>
  ),
  globe: p => (
    <Frame {...p}>
      <Circle cx={12} cy={12} r={9} />
      <Line x1={3} y1={12} x2={21} y2={12} />
      <Path d="M12 3c2.5 2.5 4 5.8 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.8-4-9s1.5-6.5 4-9Z" />
    </Frame>
  ),
};
