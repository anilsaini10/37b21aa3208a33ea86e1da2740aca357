# Screen Flow & Navigation Map

```text
                          ┌──────────────────────┐
                          │     App bootstrap     │
                          │  (MMKV + hydrate auth)│
                          └───────────┬───────────┘
                                      │
                              RootNavigator
                     isAuthenticated? ──► role
             ┌────────────────┼──────────────────┐
             │ no             │ admin   teacher   │ parent
             ▼                ▼         ▼          ▼
      ┌────────────┐   ┌───────────┐ ┌──────────┐ ┌──────────┐
      │ AuthStack  │   │AdminStack │ │TeacherStk│ │ParentStk │
      └─────┬──────┘   └─────┬─────┘ └────┬─────┘ └────┬─────┘
            │                │            │            │
   RoleSelect                │            │            │
   ├─► Login (admin/teacher) │            │            │
   │     └─► ForgotPassword  │            │            │
   └─► ParentLogin (OTP:1234)│            │            │
                             │            │            │
         ┌───────────────────┘            │            └───────────────┐
         ▼ Tabs                           ▼ Tabs                       ▼ Tabs
  ┌──────────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
  │ Dashboard  Students      │   │ Dashboard  Homework  │   │ Dashboard  Attendance│
  │ Fees       More          │   │ Classes    Profile   │   │ Fees       Profile   │
  └──────────────────────────┘   └──────────────────────┘   └──────────────────────┘
         │ push routes                 │ push routes               │ push routes
         ▼                             ▼                           ▼
  StudentDetail / StudentForm    MarkAttendance              ChildProfile
  Teachers / TeacherForm         CreateHomework              Results ─► ReportCard
  Attendance / Exams ─►Report    Timetable                   Homework / Timetable
  Announcements(+Form) / Events  Leave / Chat                Fees ─► FeeReceipt
  Transport / Library / Inventory Announcements              Announcements / Chat
  Reports / Settings             Notifications               Leave / Notifications
  Notifications / FeeReceipt     ChangePassword              ChangePassword
```

## Login sequence (Parent OTP)

```text
ParentLogin ──enter mobile──► requestOtp() ──► enter OTP (1234)
    └──► verifyOtp() ──► authStore.setSession() ──► RootNavigator swaps to ParentStack
```

## Data flow (every feature screen)

```text
Screen ──uses──► useXxx() React Query hook ──► <domain>.service (mock API)
                                                     │
                                        reads/writes seeded in-memory db
                                                     │
        Zustand authStore ◄── persists session ──► MMKV (via KeyValueStore)
```
