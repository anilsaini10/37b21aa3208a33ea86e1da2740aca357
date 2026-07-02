/** Static app metadata + feature flags. */
export const AppConfig = {
  appName: 'School Management',
  version: '1.0.0',
  supportEmail: 'support@schoolms.example.com',
  defaultCurrency: 'INR' as const,
  academicYear: '2025-2026',
  pageSize: 15,
  features: {
    onlinePayments: true,
    chat: true,
    pushNotifications: true,
    offlineMode: true,
  },
};

export * from './env';
export * from './permissions';
