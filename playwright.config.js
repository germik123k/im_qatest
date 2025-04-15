const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  timeout: 60000, // Aumenta el tiempo global para cada paso a 60 segundos
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },
});