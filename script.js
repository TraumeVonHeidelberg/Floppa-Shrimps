const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // Umożliwia integrację Node.js w renderer process
            enableRemoteModule: true, // Umożliwia użycie modułu remote
        },
    });

    win.maximize();
    win.loadFile(path.join(__dirname, 'public', 'index.html')); // Upewnij się, że ścieżka do pliku HTML jest poprawna
    win.webContents.openDevTools(); // Otwórz narzędzia deweloperskie
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
