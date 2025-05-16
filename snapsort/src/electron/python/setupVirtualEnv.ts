import { spawnSync } from 'child_process';
import { pythonEmbedPath, venvDir } from './paths.js';

export async function setupVirtualEnv() {
    try {
        console.log('➡ Création du venv...');
        spawnSync(pythonEmbedPath, ['-m', 'venv', venvDir], { stdio: 'inherit' });
    } catch (err) {
        console.error('❌ Erreur pip install');
        return;
    }
}