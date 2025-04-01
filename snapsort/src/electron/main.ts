import {app, BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { isDev, cleanTempFolder, generateThumbnail } from './util.js';
import { getPreloadPath, getPythonScriptPath } from './pathResolver.js';
import { startHotspot, getSSID, getSecurityKey, extractSSID, extractUserSecurityKey, getPhoneIpAddress, extractIpAddress } from './connexion.js';
import { spawn } from 'child_process';
import store from "./store.js";
import { get } from 'https';
import { getFolders } from './folderManager.js';

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

// Execute Python Script Handler
ipcMain.handle('run-python', async () => {
  return new Promise((resolve, reject) => {
    const pythonScript = getPythonScriptPath('hello.py');

    const pythonProcess = spawn('python', [pythonScript]);

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
});

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

  // Deal with temp directory
  const rootPath = store.get("directoryPath") as string;
  if (!rootPath) return { error: "No root directory path set" };

  const tempDirectoryPath = path.join(rootPath, "temp");
  if (fs.existsSync(tempDirectoryPath)) {
    // Si le dossier existe, on le nettoie
    cleanTempFolder(directoryPath, tempDirectoryPath);
  }
  else {
    // Sinon, on le crée
    fs.mkdirSync(tempDirectoryPath, { recursive: true });
  }


  try {
    // Lire le contenu du dossier demandé
    const files = fs.readdirSync(directoryPath).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return [".jpg", ".jpeg", ".png", ".gif", ".mp4", ".mov", ".avi"].includes(ext);
    });

    // Si les fichiers sont des vidéos, on génère une miniature que l'on stocke dans le dossier temp
    const mediaFiles = await Promise.all(
      files.map(async file => {
        const filePath = path.join(directoryPath, file);
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

    return { directoryPath: directoryPath, files: mediaFiles };
  } catch (error) {
    return { error: `Failed to read directory: ${error}` };
  }
});

// Connexion to the phone mobile

ipcMain.handle("start-hotspot", async () => {
  try {
      // Démarrer le hotspot
      const hotspotResult = await startHotspot();
      console.log(hotspotResult);

      // Attendre un court instant pour s'assurer que le hotspot est bien activé
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Récupérer le SSID et la clé de sécurité
      let wifiSSID = await getSSID();
      let wifiPassword = await getSecurityKey();
      const wifiEncryption = "WPA"; // WPA, WPA2 ou NONE

      wifiSSID = extractSSID(wifiSSID) ?? '';
      wifiPassword = extractUserSecurityKey(wifiPassword) ?? '';
      
      if (wifiSSID === '' || wifiPassword === '') {
        return { error: "Impossible de récupérer les informations du hotspot" };
      }
      else
      {
        const wifiString = `WIFI:T:${wifiEncryption};S:${wifiSSID};P:${wifiPassword};;`;
        return { wifiString };
      }
  } catch (error) {
      return { error: "Erreur lors du démarrage du hotspot" };
  }
});

// Récupérer l'adresse IP
ipcMain.handle("get-ip", async () => {
  try {
    let ipAddress = await getPhoneIpAddress();
    if (ipAddress) {
      ipAddress = extractIpAddress(ipAddress);
    }
    return ipAddress; // This will be sent back to the renderer process
  } catch (error) {
    console.error("Error fetching IP:", error);
    return null;
  }
});

// Récupérer les dossiers
ipcMain.handle("get-folders", async (_, rootPath) => {
  return getFolders(rootPath);
});