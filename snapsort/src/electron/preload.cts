import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    // openDirectory: () => ipcRenderer.invoke('open-directory'),
    // runPython: () => ipcRenderer.invoke('run-python'),
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    getSetting: (key: string) => ipcRenderer.invoke("get-setting", key),
    setSetting: (key: string, value: any) => ipcRenderer.invoke("set-setting", key, value),
    getMediaFiles: (key: string) => ipcRenderer.invoke("get-media-files", key),
    startHotspot: () => ipcRenderer.invoke("start-hotspot"),
    getIpAdress: () => ipcRenderer.invoke("get-ip"),
    getFolders: (key: string) => ipcRenderer.invoke("get-folders", key),
});
