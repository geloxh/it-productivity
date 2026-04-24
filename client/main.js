const { app, BrowserWindow } = require('electron')
const { spawn } = require('child_process')
const path = require('path')

let server

app.whenReady().then(() => {
    server = spawn('node', [path.join(__dirname, '../server/index.js')])

    const win = new BrowserWindow({
        width: 1280,
        height: 800
    })

    win.loadURL('http://localhost:5000')
})

app.on('quit', () => server.kill())