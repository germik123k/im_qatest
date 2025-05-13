const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const dns = require('dns').promises; // Usamos la versión con promesas

const port = 3000;



const { initializeApp } = require("firebase/app");
const { getFirestore, query, where, doc, setDoc, getDoc, collection, addDoc, getDocs, updateDoc, deleteDoc } = require("firebase/firestore");




// Endpoint ya existente para ejecutar tests
const { exec } = require('child_process');
const { chromium } = require('playwright');


// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAcAYZ1JYGs5yqFDataBLwn3yw",
    authDomain: "tienda-65655.firebaseapp.com",
    projectId: "tienda-65655",
    storageBucket: "tienda-65655.firebasestorage.app",
    messagingSenderId: "968578468430",
    appId: "1:968578468430:web:d3487d1139777b1954d11f"
  };
  
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
var fileStepG = '';
var fileFeatureG='';
var vercionPathG='';


app.use(cors());
app.use(express.json());




app.post('/run-tests', async (req, res) => {
    const uuid = `${req.body.fileName}_${Date.now()}`;
    req.body.uuid = uuid;
    let errorDB = true;
    console.log('entro 123');
    try {
        // Guardar el estado "procesando" en Firebase
        await setDoc(doc(db, "estado_test", uuid), {
            name_feature: req.body.fileName,
            estado: "procesando",
            user: req.body.user,
            fecha: new Date().toISOString(),
            ambiente: req.body.env,
            version: req.body.version,
            logs: [],
            uuid: uuid,
            progreso: 0, // Iniciamos en 0% de completitud
            step_actual: "Inicializando test...", // Indica el inicio del proceso
            timestamp: new Date().toISOString() // Marca de tiempo inicial
        });
        
        errorDB = false;
    } catch (error) {
        console.error("Error al registrar estado en Firebase:", error);
        return res.status(500).json({ error: "Error al registrar estado en Firebase" });
    }

    if (!errorDB) {
        validarArchivos(req.body);

        const objParamFeature = req.body.parametros.objParamFeature;
        const objParamFeature2 = req.body.parametros.objParamFeature2;
        
        let finalParams;
        if (Object.keys(objParamFeature2).length > 0) {
            finalParams = Object.entries(objParamFeature2).reduce((acc, [key, value]) => {
                acc[key] = value.value; // Extraemos solo `value`
                return acc;
            }, {});
        } else {
            finalParams = objParamFeature;
        }
        console.log('finalParams:', finalParams);
        
        finalParams.uuid = uuid;
        let categoria = ''
        if(req.body.categoria != 'general')categoria = req.body.categoria + '/';
        const jsonFileName = path.join(__dirname, `./tests/${req.body.env}/${vercionPathG}/features/${categoria}${req.body.fileName.replace('.feature', '.json')}`);
        fs.writeFileSync(jsonFileName, JSON.stringify(finalParams, null, 2), 'utf8');
        console.log(`Parámetros guardados en: ${jsonFileName}`);

        const command = `npx cucumber-js --require ./tests/${req.body.env}/${vercionPathG}/step-definitions/${categoria}${fileStepG} ./tests/${req.body.env}/${vercionPathG}/features/${categoria}${fileFeatureG}`;
        console.log(command);
        

        // Ejecutar el comando
        exec(command, async (error, stdout, stderr) => {
            let browser;
            try {
                browser = await chromium.launch({ headless: true, args: ['--disable-gpu', '--no-sandbox'] });
                const context = await browser.newContext();
                const page = await context.newPage();

                // Lógica actual para ejecutar los tests
                resultadoDeTest(req.body.uuid, req.body.fileName, error, stdout, stderr);
            } catch (err) {
                console.error('Error durante la ejecución:', err);
            } finally {
                if (browser) await browser.close();
            }
        });

        const resp = req.body;
        resp.errorDB = errorDB;
        res.json({ respS: resp });
    }
});

app.post('/get-registro-test', async (req, res) => {
    const { uuid } = req.body;

    if (!uuid) {
        return res.status(400).json({ error: "Falta el UUID en la solicitud" });
    }

    try {
        // Buscar el documento en Firebase
        const docRef = doc(db, "estado_test", uuid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // Devolver el estado actual
            res.json({ registro: docSnap.data() });
        } else {
            res.status(404).json({ error: "Registro no encontrado" });
        }
    } catch (error) {
        console.error("Error al consultar el test:", error);
        res.status(500).json({ error: "Error al obtener el registro" });
    }
});




app.post('/list-files', async (req, res) => {
    const env = req.body.env || 'prod_actual';
    const baseDir = path.join(__dirname, 'tests', env, 'Base/features');
    let categorias = { "general": {} }; // Inicializamos "general" para archivos sin categoría

    try {
        const dirs = await fs.promises.readdir(baseDir, { withFileTypes: true });

        for (const dir of dirs) {
            if (dir.isDirectory()) {
                const categoria = dir.name;
                categorias[categoria] = {};

                const featureFiles = await fs.promises.readdir(path.join(baseDir, categoria));

                for (const file of featureFiles) {
                    if (file.endsWith('.feature')) {
                        const filePath = path.join(baseDir, categoria, file);
                        const fileContent = await fs.promises.readFile(filePath, 'utf-8');

                        const paramMatches = fileContent.match(/#PARAMS:(.*)/);
                        let parametros = paramMatches ? JSON.parse(paramMatches[1].trim()) : {};

                        categorias[categoria][file] = parametros;
                    }
                }
            } else if (dir.isFile() && dir.name.endsWith('.feature')) {
                // Archivos directamente en 'Base/features/' van en la categoría "general"
                const filePath = path.join(baseDir, dir.name);
                const fileContent = await fs.promises.readFile(filePath, 'utf-8');

                const paramMatches = fileContent.match(/#PARAMS:(.*)/);
                let parametros = paramMatches ? JSON.parse(paramMatches[1].trim()) : {};

                categorias["general"][dir.name] = parametros;
            }
        }

        res.json({ categorias, versiones:[] });

    } catch (error) {
        console.error("Error en la lectura de archivos o directorios:", error);
        res.status(500).send({ error: "Error obteniendo datos" });
    }
});



app.post('/list-files2', (req, res) => {
    const env = req.body.env || 'prod_actual';
    const version = req.body.version || 'Base';

    const dirPath = path.join(__dirname, 'tests', env, 'Base/features');
    const dirPath2 = path.join(__dirname, 'tests', env);

    let directorios = [];
    let objectParam = {}; // Almacena los parámetros agrupados por archivo
    let arryFiles = [];

    fs.readdir(dirPath2, async (err, items) => {
        if (err) {
            console.error(`Error al leer el directorio ${dirPath2}:`, err);
            return res.status(500).send({ error: "Error al leer el directorio" });
        }

        const statPromises = items.map(item => {
            let itemPath = path.join(dirPath2, item);
            return new Promise((resolve, reject) => {
                fs.stat(itemPath, (err, stats) => {
                    if (err) return reject(err);
                    if (stats.isDirectory()) directorios.push(item);
                    resolve();
                });
            });
        });

        try {
            await Promise.all(statPromises);

            fs.readdir(dirPath, async (err, files) => {
                if (err) {
                    console.error(`Error al leer el directorio ${dirPath}:`, err);
                    return res.status(500).send({ error: "Error al leer el directorio de tests" });
                }

                for (let file of files) {
                    if (file.endsWith('.feature')) {
                        arryFiles.push(file);

                        const fileContent = fs.readFileSync(path.join(dirPath, file), 'utf-8');

                        // Extraer comentarios con parámetros (Ejemplo: #PARAMS: {"user":"juan", "pass":"abc123"})
                        const paramMatches = fileContent.match(/#PARAMS:(.*)/g);
                        if (paramMatches) {
                            objectParam[file] = {}; // Asegurar clave en objectParam
                            paramMatches.forEach(param => {
                                try {
                                    const parsedParam = JSON.parse(param.replace('#PARAMS:', '').trim());
                                    objectParam[file]=parsedParam;
                                } catch (error) {
                                    console.error(`Error al parsear parámetros en ${file}:`, error);
                                }
                            });
                        }
                    }
                }

                res.json({ test: arryFiles, versiones: directorios, parametros: objectParam });
            });

        } catch (error) {
            console.error("Error en la lectura de archivos o directorios:", error);
            res.status(500).send({ error: "Error obteniendo datos" });
        }
    });
});



app.post('/read-file-feature', (req, res) => {
    const fileName = req.body.fileName;
    const env = req.body.env || 'defaultEnv';
    const version = req.body.version || 'Base';

    if (!fileName) {
        return res.status(400).json({ error: "Falta el nombre del archivo" });
    }

    try {
        const dirPath = path.join(__dirname, 'tests', env, 'Base/features', fileName);

        // Validamos que el archivo exista antes de leerlo
        if (!fs.existsSync(dirPath)) {
            return res.status(404).json({ error: "El archivo no existe" });
        }

        // Leemos el archivo línea por línea y lo almacenamos en un array
        const fileLines = fs.readFileSync(dirPath, 'utf-8').split('\n');

        res.json({ fileLines, dirPath });
    } catch (error) {
        console.error("Error leyendo el archivo:", error);
        res.status(500).json({ error: "Error procesando el archivo" });
    }
});


app.post('/delete-documents', async (req, res) => {
    const { coleccion } = req.body; // Extraemos la colección desde el request
    if (!coleccion) {
        return res.status(400).json({ error: "La colección no fue especificada." });
    }
    console.error("coleccion:", coleccion);
    try {
        // Accedemos a la colección y obtenemos todos los documentos
        const snapshot = await getDocs(collection(db, coleccion));
        
        const promises = [];
        snapshot.forEach((docSnap) => {
            // Recorremos cada documento y lo eliminamos
            promises.push(deleteDoc(doc(db, coleccion, docSnap.id)));
        });

        await Promise.all(promises); // Ejecutamos todas las eliminaciones de manera paralela
        res.status(200).json({ message: `Todos los documentos de la colección '${coleccion}' fueron eliminados.` });
    } catch (error) {
        console.error("Error al eliminar documentos:", error);
        res.status(500).json({ error: "Error al eliminar documentos en Firebase." });
    }
});



app.post("/load-work-space", async (req, res) => {
    try {
        const { espacioName } = req.body;

        // Validación básica
        if (!espacioName || espacioName === "default") {
            return res.status(400).send({ error: "El nombre del espacio de trabajo no es válido." });
        }

        // Referencia a la colección de Firebase
        const workspaceCollection = collection(db, "espacio_de_trabajo");

        // Consulta filtrada para encontrar el espacio de trabajo por nombre
        const q = query(workspaceCollection, where("workspaceName", "==", espacioName));
        const querySnapshot = await getDocs(q);

        // Verificar si se encontró el espacio de trabajo
        if (querySnapshot.empty) {
            return res.status(404).send({ message: "No se encontró el espacio de trabajo." });
        }

        // Obtener el primer documento encontrado (Firebase permite varios, pero trabajaremos con uno)
        const workspaceData = querySnapshot.docs[0].data();

        // Responder con los datos del espacio de trabajo
        res.status(200).send(workspaceData);
    } catch (error) {
        console.error("Error al cargar espacio de trabajo:", error);
        res.status(500).send({ error: "Hubo un error al cargar el espacio de trabajo." });
    }
});





app.post("/delete-work-space", async (req, res) => {
    try {
        const { espacioName } = req.body;

        // ✅ Validación básica
        if (!espacioName || espacioName.trim().length < 3) {
            return res.status(400).send({ error: "El nombre del espacio de trabajo no es válido." });
        }

        // ✅ Referencia a la colección de Firebase
        const workspaceCollection = collection(db, "espacio_de_trabajo");

        // ✅ Buscar el documento con el nombre proporcionado
        const q = query(workspaceCollection, where("workspaceName", "==", espacioName));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return res.status(404).send({ error: "El espacio de trabajo no existe." });
        }

        // ✅ Eliminar el documento encontrado
        for (const doc of querySnapshot.docs) {
            await deleteDoc(doc.ref);
            console.log(`Espacio de trabajo eliminado: ${doc.id}`);
        }

        // ✅ Obtener la lista actualizada de espacios
        const updatedSnapshot = await getDocs(collection(db, "espacio_de_trabajo"));
        const updatedWorkspaceNames = updatedSnapshot.docs
        .map(doc => doc.data().workspaceName)
        .filter(name => name); // Filtra valores undefined o null
    

        // ✅ Respuesta al frontend con la lista actualizada
        res.status(200).send({
            espacioNameDelete: espacioName,
            workspacesUpdated: updatedWorkspaceNames
        });

    } catch (error) {
        console.error("Error al eliminar espacio de trabajo:", error);
        res.status(500).send({ error: "Hubo un error al eliminar el espacio de trabajo." });
    }
});


app.post("/save-work-space", async (req, res) => {
    try {
        const {
            workspaceName,
            entorno,
            version,
            user,
            objParamFeature,
            objParamFeature2,
            arrListFeaturesProc,
            arrListFeatures
        } = req.body;

        // Validación básica de datos
        if (!workspaceName || workspaceName.length < 3 || workspaceName.length > 50) {
            return res.status(400).send({ error: "El nombre del espacio de trabajo no es válido." });
        }

        // Referencia a la colección en Firebase
        const workspaceCollection = collection(db, "espacio_de_trabajo");

        // Optimización: Buscar y eliminar documentos duplicados usando una consulta filtrada
        const q = query(workspaceCollection, where("workspaceName", "==", workspaceName));
        const querySnapshot = await getDocs(q);

        // Eliminar documentos duplicados si existen
        for (const doc of querySnapshot.docs) {
            await deleteDoc(doc.ref);
            console.log(`Espacio de trabajo duplicado eliminado: ${doc.id}`);
        }

        // Crear el nuevo objeto para guardar en Firebase
        const workspaceData = {
            workspaceName,
            entorno,
            version,
            user,
            objParamFeature: JSON.parse(objParamFeature), // Parsear de texto a objeto
            objParamFeature2: JSON.parse(objParamFeature2), // Parsear de texto a objeto
            arrListFeaturesProc: JSON.parse(arrListFeaturesProc), // Parsear de texto a array
            arrListFeatures: JSON.parse(arrListFeatures), // Parsear de texto a array
            timestamp: new Date().toISOString() // Agregar marca de tiempo
        };

        // Guardar el nuevo espacio de trabajo
        const docRef = await addDoc(workspaceCollection, workspaceData);

        // Enviar respuesta exitosa
        res.status(200).send({ message: "Espacio de trabajo guardado exitosamente.", id: docRef.id });
    } catch (error) {
        console.error("Error al guardar espacio de trabajo:", error);
        res.status(500).send({ error: "Hubo un error al guardar el espacio de trabajo." });
    }
});





app.post("/get-workspaces", async (req, res) => {
    try {
        const { user } = req.body;

        // Validación básica
        if (!user) {
            return res.status(400).send({ error: "El usuario no fue proporcionado." });
        }

        // Referencia a la colección de Firebase
        const workspaceCollection = collection(db, "espacio_de_trabajo");

        // Consulta filtrada para obtener los espacios de trabajo del usuario
        const q = query(workspaceCollection, where("user", "==", user));
        const querySnapshot = await getDocs(q);

        // Recopilar los nombres de espacios de trabajo
        const workspaceNames = [];
        querySnapshot.forEach((doc) => {
            workspaceNames.push(doc.data().workspaceName);
        });

        // Responder con los nombres de espacios de trabajo
        if (workspaceNames.length > 0) {
            res.status(200).send(workspaceNames);
        } else {
            res.status(404).send({ message: "No se encontraron espacios de trabajo para este usuario." });
        }
    } catch (error) {
        console.error("Error al obtener espacios de trabajo:", error);
        res.status(500).send({ error: "Hubo un error al obtener los espacios de trabajo." });
    }
});



async function domainExists(domain) {
    try {
        await dns.resolve(domain); // Verifica si el dominio realmente existe
        return true;
    } catch {
        return false; // Si falla, el dominio no existe
    }
}

app.post('/checkEmail', async (req, res) => {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: "Formato de email inválido." });
    }

    const domain = email.split('@')[1];

    try {
        const exists = await domainExists(domain);
        if (!exists) {
            return res.json({ valid: false, message: `El dominio ${domain} NO existe.` });
        }

        const addresses = await dns.resolveMx(domain);
        if (addresses.length && addresses.some(mx => mx.exchange)) {
            res.json({ valid: true, message: `El dominio ${domain} tiene registros MX: ${addresses.map(mx => mx.exchange).join(', ')}` });
        } else {
            res.json({ valid: false, message: `El dominio ${domain} NO tiene registros MX válidos.` });
        }
    } catch (error) {
        res.json({ valid: false, message: `Error al verificar el dominio ${domain}: ${error.message}` });
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

function validarArchivos(reqBody) {
    // Extraer el nombre del step-definition a partir del fileName
    fileFeatureG = reqBody.fileName;
    fileStepG = fileFeatureG.split('.')[0] + '.js'; // login.feature → login.js

    // Ruta de la versión solicitada
    const rutaVersion = `./tests/${reqBody.env}/${reqBody.version}/features`;
    
    // Ruta alternativa (Base) si la versión no existe
    const rutaBase = `./tests/${reqBody.env}/Base/features`;

    // Validamos si la rutaVersion existe
    if (fs.existsSync(rutaVersion)) {
        vercionPathG = reqBody.version;
    } else {
        vercionPathG = "Base"; // Usamos Base si la versión no está disponible
    }

    console.log(`Validación completa -> Step: ${fileStepG}, Feature: ${fileFeatureG}, Path: ${vercionPathG}`);
}


async function resultadoDeTest(uuid, fileName, error, stdout, stderr) {
    try {
        let estadoFinal = "completado"; // Estado por defecto
        let logs = [];

        if (error || stderr) {
            estadoFinal = "error"; // Si hubo un fallo, marcamos como error
            logs.push(error ? error.toString() : stderr.toString());
        } else {
            logs.push(stdout.toString());
        }

        // Actualizar el estado y agregar logs en Firebase
        await updateDoc(doc(db, "estado_test", uuid), {
            estado: estadoFinal,
            logs: logs
        });

        console.log(`🔥 Test ${fileName} finalizado con estado: ${estadoFinal}`);
    } catch (err) {
        console.error(`Error actualizando Firebase para ${fileName}:`, err);
    }


}
