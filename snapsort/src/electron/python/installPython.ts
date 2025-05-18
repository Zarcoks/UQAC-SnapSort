import path from 'path';
import fs from 'fs';
import https from 'https';
import unzipper from 'unzipper';
import { pythonRootDir, pythonDir } from './paths.js';
import { SetupPythonSchema } from '../types/interfaces.js';

export async function installPython({ onLog, onError }: SetupPythonSchema) {
    const url = 'https://www.python.org/ftp/python/3.12.10/python-3.12.10-amd64.zip';
    const zipPath = path.join(pythonRootDir, 'python-3.12.10.zip');

    if (onLog) onLog('➡ Téléchargement de Python (python-3.12.10-amd64.zip)...');

    const file = fs.createWriteStream(zipPath);
    await new Promise((resolve, reject) => {
        https.get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
            file.close(resolve);
        });
        }).on('error', reject);
    });

    if (onLog) onLog('✅ Python téléchargé.');
    if (onLog) onLog('➡ Extraction de Python...');

    // Extraire dans le bon dossier
    await fs.createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: pythonDir }))
        .promise();
    // Supprimer le zip après extraction
    fs.unlinkSync(zipPath);

    if (onLog) onLog('✅ Python extrait.');
}