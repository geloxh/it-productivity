const { app, BrowserWindow, ipcMain } = require('electron')
const { spawn } = require('child_process')
const path = require('path')

let server

function createMainWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  })
  win.loadURL('http://localhost:5173')
  return win
}

ipcMain.handle('open-panel', (_, { route, width = 900, height = 650, title = '' }) => {
  const panel = new BrowserWindow({
    width, height, title,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  })
  panel.loadURL(`http://localhost:5173${route}`)
})

app.whenReady().then(() => {
  server = spawn('node', [path.join(__dirname, '../server/src/server.js')])
  createMainWindow()
})

app.on('quit', () => server?.kill())