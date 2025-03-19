import {app, BrowserWindow} from 'electron';
import path from 'path';
import { isDev } from './util.js';

type test = string;

app.on('ready', () => {
  // const mainWindow = new BrowserWindow({
  //   width: 800,
  //   height: 600,
  //   webPreferences: {
  //     nodeIntegration: true
  //   }
  // });
  const mainWindow = new BrowserWindow();

  if (isDev()) {
    mainWindow.loadURL('http://localhost:5173');
  }
  else {
    mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'));
  }
});

