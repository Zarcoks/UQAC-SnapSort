import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";

export function isDev() {
  return process.env.NODE_ENV === 'development';
}

// Fonction pour nettoyer le dossier temp
export function cleanTempFolder(directoryPath: string, tempDirectoryPath: string): void {

  if (fs.existsSync(tempDirectoryPath)) {
    // fs.readdirSync(tempDirectoryPath).forEach(file => {
    //   fs.unlinkSync(path.join(tempDirectoryPath, file));
    // });
  } else {
    fs.mkdirSync(tempDirectoryPath);
  }
}

// Fonction pour générer une miniature avec ffmpeg
export function generateThumbnail(videoPath: string, tempDirectoryPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // S'assurer que le dossier temp existe
    if (!fs.existsSync(tempDirectoryPath)) {
      fs.mkdirSync(tempDirectoryPath, { recursive: true });
    }
    
    // Extraire le nom du fichier sans extension
    const baseName = path.basename(videoPath, path.extname(videoPath));
    const thumbnailPath = path.join(tempDirectoryPath, `${baseName}.jpg`);

    ffmpeg(videoPath)
      .screenshots({
        timestamps: ["1%"], // Capture à 1% de la vidéo
        filename: `${baseName}.jpg`, // Utiliser le nom sans extension
        folder: tempDirectoryPath,
        size: "320x240",
      })
      .on("end", () => resolve(thumbnailPath))
      .on("error", err => reject(err));
  });
}