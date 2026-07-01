const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs seguras al renderer (la página HTML)
contextBridge.exposeInMainWorld('electronAPI', {
    getVersion: () => ipcRenderer.invoke('get-version'),
    checkUpdates: () => ipcRenderer.invoke('check-updates'),
    onUpdateStatus: (callback) => ipcRenderer.on('update-status', (_, data) => callback(data)),
});
