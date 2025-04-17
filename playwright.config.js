const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  timeout: 0, // Aumenta el tiempo global para cada paso a 60 segundos
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },
});