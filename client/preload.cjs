const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  openPanel: (opts) => ipcRenderer.invoke('open-panel', opts),
  isElectron: true,  
})