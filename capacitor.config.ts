import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gsi.insight',
  appName: 'GSI Insight',
  webDir: 'out',
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
