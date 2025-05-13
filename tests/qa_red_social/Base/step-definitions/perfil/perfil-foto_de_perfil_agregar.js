
const { Given, When, Then } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { updateTestState } = require('../../../../../utils/testStatus');


// Antes de ejecutar un test, cargar los parámetros desde el .json
const jsonFilePath = path.join(__dirname, '../../features/perfil/perfil-foto_de_perfil_agregar.json');
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

    // Leer el parámetro `urlImagen` desde `worldParameters`
/*
    if (worldParameters.urlImagen) {
        console.log(`[DEBUG] URL Imagen utilizada: ${worldParameters.urlImagen}`);
    } else {
        console.log(`[DEBUG] URL Imagen no está definida.`);
    }
*/
    console.log(`[STEP END] Navegación completada.`);
    //await this.browser.close();
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
  await this.page.evaluate(() => {
    window.location.href = "https://intramed-front-qa.conexa.ai/profile/gemikle";
  });
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

When('el usuario hace click en el botón de edición de perfil', { timeout: 15000 }, async function () {
  console.log(`[STEP START] Esperando a que el botón de edición de perfil esté disponible.`);
  
  await this.page.waitForSelector('xpath=/html/body/div[2]/div/div/div[1]/div[1]/div/div[2]/div[1]/div/button', { timeout: 12000 }); // Espera el botón específico dentro del contenedor
  await this.page.waitForTimeout(2000); // Breve pausa para evitar fallos por carga

  console.log(`[STEP START] Click en el botón de edición de perfil.`);
  await this.page.click('xpath=/html/body/div[2]/div/div/div[1]/div[1]/div/div[2]/div[1]/div/button');
  console.log(`[STEP END] Click realizado en el botón de edición.`);
});



Then('el usuario espera unos segundos E2', { timeout: 10000 }, async function () {
  console.log(`[STEP START] Esperando unos segundos.`);
  await this.page.waitForTimeout(5000);
  console.log(`[STEP END] Tiempo de espera completado.`);
});

When('el usuario abre el modal de carga de imagen', { timeout: 10000 }, async function () {
  console.log(`[STEP START] Apertura del modal de carga de imagen.`);
  await this.page.waitForTimeout(3000);

  // Esperamos que el div con role=button exista
  await this.page.waitForSelector('xpath=/html/body/div[9]/div/div/div/div[1]', { timeout: 10000 });

  console.log(`[STEP START] Click en el modal de carga de imagen.`);
  await this.page.click('xpath=/html/body/div[9]/div/div/div/div[1]');
  console.log(`[STEP END] Modal abierto.`);
});

Then('el usuario espera unos segundos E3', { timeout: 10000 }, async function () {
  console.log(`[STEP START] Esperando unos segundos.`);
  await this.page.waitForTimeout(5000);
  console.log(`[STEP END] Tiempo de espera completado.`);
});

When('el usuario selecciona la imagen {string} desde su escritorio', { timeout: 15000 }, async function (imageName) {
  console.log(`[STEP START] Esperando el evento filechooser para seleccionar imagen: ${imageName}`);

  // Interceptamos el evento filechooser y anulamos la necesidad de abrir la ventana
  const [fileChooser] = await Promise.all([
    this.page.waitForEvent('filechooser'),
    this.page.click('xpath=/html/body/div[9]/div/div/div/div[1]'), // Click en el botón activador
  ]);

  console.log(`[INFO] FileChooser detectado. Subiendo archivo sin abrir ventana...`);
  //const filePath = `C:/Users/GermanMikle/Desktop/img_test.png`;
  let filePath ='./resources/img_profile/'+worldParameters.urlImagen+'.png';
  

  
  await fileChooser.setFiles(filePath); // Evitar que aparezca la ventana

  /*
  const inputFile = await fileChooser.element();
  await this.page.waitForTimeout(2000);

  await inputFile.evaluate((el) => el.showPicker());
  await this.page.waitForTimeout(500); // Breve espera
  await this.page.keyboard.press('Escape'); // Cierra el dialogo manualmente
  */
  
  
  console.log(`[STEP END] Imagen seleccionada sin mostrar el file chooser.`);
});

When('el usuario hace click en el botón guardar', { timeout: 10000 }, async function () {
  console.log(`[STEP START] Esperando a que el botón "Guardar" esté disponible.`);

  await this.page.waitForSelector('xpath=/html/body/div[9]/div/div/div/div[2]/div/button[2]', { timeout: 8000 }); // Esperamos que aparezca el botón
  await this.page.waitForTimeout(1000); // Breve pausa para estabilidad

  console.log(`[STEP START] Haciendo click en el botón "Guardar".`);
  await this.page.click('xpath=/html/body/div[9]/div/div/div/div[2]/div/button[2]');
  console.log(`[STEP END] Click realizado en el botón "Guardar".`);
});


Then('el usuario espera unos segundos E4', { timeout: 10000 }, async function () {
  console.log(`[STEP START] Esperando unos segundos.`);
  await this.page.waitForTimeout(5000);
  console.log(`[STEP END] Tiempo de espera completado.`);
  await this.browser.close();
});

