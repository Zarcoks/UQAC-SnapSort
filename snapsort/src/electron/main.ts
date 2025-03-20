import {app, BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { isDev } from './util.js';
import { getPreloadPath } from './pathResolver.js';
import { spawn } from 'child_process';

let mainWindow: BrowserWindow | null = null;

app.on('ready', () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
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
ipcMain.handle('open-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory'],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const folderPath = result.filePaths[0];
    const files = fs.readdirSync(folderPath).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
    });
    return { folderPath, files };
  }
  return null;
});

// Execute Python Script Handler
ipcMain.handle('run-python', async () => {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(app.getAppPath(), '/src/python/hello.py'); // Ensure script.py exists

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