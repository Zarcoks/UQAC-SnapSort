import fs from 'fs';
import path from 'path';

// Fonction récursive pour obtenir les dossiers
export const getFolders = (folderPath: string): any[] => {
    try {
        return fs.readdirSync(folderPath).map((file) => {
            const fullPath = path.join(folderPath, file);
            if (fs.statSync(fullPath).isDirectory()) {
                return {
                    name: file,
                    path: fullPath,
                    children: getFolders(fullPath) // Appel récursif pour les sous-dossiers
                };
            }
            return null;
        }).filter(Boolean); // Enlève les valeurs null (fichiers)
    } catch (error) {
        console.error("Erreur lecture dossiers:", error);
        return [];
    }
};