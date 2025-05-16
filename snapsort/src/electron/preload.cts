import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    // openDirectory: () => ipcRenderer.invoke('open-directory'),
    runPython: () => ipcRenderer.invoke('run-python'),
    onPythonLog: (callback: (msg: string) => void) => ipcRenderer.on('python-log', (_, msg) => callback(msg)),
    onPythonError: (callback: (msg: string) => void) => ipcRenderer.on('python-error', (_, msg) => callback(msg)),
    onPythonFinished: (callback: () => void) => ipcRenderer.on('python-finished', () => callback()),
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    getSetting: (key: string) => ipcRenderer.invoke("get-setting", key),
    setSetting: (key: string, value: any) => ipcRenderer.invoke("set-setting", key, value),
    getMediaFiles: (key: string) => ipcRenderer.invoke("get-media-files", key),
    startHotspot: () => ipcRenderer.invoke("start-hotspot"),
    getIpAdress: () => ipcRenderer.invoke("get-ip"),
    getFolders: (key: string) => ipcRenderer.invoke("get-folders", key),
    startImageTransferService: () => ipcRenderer.invoke('start-image-transfer-service'),
    stopImageTransferService: () => ipcRenderer.invoke('stop-image-transfer-service'),
    generateTransferQRCode: (wifiString: string, serverIp: string) => 
        ipcRenderer.invoke('generate-transfer-qrcode', wifiString, serverIp),
    getTransferServiceStatus: () => ipcRenderer.invoke('get-transfer-service-status'),
    getWifiInfo: () => ipcRenderer.invoke('get-wifi-info'),

    // API pour les événements de transfert
    on: (channel: string, callback: (...args: any[]) => void) => {
        const validChannels: readonly string[] = [
            'transfer:start',
            'transfer:progress',
            'transfer:complete',
            'transfer:error',
            'transfer:service-started',
            'transfer:service-stopped'
        ];

        if (validChannels.includes(channel)) {
            const subscription = (_event: any, ...args: any[]) => callback(...args);
            ipcRenderer.on(channel, subscription);

            return () => {
                ipcRenderer.removeListener(channel, subscription);
            };
        }

        return () => {}; // Retourne une fonction vide si le canal n'est pas valide
    },

    off: (channel: string, callback: (...args: any[]) => void) => {
        const validChannels: readonly string[] = [
            'transfer:start',
            'transfer:progress',
            'transfer:complete',
            'transfer:error',
            'transfer:service-started',
            'transfer:service-stopped'
        ];

        if (validChannels.includes(channel)) {
            ipcRenderer.removeListener(channel, callback);
        }
    }
});