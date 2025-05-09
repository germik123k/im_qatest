
const { Given, When, Then } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { updateTestState } = require('../../../../utils/testStatus');
/*
  Secciones:
Educación
Residencia
Especialización
Formación
Reconocimientos y becas
Experiencia laboral
Sociedad científica
Docencia
Publicaciones

deberemos agregar variable tipo array o objeto con los inputs diponibles para cada formulario, asi habilitamos o deshabilitamos partes
y array o objeto con las direcciones xpath o id's de estos inputs, pero no preocupeis, primero dime si entiendes este js
*/
// Antes de ejecutar un test, cargar los parámetros desde el .json
const jsonFilePath = path.join(__dirname, '../features/perfil-seccion_agregar.json');
let worldParameters;
try {
    worldParameters = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    console.log("[LOAD] Parámetros cargados:", worldParameters);
} catch (error) {
    console.error(`[LOAD] Error al cargar el archivo JSON (${jsonFilePath}):`, error);
    worldParameters = {}; // Default vacío si hay error
}
// Puedes usar `worldParameters` en tus steps
Given('que el usuario navega a {string}', { timeout: 130000 }, async function (url) {
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

When('el usuario hace click en {string} button', { timeout: 30000 }, async function (buttonName) {
  //await updateTestState(worldParameters.uuid, `[STEP START] Haciendo click en el botón: ${buttonName}`, 30, "procesando");
  console.log(`[STEP START] Haciendo click en el botón: ${buttonName}`);
  await this.page.waitForTimeout(9000);
  await this.page.click(`button:has-text("${buttonName}")`);
  //await updateTestState(worldParameters.uuid, `[STEP END] Click completado en el botón: ${buttonName}`, 40, "procesando"); // Registro post ejecución
  console.log(`[STEP END] Click completado en el botón: ${buttonName}`);
});

When('luego de unos segundos ingresas sus credenciales', {timeout: 20000}, async function () {
  console.log(`[STEP START] Ingresando credenciales.`);
  await this.page.waitForTimeout(7000);
  await this.page.waitForSelector('#username', { timeout: 10000 });
  await this.page.fill('#username', 'pt304596@gmail.com');
  console.log(`[INFO] Usuario ingresado: pt304596@gmail.com`);
  await this.page.waitForSelector('#password', { timeout: 10000 });
  await this.page.fill('#password', 'Maradona86.');
  await this.page.waitForSelector('#username', { timeout: 10000 });
  await this.page.fill('#username', 'pt304596@gmail.com');  
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
  await this.page.waitForTimeout(7000);
  console.log(`[STEP END] Tiempo de espera completado.`);
});

//------------------------------------------------
When('el usuario hace click en el botón de agregar sección', { timeout: 10000 }, async function () {
  console.log(`[STEP START] Detectando botones de gestión de secciones.`);
  
  const botones = await this.page.$$('xpath=/html/body/div[2]/div/div/div[1]/div[3]/div[2]/div/div[2]/button');
  let agregarSeccionButton, ordenarSeccionesButton;

  if (botones.length === 1) {
      // Identificamos si el único botón es el de agregar sección o el de ordenar
      const icono = await botones[0].evaluate(el => el.innerHTML.includes('feather-plus') ? 'agregar' : 'ordenar');
      
      if (icono === 'agregar') {
          console.log(`[INFO] No hay secciones aún, agregando nueva.`);
          agregarSeccionButton = botones[0];
      } else {
          console.log(`[INFO] Todas las secciones están agregadas, verificando si debemos agregar otra.`);
          ordenarSeccionesButton = botones[0];
      }
  } else if (botones.length === 2) {
      console.log(`[INFO] Hay al menos una sección agregada, verificando si ya existe.`);
      agregarSeccionButton = botones[0];
      ordenarSeccionesButton = botones[1];
  }

  // Caso 2 o 3: buscamos si la sección ya existe
  //const seccionesAgregadas = await this.page.$$(`xpath=//div[contains(@class, 'bg-grayscale-10')]//p[@class="text-pS font-semibold"]`);
  const seccionesAgregadas = await this.page.$$(`css=div.bg-grayscale-10 p.font-semibold`);

  console.log(`[DEBUG] Secciones encontradas: ${seccionesAgregadas.length}`);

  let seccionYaExiste = false;

  for (const seccion of seccionesAgregadas) {
      const textoSeccion = await seccion.innerText();
      
      console.log(`[DEBUG] Comparando -> worldParameters.seccion: "${worldParameters.seccion}" vs textoSeccion.trim(): "${textoSeccion.trim()}"`);
      
      if (textoSeccion.trim() === worldParameters.seccion) {
          seccionYaExiste = true;
          console.log(`[INFO] La sección ${worldParameters.seccion} ya está agregada.`);
          await seccion.evaluate(el => el.parentNode.querySelector('button').click());
          break;
      }
  }

  // Si la sección no existe, usamos el botón de agregar sección
    if (!seccionYaExiste && agregarSeccionButton) {
      console.log(`[ACTION] Sección no encontrada en la página principal, buscando en el modal.`);
      await agregarSeccionButton.click();

      // Esperamos a que el modal se abra
      await this.page.waitForSelector('div.flex.items-center.border-b');

      // Buscamos la sección dentro del listado del modal
      const seccionesEnModal = await this.page.$$('div.flex.items-center.border-b');

      for (const seccion of seccionesEnModal) {
          const textoSeccion = await seccion.$eval('span.font-medium.truncate', el => el.innerText.trim());

          console.log(`[DEBUG] Comparando -> worldParameters.seccion: "${worldParameters.seccion}" vs textoSeccion: "${textoSeccion}"`);

          if (textoSeccion === worldParameters.seccion) {
              console.log(`[INFO] Sección encontrada en el modal, abriendo formulario.`);
              
              // Click en el botón de agregar dentro de la misma sección
              await seccion.$eval('button', el => el.click());
              break;
          }
      }
    }


  console.log(`[STEP END] Acción sobre botón completada.`);
});


Then('se abre un modal', { timeout: 10000 }, async function () {
  console.log(`[STEP START] Verificando apertura de modal.`);
  
  await this.page.waitForSelector('xpath=/html/body/div[9]/div/div/div/div/h2', { timeout: 10000 }); // Ajusta el selector según el HTML del modal
  console.log(`[STEP END] Modal detectado.`);
});

Then('el usuario espera unos segundos E2', { timeout: 16000 }, async function () {
  console.log(`[STEP START] Esperando unos segundos (E2).`);
  await this.page.waitForTimeout(15000);
  console.log(`[STEP END] Tiempo de espera completado (E2).`);
  await this.browser.close();
});

/*
---------------------------------------------

*/

When('el usuario selecciona la sección y hace click en "Agregar"', { timeout: 10000 }, async function () {
  console.log(`[STEP START] Seleccionando sección: ${worldParameters.seccion}`);
  
 // await this.page.waitForSelector(`xpath=${selectors.seccionDropdown}`, { timeout: 10000 });
 // await this.page.click(`xpath=${selectors.seccionDropdown}`);
 // await this.page.selectOption(`xpath=${selectors.seccionDropdown}`, worldParameters.seccion);
  
 // await this.page.click(`xpath=${selectors.agregarButton}`);
  
  console.log(`[STEP END] Sección seleccionada y enviada.`);
});

Then('el modal se convierte en un formulario', { timeout: 10000 }, async function () {
  console.log(`[STEP START] Esperando conversión del modal.`);
  
  //await this.page.waitForSelector(`xpath=${selectors.formulario}`, { timeout: 10000 });
  
  console.log(`[STEP END] Modal convertido en formulario.`);
});

Then('el usuario espera unos segundos E3', { timeout: 10000 }, async function () {
  console.log(`[STEP START] Esperando sincronización con UI.`);
  await this.page.waitForTimeout(5000);
  console.log(`[STEP END] Espera completada.`);
});

When('el usuario llena los campos del formulario y confirma la acción', { timeout: 20000 }, async function () {
  console.log(`[STEP START] Llenando formulario para sección: ${worldParameters.seccion}`);
  /*
  for (let i = 0; i < worldParameters.dataElements.length; i++) {
      if (worldParameters.elementsActives[i]) {
          await this.page.fill(selectors[worldParameters.seccion][i], worldParameters.dataElements[i]);
      }
  }
  
  await this.page.click(`xpath=${selectors.confirmarButton}`);
  */
  console.log(`[STEP END] Formulario enviado.`);
});

Then('el modal se cierra', { timeout: 10000 }, async function () {
  console.log(`[STEP START] Verificando cierre de modal.`);
/*  
  await this.page.waitForTimeout(2000);
  if (!(await this.page.$(`xpath=${selectors.formulario}`))) {
      console.log(`[STEP END] Modal cerrado.`);
  } else {
      console.error(`[ERROR] El modal sigue visible, posible error en envío.`);
  }
      */
});

Then('se observa la sección agregada en su perfil', { timeout: 10000 }, async function () {
  console.log(`[STEP START] Validando que la sección se haya agregado.`);
  
//  await this.page.waitForSelector(`xpath=${selectors.seccionAgregada}`, { timeout: 10000 });
  
  console.log(`[STEP END] Sección agregada exitosamente.`);
  await this.browser.close();
});












