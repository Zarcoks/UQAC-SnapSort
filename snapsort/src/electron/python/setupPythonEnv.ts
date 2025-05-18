import fs from 'fs';

import { pythonPath } from './paths.js';
import { installPython } from './installPython.js';
import { installRequirements } from './installRequirements.js';
import { SetupPythonSchema } from '../types/interfaces.js';

export async function setupPythonEnv({ onLog, onError }: SetupPythonSchema) {

    // 1. Download Python if not installed in local
    if (onLog) onLog('➡ Vérification de si python est installé...');
    if (!fs.existsSync(pythonPath)) {
        await installPython({ onLog, onError });
    } else {
        if (onLog) onLog('✅ Python déjà installé.');
    }

    // 2. Install dependances from requirements.txt
    await installRequirements({ onLog, onError });
    if (onLog) onLog('✅ Environnement Python prêt !');
}