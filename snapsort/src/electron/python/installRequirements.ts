import { spawnSync } from 'child_process';

import { requirementsPath, pythonPath } from './paths.js';

/**
 * Check if a Nvidia GPU is detected on the system.
 * @description This function attempts to run the `nvidia-smi` command to check for the presence of an Nvidia GPU. If the command executes successfully, it indicates that an Nvidia GPU is present.
 * @returns {boolean} true if an Nvidia GPU is detected, false otherwise.
 */
function hasNvidiaGpu(): boolean {
    try {
        const result = spawnSync('nvidia-smi', [], { stdio: 'ignore' });
        return result.status === 0;
    } catch {
        return false;
    }
}

export async function installRequirements() {
    try {
        console.log('➡ Installation des dépendances...');
        spawnSync(pythonPath, ['-m', 'pip', 'install', '-r', requirementsPath], { stdio: 'inherit' });
        if (hasNvidiaGpu()) {
            console.log('Installation de torch avec CUDA 12.6 (GPU Nvidia détecté)...');
            spawnSync(pythonPath, ['-m', 'pip', 'install', 'torch', 'torchvision', 'torchaudio', '--index-url', 'https://download.pytorch.org/whl/cu126'], { stdio: 'inherit' });
        } else {
            console.log('No Nvidia GPU detected');
        }
    } catch (err) {
        console.error('❌ Erreur durant l\'installation des dépendances :', err);
        return;
    }
}