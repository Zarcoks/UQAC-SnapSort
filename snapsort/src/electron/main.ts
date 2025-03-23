import {app, BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { isDev, cleanTempFolder, generateThumbnail } from './util.js';
import { getPreloadPath, getPythonScriptPath } from './pathResolver.js';
import { spawn } from 'child_process';
import store from "./store.js";

let mainWindow: BrowserWindow | null = null;

app.on('ready', () => {
  const mainWindow = new BrowserWindow({
    width: 1340,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      webSecurity: false,
      preload: getPreloadPath(),
    },
    frame: true
  });

  if (isDev()) {
    mainWindow.loadURL('http://localhost:5173');
  }
  else {
    mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'));
  }

  if (isDev()) {
    mainWindow.webContents.openDevTools();
  }
});

// Fonction pour ouvrir un dossier
// ipcMain.handle('open-directory', async () => {
//   const result = await dialog.showOpenDialog(mainWindow!, {
//     properties: ['openDirectory'],
//   });

//   if (!result.canceled && result.filePaths.length > 0) {
//     const folderPath = result.filePaths[0];
//     const files = fs.readdirSync(folderPath).filter(file => {
//       const ext = path.extname(file).toLowerCase();
//       return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
//     });
//     return { folderPath, files };
//   }
//   return null;
// });

// // Execute Python Script Handler
// ipcMain.handle('run-python', async () => {
//   return new Promise((resolve, reject) => {
//     const pythonScript = getPythonScriptPath('hello.py');

//     const pythonProcess = spawn('python', [pythonScript]);

//     let output = '';
//     let error = '';

//     pythonProcess.stdout.on('data', (data) => {
//       output += data.toString();
//     });

//     pythonProcess.stderr.on('data', (data) => {
//       error += data.toString();
//     });

//     pythonProcess.on('close', (code) => {
//       if (code === 0) {
//         resolve(output.trim());
//       } else {
//         reject(`Python error: ${error.trim()}`);
//       }
//     });
//   });
// });

// Settings Handler

// Récupérer une valeur du store
ipcMain.handle("get-setting", (_, key) => {
  return store.get(key);
});

// Enregistrer une valeur dans le store
ipcMain.handle("set-setting", (_, key, value) => {
  store.set(key, value);
});

// Ouvrir un explorateur pour sélectionner un dossier
ipcMain.handle("select-directory", async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ["openDirectory"],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    store.set("directoryPath", result.filePaths[0]);
    return result.filePaths[0];
  }
  return null;
});

// Unsorted Images Handler

// Fonction principale pour récupérer les fichiers média
ipcMain.handle("get-media-files", async (_, directoryPath) => {

  const folderPath = directoryPath || (store.get("directoryPath") as string);
  if (!folderPath) return { error: "No directory path set" };

  const tempDirectoryPath = path.join(folderPath, "temp");

  try {
    cleanTempFolder(directoryPath, tempDirectoryPath); // Nettoyage du dossier temp

    const files = fs.readdirSync(folderPath).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return [".jpg", ".jpeg", ".png", ".gif", ".mp4", ".mov", ".avi"].includes(ext);
    });

    const mediaFiles = await Promise.all(
      files.map(async file => {
        const filePath = path.join(folderPath, file);
        const fileExt = path.extname(file).toLowerCase();
        const isVideo = [".mp4", ".mov", ".avi"].includes(fileExt);

        let thumbnailPath = null;
        if (isVideo) {
          try {
            thumbnailPath = await generateThumbnail(filePath, tempDirectoryPath);
          } catch (err) {
            console.error(`Erreur génération miniature pour ${file}:`, err);
          }
        }

        return {
          path: filePath,
          name: file,
          isVideo: isVideo,
          thumbnailPath: thumbnailPath
        };
      })
    );

    return { directoryPath: folderPath, files: mediaFiles };
  } catch (error) {
    return { error: `Failed to read directory: ${error}` };
  }
});