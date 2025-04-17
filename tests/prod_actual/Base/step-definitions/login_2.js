const { Given, When, Then } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');

Given('que el usuario navega a {string}', async function (url) {
  this.browser = await chromium.launch(); // Cambia headless a false
  this.page = await this.browser.newPage();
  await this.page.goto(url);
});

When('el usuario hace click en {string} button', async function (buttonName) {
  await this.page.waitForTimeout(2000); 
  await this.page.click(`button:has-text("${buttonName}")`);
});

When('luego de unos segundos ingresas sus credenciales', async function () {
  await this.page.waitForTimeout(2000);
  const fs = require('fs');
  const params = JSON.parse(fs.readFileSync('params.json', 'utf8'));

  const user = params.user; // "pedrito"
  const pass = params.pass; // "123456"

console.log(`Usuario: ${user}, Contraseña: ${pass}`);

  await this.page.waitForSelector('#username', { timeout: 10000 });
  await this.page.fill('#username',  user);
  await this.page.waitForSelector('#password', { timeout: 10000 });
  await this.page.fill('#password',  '123456');
});

When('y realiza click en {string}', async function (buttonName) {
  await this.page.click(`button:has-text("${buttonName}")`);
});

Then('el usuario espera unos segundos', async function () {
  await this.page.waitForTimeout(4000); 
});

Then('y puede visualizar la imagen de su perfil de vuelta en la home', async function () {
  const profileImage = await this.page.$('img[alt="user-profile-img"]');
  if (profileImage) {
    console.log('El usuario ha iniciado sesión correctamente y puede ver la imagen de su perfil.');
  } else {
    console.error('Error: Las credenciales no eran correctas o la imagen de perfil no apareció.');
  }
  await this.browser.close();
});
