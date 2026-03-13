const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  terminal: {
    init: () => ipcRenderer.invoke('terminal:init'),
    write: (data) => ipcRenderer.invoke('terminal:write', data),
    read: () => ipcRenderer.invoke('terminal:read'),
    resize: (cols, rows) => ipcRenderer.invoke('terminal:resize', cols, rows),
    kill: () => ipcRenderer.invoke('terminal:kill'),
    onData: (callback) => {
      ipcRenderer.on('terminal:data', (event, data) => callback(data));
    },
  },
});
