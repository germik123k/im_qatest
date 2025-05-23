
const { Given, When, Then } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { updateTestState } = require('../../../../../utils/testStatus');

// Antes de ejecutar un test, cargar los parámetros desde el .json
const jsonFilePath = path.join(__dirname, '../../features/perfil/perfil-sobre_mi_editar.json');
let worldParameters;
try {
    worldParameters = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    console.log("[LOAD] Parámetros cargados:", worldParameters);
} catch (error) {
    console.error(`[LOAD] Error al cargar el archivo JSON (${jsonFilePath}):`, error);
    worldParameters = {}; // Default vacío si hay error
}
// Puedes usar `worldParameters` en tus steps
Given('que el usuario navega a {string}', { timeout: 10000 }, async function (url) {
    console.log(`[STEP START] Navegando a la URL: ${url}`);
    this.browser = await chromium.launch({
        headless: false,
        args: ['--disable-gpu', '--disable-dev-shm-usage']
    }); // Hereda configuración `headless` de playwright.config.js
      // Crear una nueva ventana (contexto de página)
        const context = await this.browser.newContext({
        viewport: null // Esto desactiva el tamaño predeterminado y permite maximizar
      });    
    this.page = await this.browser.newPage();
      // Ajustar el tamaño del viewport dinámicamente al tamaño del contenido
      const { width, height } = await this.page.evaluate(() => {
        return {
            width: window.innerWidth, // Ancho interno del contenido
            height: window.innerHeight // Alto interno del contenido
        };
    });
    await this.page.setViewportSize({ width, height });    
    await this.page.goto(url);
    console.log(`[STEP END] Navegación completada.`);
});

When('el usuario hace click en {string} button', { timeout: 10000 }, async function (buttonName) {
  //await updateTestState(worldParameters.uuid, `[STEP START] Haciendo click en el botón: ${buttonName}`, 30, "procesando");
  console.log(`[STEP START] Haciendo click en el botón: ${buttonName}`);
  await this.page.waitForTimeout(2000);
  await this.page.click(`button:has-text("${buttonName}")`);
  //await updateTestState(worldParameters.uuid, `[STEP END] Click completado en el botón: ${buttonName}`, 40, "procesando"); // Registro post ejecución
  console.log(`[STEP END] Click completado en el botón: ${buttonName}`);
});

When('luego de unos segundos ingresas sus credenciales', {timeout: 20000}, async function () {
  console.log(`[STEP START] Ingresando credenciales.`);
  await this.page.waitForTimeout(5000);
  await this.page.waitForSelector('#username', { timeout: 10000 });
  await this.page.fill('#username', worldParameters.email);
  console.log(`[INFO] Usuario ingresado: ${worldParameters.email}`);
  await this.page.waitForSelector('#password', { timeout: 10000 });
  await this.page.fill('#password', worldParameters.password);
  await this.page.waitForSelector('#username', { timeout: 10000 });
  await this.page.fill('#username', worldParameters.email);
  console.log(`[INFO] Contraseña ingresada.`);
  console.log(`[STEP END] Credenciales ingresadas.`);
});

When('y puede visualizar la imagen de su perfil', {timeout: 10000}, async function () {
  console.log(`[STEP START] Validando la imagen de perfil.`);
  await this.page.waitForSelector('img[alt="user-profile-img"]', { timeout: 10000 });
  const profileImage = await this.page.$('img[alt="user-profile-img"]');
  if (profileImage) {
    console.log(`[SUCCESS] Imagen de perfil encontrada: Inicio de sesión exitoso.`);
  } else {
    console.error(`[ERROR] Imagen de perfil no encontrada: Las credenciales no eran correctas.`);
  }
  console.log(`[STEP END] Se validó la imagen de perfil.`);
});

When('y realiza click en {string}', {timeout: 10000}, async function (buttonName) {
  console.log(`[STEP START] Realizando click en: ${buttonName}`);
  await this.page.click(`button:has-text("${buttonName}")`);
  console.log(`[STEP END] Click realizado en: ${buttonName}`);
  await this.page.waitForTimeout(4000);
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
Then('el usuario espera unos segundos E1', { timeout: 10000 }, async function () {
  console.log(`[STEP START] Esperando unos segundos.`);
  await this.page.waitForTimeout(5000);
  console.log(`[STEP END] Tiempo de espera completado.`);
});

//------------------------------------------------
When('el usuario hace click en el botón de edición de "Sobre mí"', { timeout: 10000 }, async function () {
    console.log(`[STEP START] Click en el botón de edición de "Sobre mí".`);
    
    await this.page.waitForSelector('xpath=/html/body/div[2]/div/div/div[1]/div[2]/div/div[1]/button', { timeout: 10000 }); // Ajusta el selector según el HTML
    await this.page.click('xpath=/html/body/div[2]/div/div/div[1]/div[2]/div/div[1]/button');
    
    console.log(`[STEP END] Botón de edición de "Sobre mí" presionado.`);
});

Then('el usuario espera unos segundos E2', { timeout: 10000 }, async function () {
    console.log(`[STEP START] Esperando unos segundos.`);
    await this.page.waitForTimeout(2000);
    console.log(`[STEP END] Tiempo de espera completado.`);
});

When('el usuario escribe un texto en el campo de edición "Sobre mí"', { timeout: 10000 }, async function () {
    console.log(`[STEP START] Ingresando texto en la sección "Sobre mí".`);
    await this.page.waitForSelector('#textarea-about-me', { timeout: 10000 }); // Ajusta el selector
    await this.page.fill('#textarea-about-me', worldParameters.textoSobreMi);

    console.log(`[STEP END] Texto ingresado en "Sobre mí".`);
});

Then('el usuario espera unos segundos E3', { timeout: 10000 }, async function () {
    console.log(`[STEP START] Esperando unos segundos.`);
    await this.page.waitForTimeout(3000);
    console.log(`[STEP END] Tiempo de espera completado.`);
});

When('el usuario hace click en el botón "Guardar cambios"', { timeout: 10000 }, async function () {
    console.log(`[STEP START] Guardando cambios en "Sobre mí".`);

    await this.page.waitForSelector('xpath=/html/body/div[9]/div/div/div/div[2]/button', { timeout: 10000 }); // Ajusta el selector
    await this.page.click('xpath=/html/body/div[9]/div/div/div/div[2]/button');

    console.log(`[STEP END] Cambios guardados.`);
});

Then('el usuario espera unos segundos E4', { timeout: 10000 }, async function () {
    console.log(`[STEP START] Esperando unos segundos.`);
    await this.page.waitForTimeout(3000);
    console.log(`[STEP END] Tiempo de espera completado.`);
});

Then('el usuario verifica que el texto ingresado se muestra correctamente en la sección "Sobre mí"', { timeout: 10000 }, async function () {
    console.log(`[STEP START] Validando la actualización en "Sobre mí".`);

    await this.page.waitForSelector('xpath=/html/body/div[2]/div/div/div[1]/div[2]/div/div[2]/p', { timeout: 10000 }); // Ajusta el selector según la estructura HTML
    const textoMostrado = await this.page.textContent('xpath=/html/body/div[2]/div/div/div[1]/div[2]/div/div[2]/p');

    if (textoMostrado.trim() === worldParameters.textoSobreMi.trim()) {
        console.log(`[SUCCESS] El texto en "Sobre mí" se actualizó correctamente.`);
    } else {
        console.error(`[ERROR] El texto en "Sobre mí" no coincide.`);
    }

    console.log(`[STEP END] Validación completada.`);
    await this.browser.close();

});

