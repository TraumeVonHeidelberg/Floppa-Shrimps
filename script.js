const { app, BrowserWindow } = require('electron')

function createWindow () {
  // Tworzenie okna przeglądarki.
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // i załaduj index.html aplikacji.
  win.loadFile('index.html')
}

app.whenReady().then(createWindow)
