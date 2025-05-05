// Importa Firebase correctamente
const { initializeApp } = require("firebase/app");
const { getFirestore, updateDoc, doc } = require("firebase/firestore");

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAcAYZ1JYGs5yqFDataBLwn3yw",
    authDomain: "tienda-65655.firebaseapp.com",
    projectId: "tienda-65655",
    storageBucket: "tienda-65655.firebasestorage.app",
    messagingSenderId: "968578468430",
    appId: "1:968578468430:web:d3487d1139777b1954d11f"
};

// Inicializa Firebase correctamente
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

async function updateTestState(uuid, stepName, progressPercent, status) {
    try {
        await updateDoc(doc(db, "estado_test", uuid), {
            estado: status,
            progreso: progressPercent,
            step_actual: stepName,
            timestamp: new Date().toISOString()
        });
        console.log(`[PROGRESO] Estado actualizado: Step '${stepName}', progreso: ${progressPercent}%`);
    } catch (error) {
        console.error(`[ERROR] Fallo al actualizar progreso en Firebase:`, error);
    }
}

module.exports = { updateTestState };
