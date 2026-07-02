# 🏫 School Management App (React Native + TypeScript)

A production-structured **School Management** mobile application supporting three
roles — **Admin**, **Teacher**, and **Parent** — each with their own dashboard and
feature set. Built with a fully modular, feature-based, clean architecture and
**dummy APIs + dummy data** so it runs immediately with no backend.

> Status: **43 screens**, **26 reusable components**, ~**10k lines** of TypeScript.
> `tsc --noEmit` → **0 errors** · `jest` → **53 tests passing**.

---

## 🧰 Tech Stack

| Concern | Library |
|---|---|
| Framework | React Native `0.86` (CLI) + TypeScript |
| Navigation | React Navigation **v7** (native-stack + bottom-tabs) |
| State | **Zustand** (auth, session) |
| Server state | **React Query** (TanStack Query v5) |
| Forms | **React Hook Form** + Yup (schema-driven `DynamicForm`) |
| Storage | **MMKV** (v4) with an injectable backend + offline sync queue |
| HTTP | **Axios** with auth / retry / transform interceptors |
| Animation | React Native **Reanimated** (v4 + Worklets) |
| Graphics | React Native **SVG** (line charts) |
| UI kit | React Native **Paper** (themed bridge) |

---

## ✨ Features

**Authentication** — role selector, Admin/Teacher email-or-mobile + password login,
Parent mobile + **OTP** login, forgot password, change password. Session persists
across restarts and auto-routes to the correct role stack.

**Admin** — dashboard (KPIs + charts), Student management (list / detail / add / edit /
delete), Teacher management, Fee management (collection summary + invoices + receipt),
Attendance report, Examinations + report cards, Announcements (+ create), Events,
Transport, Library, Inventory, Reports, Settings (theme / font scale / logout).

**Teacher** — dashboard, mark attendance, homework (list + create), class roster,
timetable, leave, chat, announcements, profile.

**Parent** — dashboard, child profile, attendance, fees (+ pay flow), results &
report cards, homework, timetable, announcements, chat, leave, profile.

**Dynamic Theme System** — light / dark / **custom school themes** (Emerald, Amber),
runtime switching, accessibility font scaling, semantic color + typography + spacing +
component tokens, `ThemeProvider` / `ThemeContext` / `useTheme` / `ThemeService`.

**Offline-first** — MMKV persistence, TTL cache layer, and a FIFO **sync queue** with
retry/backoff for mutations made while offline.

---

## 📁 Project Structure

```text
src/
├── app/                    # App root + one-time bootstrap (MMKV, auth hydrate)
├── core/                   # Framework-agnostic infrastructure
│   ├── api/                # axiosClient + interceptors (auth/retry/transform)
│   ├── config/             # env, appConfig, RBAC permissions
│   ├── di/                 # service-locator container
│   ├── mock/               # seeded dummy DB + mock-API helpers
│   ├── query/              # React Query client + query keys
│   ├── storage/            # KeyValueStore, MMKV backend, cache, syncQueue
│   ├── theme/              # tokens, typography, themes, provider, hook, service
│   └── utils/              # format, grade, misc, logger
├── features/               # One folder per domain (feature-based)
│   ├── auth/               #   <domain>.service.ts (mock API + hooks) + screens/
│   ├── dashboard/ students/ teachers/ fees/ attendance/ exams/
│   ├── homework/ timetable/ communication/ operations/ ...
├── navigation/             # Root + Auth + Admin/Teacher/Parent navigators (typed)
└── shared/                 # Cross-cutting types, components, helpers
    ├── components/         # 26 reusable components (see below)
    └── types/              # Domain interfaces (user, academic, fee, exam, …)
```

### Reusable components (`src/shared/components`)
`CustomButton`, `CustomInput`, `CustomCard`, `CustomModal`, `CustomHeader`,
`CustomTable`, `CustomBottomSheet`, `EmptyState`, `Loader`, `SearchBar`,
`Pagination`, `Avatar`, `DatePicker`, `TimePicker`, `Select`, **`DynamicForm`**
(schema-driven engine), plus `AppText`, `Icon`, `Badge`, `BarChart`, `LineChart`,
`StatTile`, `SectionTitle`, `ListRow`, `ScrollPicker`, and layout primitives.

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install            # or: yarn

# 2. iOS only — install pods
cd ios && pod install && cd ..

# 3. Start Metro
npm start

# 4. Run on a device / emulator
npx react-native run-android
npx react-native run-ios
```

### 🔐 Demo credentials
| Role | How to sign in |
|---|---|
| **Admin** / **Teacher** | any email **or** 10-digit mobile + any password of **6+** chars |
| **Parent** | any 10-digit mobile → OTP is **`1234`** |

All data is generated locally (seeded, deterministic). Toggle `USE_MOCK_API` in
[`src/core/config/env.ts`](src/core/config/env.ts) to point at a real backend later —
the React Query hook layer stays unchanged.

---

## ✅ Quality / Verification

```bash
npm run typecheck     # tsc --noEmit   → 0 errors
npm test              # jest           → 53 tests, 8 suites
npm run lint          # eslint
```

The unit-test suite covers the pure business logic that must be correct regardless of
UI: formatters, grade computation, RBAC permissions, storage + TTL cache + sync-queue
retry semantics, the theme service, the Zustand auth store (login / OTP / logout /
permissions / hydrate), and the dummy-API services (pagination, search, fee payment,
report-card math, dashboard aggregation).

> Native device builds (`run-android` / `run-ios`) require the Android SDK / Xcode and
> are run on your machine — the commands above are the automated checks that run
> anywhere.

---

## 🎨 Theming

```tsx
import {useTheme} from '@core/theme';

function MyView() {
  const {theme, toggleMode, setThemeKey, setFontScale} = useTheme();
  // theme.colors.primary, theme.spacing.lg, theme.radius.md, theme.typography…
}
```

Add a new school brand by dropping a `Theme` object into
[`src/core/theme/themes.ts`](src/core/theme/themes.ts) — every screen re-styles with
zero changes.
```
