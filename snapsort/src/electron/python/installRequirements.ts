import path from 'path';
import { spawnSync } from 'child_process';
import { requirementsPath, pythonPath } from './paths.js';

function hasNvidiaGpu(): boolean {
    // Essaie d'exécuter nvidia-smi, retourne true si ça marche
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