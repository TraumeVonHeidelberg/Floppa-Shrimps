const { app, BrowserWindow } = require('electron')

function createWindow() {
	// Tworzenie okna przeglądarki.
	let win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
		},
	})

	// Maksymalizacja okna po utworzeniu
	win.maximize()

	// i załaduj index.html aplikacji.
	win.loadFile('./public/index.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow()
	}
})
