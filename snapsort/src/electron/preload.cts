import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    openDirectory: () => ipcRenderer.invoke('open-directory'),
    runPython: () => ipcRenderer.invoke('run-python')
});
