// import { Console } from 'console';
// import { getScriptsPath } from './pathResolver.js';
// import { spawn } from 'child_process';
// import fs from 'fs';
// import path from 'path';

// async function setupPythonEnv() {
//   // 1. Télécharger Python embeddable si pas présent
//   if (!fs.existsSync(pythonExe)) {
//     console.log('➡ Téléchargement de Python embeddable...');
//     await downloadAndExtractPythonEmbed();
//   }

//   // 2. Créer venv si nécessaire
//   if (!fs.existsSync(path.join(venvDir, 'Scripts', 'activate.bat'))) {
//     console.log('➡ Création du venv...');
//     // Petit hack : utiliser un Python global temporairement pour créer le venv
//     try {
//       execSync(`python -m venv "${venvDir}"`, { stdio: 'inherit' });
//     } catch (err) {
//       console.error('❌ Erreur création venv. Python doit être installé globalement une première fois.');
//       return;
//     }
//   }

//   // 3. Installer requirements.txt
//   console.log('➡ Installation des dépendances...');
//   const pipPath = path.join(venvDir, 'Scripts', 'pip.exe');
//   const result = spawnSync(pipPath, ['install', '-r', requirementsPath], { stdio: 'inherit' });

//   if (result.status !== 0) {
//     console.error('❌ Erreur pip install');
//   } else {
//     console.log('✅ Environnement Python prêt !');
//   }
// }

// export const runPythonFile = ({directory, destination_directory}: { directory: string; destination_directory: string }) => {
//     return new Promise((resolve, reject) => {
//         const pythonScript = getScriptsPath('python/main.py');

//         // Ajout des arguments à la commande spawn
//         const args = [
//             pythonScript,
//             '--directory', directory,
//             '--destination_directory', destination_directory,
//         ];

//         const pythonProcess = spawn('python', args);

//         let output = '';
//         let error = '';

//         pythonProcess.stdout.on('data', (data) => {
//         output += data.toString();
//         });

//         pythonProcess.stderr.on('data', (data) => {
//         error += data.toString();
//         });

//         pythonProcess.on('close', (code) => {
//         if (code === 0) {
//             resolve(output.trim());
//         } else {
//             reject(`Python error: ${error.trim()}`);
//         }
//         });
//     });
// }