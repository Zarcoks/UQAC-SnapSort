import path from 'path';
import { spawnSync } from 'child_process';
import { requirementsPath, venvDir } from './paths.js';

export async function installRequirements() {
    try {
        console.log('➡ Installation des dépendances...');
        const pipPath = path.join(venvDir, 'Scripts', 'pip.exe');
        spawnSync(pipPath, ['install', '-r', requirementsPath], { stdio: 'inherit' });
    } catch (err) {
        console.error('❌ Erreur création venv. Python doit être installé globalement une première fois.');
        return;
    }
}