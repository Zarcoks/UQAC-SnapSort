import fs from 'fs';
import { spawn } from 'child_process';
import { pythonScript } from './paths.js';

export const runPythonFile = ({directory, destination_directory}: { directory: string; destination_directory: string }) => {
    return new Promise((resolve, reject) => {

        // Vérifier que le script Python existe
        if (!fs.existsSync(pythonScript)) {
            return reject(`Le script Python n'existe pas à ce chemin : ${pythonScript}`);
        }

        // Ajout des arguments à la commande spawn
        const args = [
            pythonScript,
            '--directory', directory,
            '--destination_directory', destination_directory,
        ];

        const pythonProcess = spawn('python', args);

        let output = '';
        let error = '';

        pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
        });

        pythonProcess.on('close', (code) => {
        if (code === 0) {
            resolve(output.trim());
        } else {
            reject(`Python error: ${error.trim()}`);
        }
        });
    });
}