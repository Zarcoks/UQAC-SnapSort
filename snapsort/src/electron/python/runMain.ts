import fs from 'fs';

import { spawn } from 'child_process';
import { pythonScript, pythonPath } from './paths.js';
import { RunPythonOptions } from '../types/interfaces.js';

export const runPythonFile = ({ directory, destination_directory, onLog, onError }: RunPythonOptions) => {
  return new Promise((resolve, reject) => {

    // Check if the Python script exists
    if (!fs.existsSync(pythonScript)) {
      return reject(`Le script Python n'existe pas à ce chemin : ${pythonScript}`);
    }

    // Create the command to run the Python script
    const args = [
      '-u', // unbuffered
      pythonScript,
      '--directory', directory,
      '--destination_directory', destination_directory,
    ];

    // Run the Python script
    const pythonProcess = spawn(pythonPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });

    // ---- Handle the output and error streams ----
    pythonProcess.stdout.setEncoding('utf8');
    pythonProcess.stderr.setEncoding('utf8');
    let output = '';
    let error = '';

    // Stdout
    pythonProcess.stdout.on('data', (data) => {
      output += data;
      console.log(`[PYTHON]: ${data}`);
      if (onLog) onLog(data);
    });

    // Stderr
    pythonProcess.stderr.on('data', (data) => {
      error += data;
      console.error(`[PYTHON ERROR]: ${data}`);
      if (onError) onError(data);
    });

    // Handle process exit
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        resolve(output.trim());
      } else {
        reject(`Python error (code ${code}): ${error.trim()}`);
      }
    });
  });
};
