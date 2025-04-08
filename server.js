const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Endpoint ya existente para ejecutar tests
app.post('/run-tests', (req, res) => {
    const files = req.body.files;

    files.forEach(file => {
        fs.writeFileSync('params.json', JSON.stringify(file.params));
        const command = `npx cucumber-js ./features --require ./step-definitions/${file.nameFile}`;
/*
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error ejecutando ${file.nameFile}:`, error);
                res.status(500).send(`Error ejecutando ${file.nameFile}: ${error}`);
                return;
            }
            if (stderr) {
                console.error(`Error en ${file.nameFile}:`, stderr);
                res.status(500).send(`Error en ${file.nameFile}: ${stderr}`);
                return;
            }
            console.log(`Resultado de ${file.nameFile}:`, stdout);
            res.send(`Resultado de ${file.nameFile}: ${stdout}`);
        });
        */
    });
});

// Nuevo endpoint para listar archivos en la carpeta de features
app.post('/list-files', (req, res) => {
    console.log('entro ok');
    const env = req.body.env || 'prod_actual';
    const version = req.body.version ? req.body.version : 'Base';
    
    const dirPath = path.join(__dirname, 'tests', env, version, 'features');
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


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
