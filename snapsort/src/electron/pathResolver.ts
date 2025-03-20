import path from 'path';
import { app } from 'electron';
import { isDev } from './util.js';

export function getPreloadPath() {
  return path.join(
    app.getAppPath(),
    isDev() ? '.' : '..',
    '/dist-electron/preload.cjs'
  );
}

export function getPythonScriptPath(scriptName: string) {
  return path.join(
    app.getAppPath(),
    isDev() ? '.' : '..',
    'scripts', // Suppression du "/" au début pour éviter des problèmes de chemin
    scriptName
  );
}