const { Given, When, Then } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');

Given('que el usuario navega a {string}', async function (url) {
  console.log(`[STEP START] Navegando a la URL: ${url}`);

  this.browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-gpu', '--start-maximized', '--disable-dev-shm-usage']
  }); // Hereda configuración `headless` de playwright.config.js



  
  this.page = await this.browser.newPage();
  await this.page.goto(url);
  console.log(`[STEP END] Navegación completada.`);
});

When('el usuario hace click en {string} button', async function (buttonName) {
  console.log(`[STEP START] Haciendo click en el botón: ${buttonName}`);
  await this.page.waitForTimeout(2000); 
  await this.page.click(`button:has-text("${buttonName}")`);
  console.log(`[STEP END] Click completado en el botón: ${buttonName}`);
});

When('luego de unos segundos ingresas sus credenciales', async function () {
  this.setTimeout(20000);
  console.log(`[STEP START] Ingresando credenciales.`);
  //await this.page.waitForTimeout(5000);
  await new Promise(resolve => setTimeout(resolve, 4000));
  await this.page.waitForSelector('#username', { timeout: 10000 });
  await this.page.fill('#username', 'pt304596@gmail.com');
  console.log(`[INFO] Usuario ingresado: pt304596@gmail.com`);
  await this.page.waitForSelector('#password', { timeout: 10000 });
  await this.page.fill('#password', 'Maradona86.');
  console.log(`[INFO] Contraseña ingresada.`);
  console.log(`[STEP END] Credenciales ingresadas.`);
});

When('y realiza click en {string}', async function (buttonName) {
  console.log(`[STEP START] Realizando click en: ${buttonName}`);
  await this.page.click(`button:has-text("${buttonName}")`);
  console.log(`[STEP END] Click realizado en: ${buttonName}`);
});

Then('el usuario espera unos segundos', async function () {
  console.log(`[STEP START] Esperando unos segundos.`);
  await this.page.waitForTimeout(4000); 
  console.log(`[STEP END] Espera completada.`);
});

Then('y puede visualizar la imagen de su perfil de vuelta en la home', async function () {
  console.log(`[STEP START] Validando la imagen de perfil en la home.`);
  const profileImage = await this.page.$('img[alt="user-profile-img"]');
  if (profileImage) {
    console.log(`[SUCCESS] Imagen de perfil encontrada: Inicio de sesión exitoso.`);
  } else {
    console.error(`[ERROR] Imagen de perfil no encontrada: Las credenciales no eran correctas.`);
  }
  await this.browser.close();
  console.log(`[STEP END] Navegador cerrado.`);
});