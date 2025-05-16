import path from 'path';
import fs from 'fs';
import https from 'https';
import unzipper from 'unzipper';
import { pythonRootDir, pythonDir } from './paths.js';

export async function installPython() {
    const url = 'https://www.python.org/ftp/python/3.12.10/python-3.12.10-amd64.zip';
    const zipPath = path.join(pythonRootDir, 'python-3.12.10.zip');

    console.log('➡ Téléchargement de Python (python-3.12.10-amd64.zip)...');

    const file = fs.createWriteStream(zipPath);
    await new Promise((resolve, reject) => {
        https.get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
            file.close(resolve);
        });
        }).on('error', reject);
    });

    console.log('✅ Python téléchargé.');
    console.log('➡ Extraction de Python...');

    // Extraire dans le bon dossier
    await fs.createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: pythonDir }))
        .promise();
    // Supprimer le zip après extraction
    fs.unlinkSync(zipPath);

    console.log('✅ Python extrait.');
}