import { contextBridge, ipcRenderer } from 'electron';
import { get } from 'http';

contextBridge.exposeInMainWorld('electron', {
    // openDirectory: () => ipcRenderer.invoke('open-directory'),
    // runPython: () => ipcRenderer.invoke('run-python'),
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    getSetting: (key: string) => ipcRenderer.invoke("get-setting", key),
    setSetting: (key: string, value: any) => ipcRenderer.invoke("set-setting", key, value),
    getMediaFiles: (key: string) => ipcRenderer.invoke("get-media-files", key),
});
