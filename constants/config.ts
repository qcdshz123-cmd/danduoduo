/**
 * App configuration.
 * Supabase credentials are loaded from environment variables via expo-constants.
 */

export const config = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key',

  // Pagination
  pageSize: 20,

  // Feature flags
  features: {
    barcodeScanning: true,
    offlineMode: false,
    darkMode: true,
    printSupport: false,
  },

  // App info
  appName: '速订货',
  appVersion: '1.0.0',
} as const;
