import fs from 'fs';
import path from 'path';
import { pythonEmbedPath, venvDir } from './paths.js';

import { installPython } from './installPython.js';
import { setupVirtualEnv } from './setupVirtualEnv.js';
import { installRequirements } from './installRequirements.js';

export async function setupPythonEnv() {
    // 1. Télécharger Python embeddable si pas présent
    console.log('➡ Vérification de si python est installé...');
    if (!fs.existsSync(pythonEmbedPath)) {
        await installPython();
    } else {
        console.log('✅ Python embeddable déjà installé.');
    }

    // 2. Créer venv si nécessaire
    console.log('➡ Vérification de si le venv est créé...');
    if (!fs.existsSync(path.join(venvDir, 'Scripts', 'activate.bat'))) {
        await setupVirtualEnv();
    } else {
        console.log('✅ venv déjà créé.');
    }

    // 3. Installer requirements.txt
    await installRequirements();
    console.log('✅ Environnement Python prêt !');
}