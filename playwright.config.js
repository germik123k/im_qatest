const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  //testDir: './tests/prod_actual/Base/',  // Ahora apunta directo a la estructura de pruebas
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },
});
