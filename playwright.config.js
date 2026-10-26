const {defineConfig} = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 15000,
  use: {
    baseURL: 'http://127.0.0.1:3002',
    browserName: 'chromium',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'yarn serve --host 127.0.0.1 --port 3002',
    url: 'http://127.0.0.1:3002',
    reuseExistingServer: false,
  },
});
