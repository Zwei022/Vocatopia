import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vocatopia.app',
  appName: 'Vocatopia',
  webDir: 'www',
  server: {
    url: 'https://vocatopia-production.up.railway.app',
    cleartext: false
  }
};

export default config;
