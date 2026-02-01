import type { CapacitorConfig } from '@capacitor/cli';

// Set your production URL here (e.g., your Vercel deployment)
const PRODUCTION_URL = process.env.CAPACITOR_SERVER_URL || 'https://the-session.vercel.app';

const config: CapacitorConfig = {
  appId: 'com.thesession.dublin',
  appName: 'The Session',
  webDir: 'public', // Fallback directory (we load from URL instead)
  server: {
    // Load the app from your deployed website
    // This allows all server features (auth, SSR) to work
    url: PRODUCTION_URL,
    cleartext: false,
    androidScheme: 'https',
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
    // Allow the app to handle deep links
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#1a1a1a',
      showSpinner: true,
      spinnerColor: '#16a34a',
    },
  },
};

export default config;
