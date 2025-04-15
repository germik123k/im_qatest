const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc, getDoc, updateDoc } = require("firebase/firestore");

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

// Endpoint ya existente para ejecutar tests
app.post('/run-tests', async (req, res) => {

    // Generamos un UUID para la ejecución
    const uuid = `${req.body.fileName}_${Date.now()}`;
    req.body.uuid = uuid;
    var errorDB = true;

    try {
 

        // Guardamos en Firebase el estado "procesando"
        await setDoc(doc(db, "estado_test", uuid), {
            name_feature: req.body.fileName,
            estado: "procesando",
            user: req.body.user,
            fecha: new Date().toISOString(),
            ambiente: req.body.env,
            version: req.body.version,
            logs: [],
            uuid: uuid
        });
        errorDB = false;
        //res.json({ message: "Test iniciado", uuid });

    } catch (error) {
        console.error("Error al registrar estado en Firebase:", error);
        res.status(500).json({ error: "Error al registrar estado en Firebase" });
    }

    if(!errorDB){

    validarArchivos(req.body);
    var command = `npx cucumber-js --require ./tests/${req.body.env}/${vercionPathG}/step-definitions/${fileStepG} ./tests/prod_actual/${vercionPathG}/features/${fileFeatureG}`;

    exec(command, (error, stdout, stderr) => {
        resultadoDeTest(req.body.uuid, req.body.fileName, error, stdout, stderr);
    });
            

        var resp = req.body;
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


// Nuevo endpoint para listar archivos en la carpeta de features
app.post('/list-files', (req, res) => {

    const env = req.body.env || 'prod_actual';
    const version = req.body.version ? req.body.version : 'Base';
    
    const dirPath = path.join(__dirname, 'tests', env, 'Base/features');
    const dirPath2 = path.join(__dirname, 'tests', env);
    
    let directorios = [];
    
    // Primero, leemos la carpeta que contiene las versiones
    fs.readdir(dirPath2, (err, items) => {
        if (err) {
            console.error(`Error al leer el directorio ${dirPath2}:`, err);
            return res.status(500).send({ error: "Error al leer el directorio" });
        }
        
        // Mapeamos cada item a una promesa que resuelve si es directorio
        const statPromises = items.map(item => {
            let itemPath = path.join(dirPath2, item);
            return new Promise((resolve, reject) => {
                fs.stat(itemPath, (err, stats) => {
                    if (err) {
                        return reject(err);
                    }
                    if (stats.isDirectory()) {
                        directorios.push(item);
                    }
                    resolve();
                });
            });
        });
        
        // Esperamos a que todas las promesas se resuelvan
        Promise.all(statPromises)
            .then(() => {
                // Ahora, directorios tiene todos los directorios encontrados.
                console.log('directorios final:', JSON.stringify(directorios));
                // Podrías también leer los archivos de la carpeta de features
                fs.readdir(dirPath, (err, files) => {
                    if (err) {
                        console.error(`Error al leer el directorio ${dirPath}:`, err);
                        return res.status(500).send({ error: "Error al leer el directorio de tests" });
                    }
                    let tests = files;
                    // Ahora enviamos la respuesta sólo cuando todo ya se haya completado
                    res.json({ test: tests, versiones: directorios });
                });
            })
            .catch(err => {
                console.error("Error en las promesas:", err);
                res.status(500).send({ error: "Error obteniendo directorios" });
            });
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
