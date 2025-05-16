import fs from 'fs';
import { pythonPath } from './paths.js';

import { installPython } from './installPython.js';
import { installRequirements } from './installRequirements.js';

export async function setupPythonEnv() {
    // 1. Télécharger Python embeddable si pas présent
    console.log('➡ Vérification de si python est installé...');
    if (!fs.existsSync(pythonPath)) {
        await installPython();
    } else {
        console.log('✅ Python déjà installé.');
    }

    // 3. Installer requirements.txt
    await installRequirements();
    console.log('✅ Environnement Python prêt !');
}