// python.ts
import fs from 'fs';
import { spawn } from 'child_process';
import { pythonScript, pythonPath } from './paths.js';

interface RunPythonOptions {
  directory: string;
  destination_directory: string;
  onLog?: (data: string) => void;
  onError?: (data: string) => void;
}

export const runPythonFile = ({ directory, destination_directory, onLog, onError }: RunPythonOptions) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(pythonScript)) {
      return reject(`Le script Python n'existe pas à ce chemin : ${pythonScript}`);
    }

    const args = [
      '-u', // unbuffered
      pythonScript,
      '--directory', directory,
      '--destination_directory', destination_directory,
    ];

    const pythonProcess = spawn(pythonPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    pythonProcess.stdout.setEncoding('utf8');
    pythonProcess.stderr.setEncoding('utf8');

    let output = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data;
      console.log(`[PYTHON]: ${data}`);
      if (onLog) onLog(data);
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data;
      console.error(`[PYTHON ERROR]: ${data}`);
      if (onError) onError(data);
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        resolve(output.trim());
      } else {
        reject(`Python error (code ${code}): ${error.trim()}`);
      }
    });
  });
};
