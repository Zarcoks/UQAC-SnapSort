import { getScriptsPath } from './pathResolver.js';
import { spawn } from 'child_process';

export const runPipeline = ({directory, destination_directory}: { directory: string; destination_directory: string }) => {
    return new Promise((resolve, reject) => {
        const pythonScript = getScriptsPath('LLM_pipeline.py');

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