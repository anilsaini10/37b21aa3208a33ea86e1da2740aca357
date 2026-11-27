// School SaaS Icon Library
// Save this file as: src/components/SchoolSaaSIcons.tsx
// Install dependency: npm install react-native-svg
// Usage:
// import { EditIcon, VanIcon, PhoneIcon } from "./components/SchoolSaaSIcons";
// <EditIcon size={28} />
//
// All icons accept: size?: number, color?: string
// Named exports are provided for easy imports.

import React from "react";
import Svg, {
  Path, Rect, Circle, Ellipse, Line, Polygon, Polyline, G, Defs, LinearGradient, Stop
} from "react-native-svg";

type IconProps = { size?: number; color?: string };

const Base = ({ size = 28, children }: { size?: number; children: React.ReactNode }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    {children}
  </Svg>
);

// --- COMMON / ACTION ICONS ---
// AI ICON NAME: EditIcon — Edit / Pencil icon for editing a record, profile, student, or form.
export const EditIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Path d="M12 43.5 42.8 12.7a5 5 0 0 1 7.1 0l1.4 1.4a5 5 0 0 1 0 7.1L20.5 52H12z" fill="#F5B942" stroke="#A66A16" strokeWidth="2.5" strokeLinejoin="round"/>
  <Path d="m39 16 9 9M12 43.5l9 8.5" stroke="#FFF4D6" strokeWidth="3" strokeLinecap="round"/>
  <Path d="M10 55h44" stroke="#64748B" strokeWidth="3" strokeLinecap="round"/>
</Base>;

// AI ICON NAME: DeleteIcon — Delete / Trash icon for removing a record.
export const DeleteIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Path d="M16 19h32l-2.5 35h-27z" fill="#F87171" stroke="#B91C1C" strokeWidth="2.5" strokeLinejoin="round"/>
  <Path d="M12 15h40M24 15v-5h16v5" stroke="#991B1B" strokeWidth="3" strokeLinecap="round"/>
  <Path d="M26 26v19M38 26v19" stroke="#FFF" strokeWidth="3" strokeLinecap="round"/>
</Base>;

// AI ICON NAME: AddIcon — Add / Plus icon for creating a new item.
export const AddIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Circle cx="32" cy="32" r="23" fill="#34D399" stroke="#059669" strokeWidth="3"/>
  <Path d="M32 19v26M19 32h26" stroke="#fff" strokeWidth="5" strokeLinecap="round"/>
</Base>;

// AI ICON NAME: SearchIcon — Search icon for search fields and lookup actions.
export const SearchIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Circle cx="27" cy="27" r="15" fill="#93C5FD" stroke="#2563EB" strokeWidth="4"/>
  <Path d="m38 38 14 14" stroke="#1D4ED8" strokeWidth="6" strokeLinecap="round"/>
  <Circle cx="22" cy="22" r="5" fill="#DBEAFE"/>
</Base>;

// AI ICON NAME: FilterIcon — Filter icon for filtering lists and records.
export const FilterIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Path d="M9 13h46L38 31v16l-12 6V31z" fill="#A78BFA" stroke="#6D28D9" strokeWidth="3" strokeLinejoin="round"/>
  <Path d="M15 18h34" stroke="#EDE9FE" strokeWidth="3" strokeLinecap="round"/>
</Base>;

// AI ICON NAME: CloseIcon — Close / Cancel icon for closing dialogs or dismissing panels.
export const CloseIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Circle cx="32" cy="32" r="23" fill="#FCA5A5" stroke="#DC2626" strokeWidth="3"/>
  <Path d="m23 23 18 18m0-18L23 41" stroke="#fff" strokeWidth="5" strokeLinecap="round"/>
</Base>;

// AI ICON NAME: CheckIcon — Check / Success icon for completed or approved actions.
export const CheckIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Circle cx="32" cy="32" r="23" fill="#6EE7B7" stroke="#059669" strokeWidth="3"/>
  <Path d="m19 32 9 9 18-20" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
</Base>;

// AI ICON NAME: DownloadIcon — Download icon for downloading a file or report.
export const DownloadIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Path d="M32 9v30m-12-12 12 12 12-12" stroke="#2563EB" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
  <Path d="M12 43v9h40v-9" stroke="#1D4ED8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  <Path d="M18 48h28" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round"/>
</Base>;

// AI ICON NAME: UploadIcon — Upload icon for uploading a file or document.
export const UploadIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Path d="M32 49V19m-12 12 12-12 12 12" stroke="#059669" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
  <Path d="M12 43v9h40v-9" stroke="#047857" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  <Path d="M18 48h28" stroke="#A7F3D0" strokeWidth="3" strokeLinecap="round"/>
</Base>;

// AI ICON NAME: PrintIcon — Print icon for printing a page, receipt, or report.
export const PrintIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Rect x="17" y="8" width="30" height="17" rx="3" fill="#BFDBFE" stroke="#2563EB" strokeWidth="2.5"/>
  <Rect x="11" y="24" width="42" height="22" rx="5" fill="#60A5FA" stroke="#1D4ED8" strokeWidth="2.5"/>
  <Rect x="18" y="37" width="28" height="17" rx="2" fill="#fff" stroke="#2563EB" strokeWidth="2.5"/>
  <Circle cx="45" cy="31" r="2.5" fill="#DBEAFE"/>
</Base>;

// --- CONTACT / ADDRESS ICONS ---
// AI ICON NAME: PhoneIcon — Phone / Telephone icon for a contact phone number or call action.
export const PhoneIcon = ({ size = 28, color = "#16A34A" }: IconProps) => <Base size={size}>
  <Path d="M18 10 27 8l6 13-6 5c3 6 6 9 12 12l5-6 13 6-2 9c-1 4-5 6-9 5C26 47 15 36 10 18c-1-4 1-7 5-8z" fill={color} stroke="#166534" strokeWidth="2.5" strokeLinejoin="round"/>
  <Path d="M20 14c2 4 4 7 7 10" stroke="#BBF7D0" strokeWidth="3" strokeLinecap="round"/>
</Base>;

// AI ICON NAME: MobileIcon — Mobile phone icon for a mobile number or device.
export const MobileIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Rect x="18" y="5" width="28" height="54" rx="6" fill="#64748B" stroke="#334155" strokeWidth="3"/>
  <Rect x="22" y="12" width="20" height="37" rx="2" fill="#BFDBFE"/>
  <Circle cx="32" cy="54" r="2" fill="#E2E8F0"/>
  <Path d="M27 17h10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
</Base>;

// AI ICON NAME: EmailIcon — Email / Envelope icon for an email address or email action.
export const EmailIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Rect x="7" y="14" width="50" height="36" rx="5" fill="#FDE68A" stroke="#D97706" strokeWidth="3"/>
  <Path d="m9 18 23 18 23-18" stroke="#B45309" strokeWidth="3.5" strokeLinejoin="round"/>
  <Path d="m10 47 15-13m29 13L39 34" stroke="#F59E0B" strokeWidth="2.5"/>
</Base>;

// AI ICON NAME: LocationIcon — Location pin icon for a map location or GPS position.
export const LocationIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Path d="M32 57S12 36 12 24a20 20 0 1 1 40 0C52 36 32 57 32 57z" fill="#F87171" stroke="#B91C1C" strokeWidth="3"/>
  <Circle cx="32" cy="24" r="7" fill="#FFF" stroke="#B91C1C" strokeWidth="2.5"/>
  <Path d="M23 11c4-4 10-5 15-3" stroke="#FECACA" strokeWidth="3" strokeLinecap="round"/>
</Base>;

// AI ICON NAME: AddressIcon — House / Address icon for a home or postal address.
export const AddressIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Path d="M10 27 32 9l22 18v27H10z" fill="#FDBA74" stroke="#C2410C" strokeWidth="3" strokeLinejoin="round"/>
  <Rect x="25" y="36" width="14" height="18" rx="2" fill="#FFF7ED" stroke="#C2410C" strokeWidth="2"/>
  <Path d="M17 29h8v8h-8zM39 29h8v8h-8z" fill="#FFEDD5" stroke="#C2410C" strokeWidth="2"/>
</Base>;

// AI ICON NAME: MapIcon — Map icon for maps, directions, and location details.
export const MapIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Path d="m7 15 16-7 18 7 16-7v41l-16 7-18-7-16 7z" fill="#86EFAC" stroke="#15803D" strokeWidth="2.5" strokeLinejoin="round"/>
  <Path d="M23 8v41M41 15v41" stroke="#15803D" strokeWidth="2.5"/>
  <Path d="M32 18c-6 0-10 4-10 10 0 8 10 17 10 17s10-9 10-17c0-6-4-10-10-10z" fill="#F87171" stroke="#B91C1C" strokeWidth="2"/>
  <Circle cx="32" cy="28" r="3.5" fill="#fff"/>
</Base>;

// --- PEOPLE / FAMILY ICONS ---
// AI ICON NAME: ParentIcon — Parent icon for one parent or guardian profile.
export const ParentIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Circle cx="23" cy="19" r="9" fill="#F9A8D4" stroke="#BE185D" strokeWidth="2.5"/>
  <Circle cx="43" cy="22" r="8" fill="#FCD34D" stroke="#B45309" strokeWidth="2.5"/>
  <Path d="M7 53c0-12 6-20 16-20s16 8 16 20z" fill="#A78BFA" stroke="#6D28D9" strokeWidth="2.5"/>
  <Path d="M33 53c0-10 4-17 11-17s12 7 12 17z" fill="#60A5FA" stroke="#1D4ED8" strokeWidth="2.5"/>
</Base>;

// AI ICON NAME: ChildIcon — Child icon for a child profile.
export const ChildIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Circle cx="32" cy="20" r="11" fill="#FCD34D" stroke="#B45309" strokeWidth="2.5"/>
  <Path d="M12 56c0-15 7-24 20-24s20 9 20 24z" fill="#38BDF8" stroke="#0369A1" strokeWidth="2.5"/>
  <Path d="M26 21h1m10 0h1" stroke="#78350F" strokeWidth="3" strokeLinecap="round"/>
  <Path d="M27 27q5 5 10 0" stroke="#92400E" strokeWidth="2" fill="none" strokeLinecap="round"/>
</Base>;

// AI ICON NAME: FamilyIcon — Family icon for parent-and-child or family information.
export const FamilyIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Circle cx="20" cy="20" r="8" fill="#F9A8D4" stroke="#BE185D" strokeWidth="2"/>
  <Circle cx="44" cy="20" r="8" fill="#93C5FD" stroke="#1D4ED8" strokeWidth="2"/>
  <Circle cx="32" cy="33" r="7" fill="#FCD34D" stroke="#B45309" strokeWidth="2"/>
  <Path d="M5 53c0-10 5-17 15-17 4 0 7 2 9 5M59 53c0-10-5-17-15-17-4 0-7 2-9 5M17 58c0-10 5-16 15-16s15 6 15 16" fill="#A78BFA" stroke="#6D28D9" strokeWidth="2.5" strokeLinejoin="round"/>
</Base>;

// AI ICON NAME: StudentIcon — Student icon for a student profile or student module.
export const StudentIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Circle cx="32" cy="23" r="10" fill="#FCD34D" stroke="#B45309" strokeWidth="2.5"/>
  <Path d="M13 56c0-13 7-22 19-22s19 9 19 22z" fill="#60A5FA" stroke="#1D4ED8" strokeWidth="2.5"/>
  <Path d="m14 16 18-9 18 9-18 9z" fill="#334155" stroke="#0F172A" strokeWidth="2"/>
  <Path d="M49 17v12" stroke="#F59E0B" strokeWidth="2.5"/>
</Base>;

// AI ICON NAME: TeacherIcon — Teacher icon for a teacher profile or staff module.
export const TeacherIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Circle cx="32" cy="18" r="10" fill="#FDBA74" stroke="#C2410C" strokeWidth="2.5"/>
  <Path d="M13 56c0-14 7-24 19-24s19 10 19 24z" fill="#A78BFA" stroke="#6D28D9" strokeWidth="2.5"/>
  <Path d="M23 10q9-10 18 0" stroke="#78350F" strokeWidth="4" strokeLinecap="round"/>
  <Rect x="39" y="34" width="15" height="19" rx="2" fill="#FDE68A" stroke="#B45309" strokeWidth="2"/>
  <Path d="M43 40h7m-7 5h7" stroke="#B45309" strokeWidth="1.8"/>
</Base>;

// AI ICON NAME: AdminIcon — Administrator icon for school admin or management profile.
export const AdminIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Circle cx="32" cy="18" r="10" fill="#FCA5A5" stroke="#B91C1C" strokeWidth="2.5"/>
  <Path d="M12 56c0-14 7-24 20-24s20 10 20 24z" fill="#64748B" stroke="#334155" strokeWidth="2.5"/>
  <Path d="M23 10q9-9 18 0" stroke="#334155" strokeWidth="4" strokeLinecap="round"/>
  <Circle cx="48" cy="44" r="8" fill="#FBBF24" stroke="#B45309" strokeWidth="2"/>
  <Path d="m45 44 2 2 4-5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
</Base>;

// --- SCHOOL / LEARNING ICONS ---
// AI ICON NAME: BookIcon — Open book icon for books, subjects, and learning resources.
export const BookIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Path d="M8 13q13-5 24 3v38q-11-8-24-3z" fill="#60A5FA" stroke="#1D4ED8" strokeWidth="2.5" strokeLinejoin="round"/>
  <Path d="M56 13q-13-5-24 3v38q11-8 24-3z" fill="#F9A8D4" stroke="#BE185D" strokeWidth="2.5" strokeLinejoin="round"/>
  <Path d="M14 22q8-2 13 2m-13 5q8-2 13 2m12-7q6-4 13-2m-13 9q6-4 13-2" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
</Base>;

// AI ICON NAME: PencilIcon — Pencil icon for edit actions, notes, or writing.
export const PencilIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Path d="m13 44 29-31 10 10-29 31-13 3z" fill="#FBBF24" stroke="#B45309" strokeWidth="2.5" strokeLinejoin="round"/>
  <Path d="m42 13 10 10M13 44l10 10" stroke="#FFF7ED" strokeWidth="3"/>
  <Path d="m13 44-3 13 13-3" fill="#FDBA74" stroke="#9A3412" strokeWidth="2"/>
</Base>;

// AI ICON NAME: BlackboardIcon — Blackboard icon for classroom teaching and lessons.
export const BlackboardIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Rect x="7" y="8" width="50" height="39" rx="3" fill="#1F2937" stroke="#92400E" strokeWidth="4"/>
  <Path d="M18 20h20m-20 8 8 7 10-11" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  <Path d="M16 53h32M23 47v6m18-6v6" stroke="#B45309" strokeWidth="3" strokeLinecap="round"/>
</Base>;

// AI ICON NAME: GraduationIcon — Graduation cap icon for education, courses, or academic achievement.
export const GraduationIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Path d="m5 23 27-14 27 14-27 14z" fill="#334155" stroke="#0F172A" strokeWidth="2.5" strokeLinejoin="round"/>
  <Path d="M17 30v13q15 12 30 0V30" fill="#64748B" stroke="#334155" strokeWidth="2.5"/>
  <Path d="M58 24v18" stroke="#F59E0B" strokeWidth="3"/>
  <Circle cx="58" cy="44" r="3" fill="#FBBF24"/>
</Base>;

// AI ICON NAME: AttendanceIcon — Attendance calendar/check icon for student or staff attendance.
export const AttendanceIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Rect x="10" y="12" width="44" height="43" rx="5" fill="#BFDBFE" stroke="#2563EB" strokeWidth="3"/>
  <Path d="M20 8v10m24-10v10" stroke="#1D4ED8" strokeWidth="4" strokeLinecap="round"/>
  <Path d="m20 34 7 7 17-17" stroke="#059669" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
</Base>;

// AI ICON NAME: ExamIcon — Exam paper icon for tests, examinations, and marks.
export const ExamIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Rect x="13" y="7" width="38" height="50" rx="4" fill="#FDE68A" stroke="#D97706" strokeWidth="2.5"/>
  <Path d="M22 19h20m-20 9h12m-12 9h20" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round"/>
  <Path d="m34 45 4 4 9-10" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
</Base>;

// AI ICON NAME: HomeworkIcon — Homework document icon for assignments and homework.
export const HomeworkIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Path d="M15 8h27l8 8v40H15z" fill="#DDD6FE" stroke="#7C3AED" strokeWidth="2.5" strokeLinejoin="round"/>
  <Path d="M42 8v10h9M22 28h20m-20 8h20m-20 8h12" stroke="#6D28D9" strokeWidth="2.5" strokeLinecap="round"/>
  <Path d="m10 17 6-6" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round"/>
</Base>;

// AI ICON NAME: LibraryIcon — Bookshelf icon for the school library and book collection.
export const LibraryIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Rect x="9" y="13" width="11" height="39" rx="2" fill="#F87171" stroke="#B91C1C" strokeWidth="2"/>
  <Rect x="22" y="8" width="12" height="44" rx="2" fill="#60A5FA" stroke="#1D4ED8" strokeWidth="2"/>
  <Rect x="36" y="16" width="18" height="36" rx="2" fill="#34D399" stroke="#047857" strokeWidth="2"/>
  <Path d="M12 21h5m8-5h5m-5 7h5m9 0h12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
</Base>;

// AI ICON NAME: TimetableIcon — Timetable icon for class schedules and periods.
export const TimetableIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Rect x="8" y="10" width="48" height="45" rx="4" fill="#E0E7FF" stroke="#4F46E5" strokeWidth="2.5"/>
  <Path d="M8 23h48M24 23v32M40 23v32M8 39h48" stroke="#6366F1" strokeWidth="2"/>
  <Path d="M18 6v9m28-9v9" stroke="#4338CA" strokeWidth="3" strokeLinecap="round"/>
  <Rect x="28" y="28" width="9" height="7" rx="1" fill="#FBBF24"/>
  <Rect x="12" y="43" width="8" height="8" rx="1" fill="#34D399"/>
</Base>;

// AI ICON NAME: FeesIcon — Fee payment / Currency icon for school fees and dues.
export const FeesIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Circle cx="32" cy="32" r="24" fill="#FDE68A" stroke="#D97706" strokeWidth="3"/>
  <Path d="M39 20c-3-4-14-4-16 2-3 8 17 5 17 14 0 8-12 11-19 5m11-26v34" stroke="#92400E" strokeWidth="3.5" strokeLinecap="round"/>
</Base>;

// AI ICON NAME: ReportIcon — Report chart icon for analytics, marksheets, and reports.
export const ReportIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Rect x="10" y="8" width="44" height="48" rx="4" fill="#DBEAFE" stroke="#2563EB" strokeWidth="2.5"/>
  <Path d="M19 45V34h7v11m6 0V24h7v21m6 0V29h7v16" fill="#60A5FA" stroke="#1D4ED8" strokeWidth="2"/>
  <Path d="M18 17h28" stroke="#1D4ED8" strokeWidth="2.5" strokeLinecap="round"/>
</Base>;

// --- TRANSPORT / OPERATIONS ---
// AI ICON NAME: VanIcon — School van icon for school transport and vehicle records.
export const VanIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Path d="M6 19h33v27H6z" fill="#FBBF24" stroke="#B45309" strokeWidth="2.5" strokeLinejoin="round"/>
  <Path d="M39 28h10l9 10v8H39z" fill="#60A5FA" stroke="#1D4ED8" strokeWidth="2.5" strokeLinejoin="round"/>
  <Path d="M43 31h5l6 7H43z" fill="#DBEAFE"/>
  <Circle cx="18" cy="48" r="6" fill="#334155" stroke="#0F172A" strokeWidth="2"/>
  <Circle cx="48" cy="48" r="6" fill="#334155" stroke="#0F172A" strokeWidth="2"/>
  <Circle cx="18" cy="48" r="2" fill="#CBD5E1"/><Circle cx="48" cy="48" r="2" fill="#CBD5E1"/>
  <Path d="M12 26h20" stroke="#FFF7ED" strokeWidth="3" strokeLinecap="round"/>
</Base>;

// AI ICON NAME: BusIcon — School bus icon for transport and bus details.
export const BusIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Rect x="8" y="9" width="48" height="43" rx="8" fill="#FBBF24" stroke="#B45309" strokeWidth="3"/>
  <Path d="M13 16h38v16H13z" fill="#BFDBFE" stroke="#1D4ED8" strokeWidth="2"/>
  <Path d="M13 37h38" stroke="#B45309" strokeWidth="3"/>
  <Circle cx="19" cy="51" r="5" fill="#334155"/><Circle cx="45" cy="51" r="5" fill="#334155"/>
  <Path d="M18 40h5m18 0h5" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
</Base>;

// AI ICON NAME: RouteIcon — Route icon for bus routes, stops, and navigation paths.
export const RouteIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Path d="M14 48c0-14 28-14 28-28" stroke="#2563EB" strokeWidth="5" strokeLinecap="round" strokeDasharray="5 5"/>
  <Circle cx="14" cy="49" r="7" fill="#34D399" stroke="#047857" strokeWidth="2.5"/>
  <Path d="M42 7c-7 0-11 5-11 11 0 8 11 18 11 18s11-10 11-18C53 12 49 7 42 7z" fill="#F87171" stroke="#B91C1C" strokeWidth="2.5"/>
  <Circle cx="42" cy="18" r="3.5" fill="#fff"/>
</Base>;

// AI ICON NAME: DriverIcon — Driver profile icon for school transport drivers.
export const DriverIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Circle cx="32" cy="18" r="10" fill="#FDBA74" stroke="#C2410C" strokeWidth="2.5"/>
  <Path d="M12 56c0-14 7-24 20-24s20 10 20 24z" fill="#34D399" stroke="#047857" strokeWidth="2.5"/>
  <Path d="M20 14q12-13 24 0v5H20z" fill="#1E40AF" stroke="#1E3A8A" strokeWidth="2"/>
  <Path d="M25 24h14" stroke="#7C2D12" strokeWidth="2" strokeLinecap="round"/>
</Base>;

// AI ICON NAME: BusStopIcon — Bus stop icon for pickup and drop-off points.
export const BusStopIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Path d="M13 55V10h38v45M13 17h38" stroke="#64748B" strokeWidth="4" strokeLinecap="round"/>
  <Rect x="19" y="21" width="26" height="23" rx="3" fill="#BFDBFE" stroke="#2563EB" strokeWidth="2"/>
  <Path d="M24 28h16m-16 7h10" stroke="#1D4ED8" strokeWidth="2.5" strokeLinecap="round"/>
  <Path d="M19 55h26" stroke="#334155" strokeWidth="4" strokeLinecap="round"/>
</Base>;

// --- APP / GENERAL SCHOOL MODULES ---
// AI ICON NAME: DashboardIcon — Dashboard grid icon for the app home dashboard.
export const DashboardIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Rect x="8" y="8" width="21" height="21" rx="4" fill="#60A5FA" stroke="#1D4ED8" strokeWidth="2"/>
  <Rect x="35" y="8" width="21" height="14" rx="4" fill="#FBBF24" stroke="#B45309" strokeWidth="2"/>
  <Rect x="8" y="35" width="21" height="21" rx="4" fill="#34D399" stroke="#047857" strokeWidth="2"/>
  <Rect x="35" y="28" width="21" height="28" rx="4" fill="#C4B5FD" stroke="#7C3AED" strokeWidth="2"/>
</Base>;

// AI ICON NAME: NotificationIcon — Notification bell icon for alerts and announcements.
export const NotificationIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Path d="M14 44h36l-5-7V26a13 13 0 0 0-26 0v11z" fill="#FBBF24" stroke="#B45309" strokeWidth="2.5" strokeLinejoin="round"/>
  <Path d="M26 49q6 9 12 0" stroke="#B45309" strokeWidth="3" strokeLinecap="round"/>
  <Circle cx="48" cy="14" r="8" fill="#F87171" stroke="#B91C1C" strokeWidth="2"/>
</Base>;

// AI ICON NAME: CalendarIcon — Calendar icon for dates, events, and academic calendar.
export const CalendarIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Rect x="8" y="11" width="48" height="44" rx="5" fill="#FCE7F3" stroke="#BE185D" strokeWidth="2.5"/>
  <Path d="M8 24h48M20 7v10m24-10v10" stroke="#9D174D" strokeWidth="3" strokeLinecap="round"/>
  <Path d="M18 33h6m8 0h6m8 0h3M18 43h6m8 0h6" stroke="#DB2777" strokeWidth="3" strokeLinecap="round"/>
</Base>;

// AI ICON NAME: SettingsIcon — Settings gear icon for app and account settings.
export const SettingsIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Path d="m27 7 10 0 2 7 6 3 7-2 5 9-5 5v7l5 5-5 9-7-2-6 3-2 7H27l-2-7-6-3-7 2-5-9 5-5v-7l-5-5 5-9 7 2 6-3z" fill="#94A3B8" stroke="#475569" strokeWidth="2.5" strokeLinejoin="round"/>
  <Circle cx="32" cy="33" r="9" fill="#F8FAFC" stroke="#475569" strokeWidth="3"/>
</Base>;

// AI ICON NAME: MessageIcon — Message/chat icon for conversations and communication.
export const MessageIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Path d="M8 13q0-5 6-5h36q6 0 6 6v24q0 6-6 6H27L13 55v-11q-5-1-5-7z" fill="#93C5FD" stroke="#2563EB" strokeWidth="2.5" strokeLinejoin="round"/>
  <Path d="M18 23h28m-28 9h19" stroke="#1D4ED8" strokeWidth="3" strokeLinecap="round"/>
</Base>;

// AI ICON NAME: ProfileIcon — User profile icon for account and personal details.
export const ProfileIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Circle cx="32" cy="20" r="12" fill="#FDBA74" stroke="#C2410C" strokeWidth="2.5"/>
  <Path d="M9 57c1-14 9-23 23-23s22 9 23 23z" fill="#A78BFA" stroke="#6D28D9" strokeWidth="2.5"/>
</Base>;

// AI ICON NAME: ClockIcon — Clock icon for time, duration, and schedules.
export const ClockIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Circle cx="32" cy="32" r="24" fill="#BFDBFE" stroke="#2563EB" strokeWidth="3"/>
  <Path d="M32 17v16l12 7" stroke="#1D4ED8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  <Circle cx="32" cy="32" r="3" fill="#1D4ED8"/>
</Base>;

// AI ICON NAME: HelpIcon — Help / Question icon for support and help sections.
export const HelpIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Circle cx="32" cy="32" r="24" fill="#C4B5FD" stroke="#6D28D9" strokeWidth="3"/>
  <Path d="M23 24q1-10 10-10 10 0 10 9 0 7-10 12v4" stroke="#fff" strokeWidth="4" strokeLinecap="round"/>
  <Circle cx="33" cy="48" r="2.5" fill="#fff"/>
</Base>;

// AI ICON NAME: StarIcon — Star icon for ratings, favorites, and achievements.
export const StarIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Path d="m32 6 8 17 18 2-13 12 4 19-17-10-17 10 4-19L6 25l18-2z" fill="#FBBF24" stroke="#B45309" strokeWidth="2.5" strokeLinejoin="round"/>
  <Path d="m28 15 4-9 4 9" fill="#FDE68A"/>
</Base>;

// AI ICON NAME: WalletIcon — Wallet icon for payments, balance, and fee transactions.
export const WalletIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Rect x="8" y="15" width="48" height="38" rx="6" fill="#34D399" stroke="#047857" strokeWidth="3"/>
  <Path d="M8 22h42" stroke="#A7F3D0" strokeWidth="3"/>
  <Path d="M39 30h17v14H39a7 7 0 0 1 0-14z" fill="#FBBF24" stroke="#B45309" strokeWidth="2.5"/>
  <Circle cx="44" cy="37" r="2" fill="#92400E"/>
</Base>;

// AI ICON NAME: ShieldIcon — Shield / Security icon for protection, permissions, and safety.
export const ShieldIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Path d="M32 6 53 14v15c0 14-9 23-21 29C20 52 11 43 11 29V14z" fill="#60A5FA" stroke="#1D4ED8" strokeWidth="3" strokeLinejoin="round"/>
  <Path d="m21 32 8 8 15-17" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
</Base>;

// AI ICON NAME: WifiIcon — Wi-Fi icon for connectivity and network status.
export const WifiIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Path d="M8 24q24-22 48 0M16 33q16-15 32 0M24 42q8-8 16 0" stroke="#2563EB" strokeWidth="4" strokeLinecap="round"/>
  <Circle cx="32" cy="52" r="4" fill="#2563EB"/>
</Base>;

// AI ICON NAME: CameraIcon — Camera icon for taking or capturing photos.
export const CameraIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Path d="M8 20h10l4-6h20l4 6h10v32H8z" fill="#94A3B8" stroke="#475569" strokeWidth="2.5" strokeLinejoin="round"/>
  <Circle cx="32" cy="35" r="11" fill="#BFDBFE" stroke="#1D4ED8" strokeWidth="3"/>
  <Circle cx="32" cy="35" r="5" fill="#60A5FA"/>
  <Circle cx="48" cy="26" r="2.5" fill="#FDE68A"/>
</Base>;

// AI ICON NAME: ImageIcon — Image / Gallery icon for photos and uploaded images.
export const ImageIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Rect x="7" y="10" width="50" height="44" rx="5" fill="#DBEAFE" stroke="#2563EB" strokeWidth="2.5"/>
  <Circle cx="22" cy="24" r="5" fill="#FBBF24"/>
  <Path d="m11 48 14-14 9 9 8-12 11 17z" fill="#34D399" stroke="#047857" strokeWidth="2" strokeLinejoin="round"/>
</Base>;

// AI ICON NAME: LockIcon — Lock icon for password, privacy, and secure access.
export const LockIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Rect x="13" y="27" width="38" height="29" rx="5" fill="#FBBF24" stroke="#B45309" strokeWidth="2.5"/>
  <Path d="M21 27v-8a11 11 0 0 1 22 0v8" stroke="#64748B" strokeWidth="5" strokeLinecap="round"/>
  <Circle cx="32" cy="40" r="4" fill="#92400E"/>
  <Path d="M32 43v5" stroke="#92400E" strokeWidth="3" strokeLinecap="round"/>
</Base>;

// AI ICON NAME: LogoutIcon — Logout / Sign-out icon for ending a user session.
export const LogoutIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Path d="M28 9H13v46h15" stroke="#64748B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  <Path d="M34 20 47 32 34 44M47 32H22" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
</Base>;

// AI ICON NAME: CloudIcon — Cloud icon for cloud storage, backup, and sync.
export const CloudIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Path d="M18 48h29a11 11 0 0 0 1-22 16 16 0 0 0-31-3 13 13 0 0 0 1 25z" fill="#BFDBFE" stroke="#2563EB" strokeWidth="3"/>
  <Path d="m24 34 8-8 8 8m-8-8v18" stroke="#1D4ED8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
</Base>;

// AI ICON NAME: TruckIcon — Truck / Delivery vehicle icon for logistics and vehicle records.
export const TruckIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Path d="M6 17h32v29H6z" fill="#34D399" stroke="#047857" strokeWidth="2.5"/>
  <Path d="M38 27h10l10 11v8H38z" fill="#93C5FD" stroke="#2563EB" strokeWidth="2.5" strokeLinejoin="round"/>
  <Circle cx="17" cy="48" r="6" fill="#334155"/><Circle cx="47" cy="48" r="6" fill="#334155"/>
  <Path d="M12 25h20" stroke="#D1FAE5" strokeWidth="3" strokeLinecap="round"/>
</Base>;

// AI ICON NAME: HeartIcon — Heart icon for health, care, wellbeing, or favorites.
export const HeartIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Path d="M32 54S7 39 7 22C7 8 25 5 32 19 39 5 57 8 57 22c0 17-25 32-25 32z" fill="#F87171" stroke="#B91C1C" strokeWidth="2.5" strokeLinejoin="round"/>
  <Path d="M17 20q2-6 8-5" stroke="#FECACA" strokeWidth="3" strokeLinecap="round"/>
</Base>;

// AI ICON NAME: TrophyIcon — Trophy icon for awards, winners, and student achievements.
export const TrophyIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Path d="M20 9h24v14q0 17-12 17T20 23z" fill="#FBBF24" stroke="#B45309" strokeWidth="2.5"/>
  <Path d="M20 15H9v8q0 10 14 10M44 15h11v8q0 10-14 10" stroke="#D97706" strokeWidth="4" fill="none" strokeLinecap="round"/>
  <Path d="M27 40v9h10v-9M22 54h20" stroke="#92400E" strokeWidth="3" strokeLinecap="round"/>
</Base>;

// AI ICON NAME: MoreIcon — More / Overflow menu icon for additional actions.
export const MoreIcon = ({ size = 28 }: IconProps) => <Base size={size}>
  <Circle cx="13" cy="32" r="5" fill="#64748B"/><Circle cx="32" cy="32" r="5" fill="#64748B"/><Circle cx="51" cy="32" r="5" fill="#64748B"/>
</Base>;

// Compatibility aliases / commonly requested names
// AI ICON NAME: ParentsIcon — Alias of ParentIcon: parent or guardian profile icon.
export const ParentsIcon = ParentIcon;
// AI ICON NAME: ChildrensIcon — Alias of ChildIcon: child profile icon.
export const ChildrensIcon = ChildIcon;
// AI ICON NAME: VehicleIcon — Alias of VanIcon: school vehicle or transport icon.
export const VehicleIcon = VanIcon;
// AI ICON NAME: AddressLocationIcon — Alias of AddressIcon: home or address icon.
export const AddressLocationIcon = AddressIcon;
// AI ICON NAME: PhoneCallIcon — Alias of PhoneIcon: telephone or call action icon.
export const PhoneCallIcon = PhoneIcon;
// AI ICON NAME: PencilEditIcon — Alias of PencilIcon: edit or pencil action icon.
export const PencilEditIcon = PencilIcon;
// AI ICON NAME: NotificationsIcon — Alias of NotificationIcon: alerts and announcements icon.
export const NotificationsIcon = NotificationIcon;
// AI ICON NAME: StudentsIcon — Alias of StudentIcon: student profile or student module icon.
export const StudentsIcon = StudentIcon;
// AI ICON NAME: ExamsIcon — Alias of ExamIcon: examinations and tests icon.
export const ExamsIcon = ExamIcon;
// AI ICON NAME: ReportsIcon — Alias of ReportIcon: reports and analytics icon.
export const ReportsIcon = ReportIcon;
// AI ICON NAME: MessagesIcon — Alias of MessageIcon: chat and communication icon.
export const MessagesIcon = MessageIcon;
// AI ICON NAME: ClassesIcon — Alias of BookIcon: classes, subjects, and learning icon.
export const ClassesIcon = BookIcon;
// AI ICON NAME: TransportIcon — Alias of BusIcon: school transport icon.
export const TransportIcon = BusIcon;
// AI ICON NAME: FeedbackIcon — Alias of MessageIcon: feedback and communication icon.
export const FeedbackIcon = MessageIcon;

// --- ROLE SELECT ILLUSTRATIONS ---

// AI ICON NAME: RoleAdminIllustration — Detailed admin character illustration for role selection screen.
export function RoleAdminIllustration() {
  return (
    <Svg width={48} height={48} viewBox="0 0 48 48" fill="none">
      <Defs>
        <LinearGradient id="adminSuit" x1="5" y1="23" x2="28" y2="46">
          <Stop offset="0" stopColor="#60A5FA" />
          <Stop offset="0.5" stopColor="#2563EB" />
          <Stop offset="1" stopColor="#172554" />
        </LinearGradient>
        <LinearGradient id="adminSkin" x1="11" y1="5" x2="23" y2="22">
          <Stop offset="0" stopColor="#FFE4C7" />
          <Stop offset="0.6" stopColor="#F4B183" />
          <Stop offset="1" stopColor="#D8895B" />
        </LinearGradient>
        <LinearGradient id="adminHair" x1="10" y1="3" x2="25" y2="16">
          <Stop offset="0" stopColor="#475569" />
          <Stop offset="1" stopColor="#0F172A" />
        </LinearGradient>
        <LinearGradient id="adminGold" x1="28" y1="23" x2="44" y2="40">
          <Stop offset="0" stopColor="#FEF3C7" />
          <Stop offset="0.4" stopColor="#FBBF24" />
          <Stop offset="1" stopColor="#B45309" />
        </LinearGradient>
      </Defs>
      <Ellipse cx="21" cy="46" rx="17" ry="2" fill="#0F172A" opacity={0.2} />
      <Path d="M3 45 Q3 26 16 25 Q29 25 32 45 Z" fill="url(#adminSuit)" />
      <Path d="M12 26 L17 33 L22 26 L20 25 L17 29 L14 25 Z" fill="#FFFFFF" />
      <Path d="M16 30 L14.5 33 L17 41 L19.5 33 L18 30 Z" fill="url(#adminGold)" />
      <Rect x="13" y="19" width="8" height="9" rx="3" fill="#E9A174" />
      <Circle cx="10" cy="14" r="2.5" fill="#E9A174" />
      <Circle cx="24" cy="14" r="2.5" fill="#E9A174" />
      <Ellipse cx="17" cy="13" rx="7.5" ry="9.5" fill="url(#adminSkin)" />
      <Path d="M9.5 12 Q7 3 17 3 Q26 3 25 13 L22 10 Q18 7 13 9 Q11 10 9.5 12 Z" fill="url(#adminHair)" />
      <Path d="M9.5 11 Q8 17 11 20 L12 13 Z M24 11 Q26 16 23 20 L22 13 Z" fill="#1E293B" />
      <Circle cx="14.5" cy="14" r="0.8" fill="#334155" />
      <Circle cx="20" cy="14" r="0.8" fill="#334155" />
      <Path d="M14.5 18 Q17.5 20.5 20.5 18" stroke="#A85542" strokeWidth={1} fill="none" strokeLinecap="round" />
      <Ellipse cx="14" cy="9" rx="2.5" ry="1.5" fill="#FFFFFF" opacity={0.45} />
      <Circle cx="36" cy="34" r="9" fill="#92400E" opacity={0.25} />
      <G fill="url(#adminGold)">
        <Rect x="34.5" y="23" width="3" height="5" rx="1" />
        <Rect x="34.5" y="40" width="3" height="5" rx="1" />
        <Rect x="25" y="32.5" width="5" height="3" rx="1" />
        <Rect x="42" y="32.5" width="5" height="3" rx="1" />
        <Rect x="28" y="25" width="4" height="4" rx="1" transform="rotate(-45 30 27)" />
        <Rect x="40" y="25" width="4" height="4" rx="1" transform="rotate(45 42 27)" />
        <Rect x="28" y="39" width="4" height="4" rx="1" transform="rotate(45 30 41)" />
        <Rect x="40" y="39" width="4" height="4" rx="1" transform="rotate(-45 42 41)" />
      </G>
      <Circle cx="36" cy="34" r="7" fill="url(#adminGold)" />
      <Circle cx="36" cy="34" r="3.2" fill="#7C2D12" />
      <Circle cx="36" cy="34" r="2" fill="#FDE68A" />
      <Ellipse cx="33.5" cy="30.5" rx="2" ry="1" fill="#FFFFFF" opacity={0.55} />
      <Path d="M7 37 Q9 29 14 28" stroke="#BFDBFE" strokeWidth={1.5} strokeLinecap="round" opacity={0.5} />
    </Svg>
  );
}

// AI ICON NAME: RoleTeacherIllustration — Detailed teacher character illustration for role selection screen.
export function RoleTeacherIllustration() {
  return (
    <Svg width={48} height={48} viewBox="0 0 48 48" fill="none">
      <Defs>
        <LinearGradient id="teacherCoat" x1="8" y1="24" x2="30" y2="46">
          <Stop offset="0" stopColor="#60A5FA" />
          <Stop offset="0.5" stopColor="#2563EB" />
          <Stop offset="1" stopColor="#1E40AF" />
        </LinearGradient>
        <LinearGradient id="teacherSkin" x1="12" y1="5" x2="25" y2="23">
          <Stop offset="0" stopColor="#FFE4C7" />
          <Stop offset="0.65" stopColor="#F4B183" />
          <Stop offset="1" stopColor="#D8895B" />
        </LinearGradient>
        <LinearGradient id="teacherHair" x1="12" y1="3" x2="25" y2="17">
          <Stop offset="0" stopColor="#64748B" />
          <Stop offset="1" stopColor="#1E293B" />
        </LinearGradient>
        <Rect x={27} y={4} width={18} height={18} rx={2.5} fill="#475569" />
        <Rect x={28} y={5} width={16} height={15} rx={1.5} fill="#111827" />
        <Path d="M31 9 L40 9 M31 12 L38 12 M31 15 L40 15" stroke="#FFFFFF" strokeWidth={1} strokeLinecap="round" opacity={0.95} />
        <Path d="M32 17 L34 14 L36 17 Z" stroke="#FFFFFF" strokeWidth={0.7} fill="none" opacity={0.9} />
        <Path d="M28 20 L44 20 L43 21.5 L29 21.5 Z" fill="#64748B" />
        <Rect x={37} y={20} width={3} height={0.8} rx={0.4} fill="#FFFFFF" />
        <LinearGradient id="teacherBook" x1="28" y1="27" x2="41" y2="40">
          <Stop offset="0" stopColor="#FDE68A" />
          <Stop offset="1" stopColor="#D97706" />
        </LinearGradient>
      </Defs>
      <Ellipse cx="23" cy="45" rx="17" ry="2" fill="#0F172A" opacity={0.15} />
      <Rect x="27" y="4" width="18" height="18" rx="2.5" fill="#854D0E" />
      <Rect x="28" y="5" width="16" height="15" rx="1.5" fill="url(#teacherBoard)" />
      <Path d="M31 10 L40 10 M31 13 L37 13 M31 16 L39 16" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" opacity={0.8} />
      <Path d="M4 46 Q4 26 17 25 Q30 25 34 46 Z" fill="url(#teacherCoat)" />
      <Path d="M13 26 L18 33 L23 26 L21 25 L17 29 L14 25 Z" fill="#FFFFFF" />
      <Path d="M17 30 L15.5 33 L17 40 L19 33 Z" fill="#FBBF24" />
      <Rect x="14" y="20" width="7" height="8" rx="2.5" fill="#E9A174" />
      <Circle cx="10.5" cy="15" r="2.5" fill="#E9A174" />
      <Circle cx="25" cy="15" r="2.5" fill="#E9A174" />
      <Ellipse cx="18" cy="14" rx="8" ry="10" fill="url(#teacherSkin)" />
      <Path d="M10 13 Q8 4 17 3 Q26 3 26 12 L23 10 Q20 7 16 8 Q13 8 10 13 Z" fill="url(#teacherHair)" />
      <Path d="M10 11 Q8 16 11 20 L12 14 Z M24 10 Q28 17 24 20 L23 13 Z" fill="#334155" />
      <Ellipse cx="15" cy="15" rx="1" ry="1.3" fill="#334155" />
      <Ellipse cx="21" cy="15" rx="1" ry="1.3" fill="#334155" />
      <Circle cx="15.3" cy="14.6" r="0.35" fill="#FFFFFF" />
      <Circle cx="21.3" cy="14.6" r="0.35" fill="#FFFFFF" />
      <Path d="M15 19 Q18 22 21 19" stroke="#A85542" strokeWidth="1" strokeLinecap="round" fill="none" />
      <Ellipse cx="14" cy="9" rx="2.5" ry="1.5" fill="#FFFFFF" opacity={0.4} />
      <Path d="M29 29 Q34 26 41 29 L41 41 Q34 38 29 41 Z" fill="url(#teacherBook)" />
      <Path d="M30 30 Q34 28 35 30 L35 40 Q33 38 30 40 Z" fill="#FFF7ED" />
      <Path d="M36 30 Q38 28 40 30 L40 40 Q38 38 36 40 Z" fill="#FFFFFF" />
      <Path d="M35.5 29 L35.5 40" stroke="#B45309" strokeWidth={1} />
      <Path d="M31 32 L34 32 M31 34 L34 34 M37 32 L39 32 M37 34 L39 34" stroke="#D6A16D" strokeWidth={0.6} />
      <Path d="M7 35 Q9 29 14 28" stroke="#BFDBFE" strokeWidth={1.5} opacity={0.6} strokeLinecap="round" />
      <Path d="M28 25 L32 19" stroke="#FBBF24" strokeWidth={1.5} strokeLinecap="round" />
      <Circle cx="32" cy="19" r="1" fill="#FBBF24" />
    </Svg>
  );
}

// AI ICON NAME: RoleParentIllustration — Detailed parent family illustration for role selection screen.
export function RoleParentIllustration() {
  return (
    <Svg width={52} height={48} viewBox="0 0 52 48" fill="none">
      <Defs>
        <LinearGradient id="momDress" x1="5" y1="22" x2="20" y2="46">
          <Stop offset="0" stopColor="#F9A8D4" />
          <Stop offset="1" stopColor="#DB2777" />
        </LinearGradient>
        <LinearGradient id="dadDress" x1="30" y1="22" x2="48" y2="46">
          <Stop offset="0" stopColor="#60A5FA" />
          <Stop offset="1" stopColor="#1D4ED8" />
        </LinearGradient>
        <LinearGradient id="childDress" x1="19" y1="29" x2="34" y2="47">
          <Stop offset="0" stopColor="#FCD34D" />
          <Stop offset="1" stopColor="#F59E0B" />
        </LinearGradient>
        <LinearGradient id="skin" x1="10" y1="4" x2="20" y2="19">
          <Stop offset="0" stopColor="#FFE4C7" />
          <Stop offset="1" stopColor="#E99A68" />
        </LinearGradient>
        <LinearGradient id="childSkin" x1="21" y1="14" x2="31" y2="29">
          <Stop offset="0" stopColor="#FFE8D2" />
          <Stop offset="1" stopColor="#F0A36E" />
        </LinearGradient>
      </Defs>
      <Ellipse cx="26" cy="46" rx="23" ry="2" fill="#64748B" opacity={0.18} />
      <Path d="M2 45 Q2 25 13 25 Q24 25 25 45 Z" fill="url(#momDress)" />
      <Path d="M27 45 Q28 25 39 25 Q50 25 50 45 Z" fill="url(#dadDress)" />
      <Circle cx="13" cy="14" r="7.5" fill="#A85E3C" />
      <Circle cx="13" cy="13" r="6.8" fill="url(#skin)" />
      <Path d="M6.5 13 Q5 4 13 5 Q21 5 20 14 L18 12 Q17 7 12 8 Q9 8 8 13 Z" fill="#713F35" />
      <Circle cx="39" cy="14" r="7.5" fill="#A85E3C" />
      <Circle cx="39" cy="13" r="6.8" fill="url(#skin)" />
      <Path d="M32 12 Q31 5 39 5 Q46 5 46 12 L44 10 Q40 7 34 11 Z" fill="#334155" />
      <Ellipse cx={26} cy={16} rx={8} ry={2} fill="#1E293B" opacity={0.25} />
      <Path d="M19.5 17 Q20 13 26 13 Q32 13 32.5 17 L31 19 Q26 21 21 19 Z" fill="#172554" />
      <Path d="M26 9 L36 13 L26 17 L16 13 Z" fill="#1E293B" />
      <Path d="M26 9 L36 13 L26 12 L16 13 Z" fill="#475569" opacity={0.7} />
      <Circle cx={26} cy={9.5} r={1.4} fill="#FBBF24" />
      <Path d="M26 10 Q29 11 32 13 L32 18" stroke="#FBBF24" strokeWidth={1.2} fill="none" strokeLinecap="round" />
      <Path d="M31 17 L30 21 M32 17 L32 21 M33 17 L34 20" stroke="#F59E0B" strokeWidth={1.2} strokeLinecap="round" />
      <Path d="M17 46 Q17 30 26 29 Q35 30 35 46 Z" fill="url(#childDress)" />
      <Circle cx="26" cy="24" r="7.5" fill="#C47A4B" />
      <Circle cx="26" cy="23" r="7" fill="url(#childSkin)" />
      <Path d="M19 23 Q18 15 26 15 Q34 15 33 23 L31 20 Q26 17 21 21 Z" fill="#713F35" />
      <Ellipse cx="10.5" cy="10" rx="2" ry="1.5" fill="#FFF" opacity={0.4} />
      <Ellipse cx="36.5" cy="10" rx="2" ry="1.5" fill="#FFF" opacity={0.4} />
      <Ellipse cx="24" cy="20" rx="2" ry="1.4" fill="#FFF" opacity={0.5} />
      <Path d="M11 16 Q13 18 15 16" stroke="#9A4D38" strokeWidth={0.8} fill="none" strokeLinecap="round" />
      <Path d="M37 16 Q39 18 41 16" stroke="#9A4D38" strokeWidth={0.8} fill="none" strokeLinecap="round" />
      <Path d="M24 26 Q26 28 28 26" stroke="#9A4D38" strokeWidth={0.9} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

// AI ICON NAME: ArrowRightIcon — Small right arrow for navigation cards.
export function ArrowRightIcon({color}: {color: string}) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path d="M6.5 3.5L12 9L6.5 14.5" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// AI ICON NAME: CardWave — Decorative wave for the bottom of role cards.
export function CardWave({color}: {color: string}) {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 340 44" preserveAspectRatio="none">
      <Path d="M0,28 C45,12 90,36 135,22 C180,8 225,32 270,20 C315,8 340,24 340,24 L340,44 L0,44Z" fill={color} opacity={0.18} />
      <Path d="M0,34 C55,22 110,40 165,30 C220,20 275,38 340,26 L340,44 L0,44Z" fill={color} opacity={0.1} />
    </Svg>
  );
}

// AI ICON NAME: DotGrid — Decorative dot grid pattern.
export function DotGrid({color}: {color: string}) {
  const dots: React.JSX.Element[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      dots.push(
        <Circle key={`${r}${c}`} cx={c * 10 + 3} cy={r * 10 + 3} r={2.5} fill={color} opacity={0.25} />,
      );
    }
  }
  return <Svg width={36} height={36} viewBox="0 0 36 36">{dots}</Svg>;
}



type RoleIconProps = {
  size?: number;
  accentColor?: string;
};

// ADMIN: shield, school manager avatar, and settings gear.
export const AdminLoginRoleIcon = ({ size = 72, accentColor = "#4F46E5" }: RoleIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 96 96" fill="none">
    <Circle cx="48" cy="48" r="44" fill="#EEF2FF" />
    <Path d="M48 10 78 21v22c0 20-12 34-30 43C30 77 18 63 18 43V21L48 10Z" fill={accentColor} />
    <Path d="M48 18 70 26v17c0 15-8.5 26-22 33-13.5-7-22-18-22-33V26l22-8Z" fill="#fff" opacity=".16" />
    <Circle cx="48" cy="37" r="10" fill="#FDE68A" />
    <Path d="M29 67c1.5-12 8-19 19-19s17.5 7 19 19" fill="#fff" />
    <Path d="M48 53 42 61l6 9 6-9-6-8Z" fill="#C7D2FE" />
    <Circle cx="73" cy="70" r="15" fill="#FBBF24" stroke="#fff" strokeWidth="3" />
    <Path d="m73 59 2.8 4.2 5-.2-.2 5 4.2 2.8-4.2 2.8.2 5-5-.2-2.8 4.2-2.8-4.2-5 .2.2-5-4.2-2.8 4.2-2.8-.2-5 5 .2L73 59Z" fill="#92400E" />
    <Circle cx="73" cy="70" r="4" fill="#FEF3C7" />
  </Svg>
);

// TEACHER: teacher avatar, chalkboard, book, and pointer.
export const TeacherLoginRoleIcon = ({ size = 72, accentColor = "#0EA5E9" }: RoleIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 96 96" fill="none">
    <Circle cx="48" cy="48" r="44" fill="#E0F2FE" />
    <Rect x="51" y="17" width="30" height="34" rx="4" fill="#166534" stroke="#92400E" strokeWidth="3" />
    <Path d="M58 29h16M58 36h11" stroke="#DCFCE7" strokeWidth="2.5" strokeLinecap="round" />
    <Circle cx="35" cy="31" r="13" fill="#F6C49B" />
    <Path d="M22 31c-1-13 7-21 17-19 8 1 12 7 10 15-4-4-8-6-14-6-3 5-7 8-13 10Z" fill="#5B3528" />
    <Circle cx="30" cy="32" r="1.7" fill="#42251F" />
    <Circle cx="40" cy="32" r="1.7" fill="#42251F" />
    <Path d="M32 39q4 4 8 0" stroke="#9A4F3D" strokeWidth="1.8" strokeLinecap="round" />
    <Path d="M16 76c1-19 7-29 19-29s19 10 20 29" fill={accentColor} />
    <Path d="M25 51 35 62l10-11" fill="#fff" opacity=".9" />
    <Rect x="17" y="58" width="24" height="19" rx="3" transform="rotate(-8 17 58)" fill="#FBBF24" stroke="#B45309" strokeWidth="2" />
    <Path d="m61 55-8 18" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
    <Path d="m51 74 5-2-3-4-2 6Z" fill="#92400E" />
  </Svg>
);

// PARENTS: two guardians and their child, representing family and care.
export const ParentLoginRoleIcon = ({ size = 72, accentColor = "#EC4899" }: RoleIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 96 96" fill="none">
    <Circle cx="48" cy="48" r="44" fill="#FCE7F3" />
    <Circle cx="31" cy="34" r="11" fill="#F4BD96" />
    <Path d="M20 33c0-11 7-17 15-15 6 1 10 6 9 13-6-3-12-4-24 2Z" fill="#57372F" />
    <Circle cx="65" cy="34" r="11" fill="#D99A70" />
    <Path d="M54 32c1-10 8-16 16-13 6 2 9 7 7 14-5-5-13-6-23-1Z" fill="#26364A" />
    <Circle cx="48" cy="49" r="9" fill="#F8C995" />
    <Path d="M40 48c0-8 5-13 11-12 5 1 8 5 7 11-5-3-10-3-18 1Z" fill="#7C4937" />
    <Path d="M8 78c1-18 8-29 23-29 8 0 14 4 17 12 3-8 9-12 17-12 15 0 22 11 23 29" fill={accentColor} />
    <Path d="M34 56c4 5 9 8 14 8s10-3 14-8" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".9" />
    <Path d="M43 76 48 68l5 8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="31" cy="35" r="1.5" fill="#42251F" />
    <Circle cx="65" cy="35" r="1.5" fill="#42251F" />
    <Circle cx="45" cy="50" r="1.3" fill="#42251F" />
    <Circle cx="52" cy="50" r="1.3" fill="#42251F" />
  </Svg>
);

