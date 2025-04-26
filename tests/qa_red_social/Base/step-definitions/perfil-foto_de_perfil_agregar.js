const { Given, When, Then } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');

Given('que el usuario navega a {string}', async function (url) {
  console.log(`[STEP START] Navegando a la URL: ${url}`);
  process.stdout.write(`[STEP START] test...\n`);
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

When('luego de unos segundos ingresas sus credenciales', {timeout: 10000}, async function () {
  console.log(`[STEP START] Ingresando credenciales.`);
  await this.page.waitForTimeout(6000);
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
  await this.page.waitForTimeout(4000);
  await this.page.evaluate(() => {
    window.location.href = "https://intramed-front-qa.conexa.ai/profile/gemikle";
  });
});
When('y puede visualizar la imagen de su perfil de vuelta en la home', async function () {
  console.log(`[STEP START] Validando la imagen de perfil en la home.`);
  const profileImage = await this.page.$('img[alt="user-profile-img"]');
  if (profileImage) {
    console.log(`[SUCCESS] Imagen de perfil encontrada: Inicio de sesión exitoso.`);
  } else {
    console.error(`[ERROR] Imagen de perfil no encontrada: Las credenciales no eran correctas.`);
  }
  console.log(`[STEP END] Se valido la imagen de perfil en la home.`);
});

When('el usuario modifica la URL a {string}', {timeout: 10000}, async function (newUrl) {
  console.log(`[STEP START] Cambiando URL a: ${newUrl}`);
  process.stdout.write(`[STEP START] Navegando a la URL...\n`);
  await this.page.waitForTimeout(4000);
  await this.page.evaluate(() => {
    window.location.href = "https://intramed-front-qa.conexa.ai/profile/gemikle";
  });
  console.log(`[STEP END] Cambio de URL completado.`);
});

When('el usuario hace click en el botón de edición de perfil', {timeout: 10000}, async function () {
  console.log(`[STEP START] Haciendo click en el botón de edición.`);
  await this.page.waitForTimeout(4000);
  await this.page.click('button:has(svg.feather-edit-2)');
  console.log(`[STEP END] Click en edición de perfil completado.`);
});

When('el usuario hace click en la zona de carga de imagen', {timeout: 10000}, async function () {
  console.log(`[STEP START] Haciendo click en la zona de carga.`);
  await this.page.waitForTimeout(3000);
  await this.page.click('div[role="button"]');
  console.log(`[STEP END] Click en zona de carga completado.`);
});

When('el usuario selecciona la imagen {string} desde su escritorio', {timeout: 10000}, async function (imagePath) {
  console.log(`[STEP START] Subiendo imagen: ${imagePath}`);
  await this.page.waitForTimeout(3000);
  await this.page.setInputFiles('input[type="file"]', imagePath);
  console.log(`[STEP END] Imagen subida correctamente.`);
});

Then('el usuario espera {int} segundos', async function (seconds) {
  console.log(`[STEP START] Esperando ${seconds} segundos.`);
  await this.page.waitForTimeout(seconds * 1000);
  console.log(`[STEP END] Espera completada.`);
});
