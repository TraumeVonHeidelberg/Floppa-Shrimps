const { app, BrowserWindow } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const url = require('url')

let serverProcess

function createWindow() {
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: true,
		},
	})

	win.maximize()

	win.loadURL(
		url.format({
			pathname: path.join(__dirname, 'public', 'index.html'),
			protocol: 'file:',
			slashes: true,
		})
	)
}

function startServer() {
	serverProcess = spawn('node', [path.join(__dirname, 'app.js')])

	serverProcess.stdout.on('data', data => {
		console.log(`Server: ${data}`)
	})

	serverProcess.stderr.on('data', data => {
		console.error(`Server error: ${data}`)
	})

	serverProcess.on('close', code => {
		console.log(`Server process exited with code ${code}`)
	})
}

async function main() {
	await app.whenReady()
	startServer()
	createWindow()
}

main().catch(console.error)

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

app.on('quit', () => {
	if (serverProcess) {
		serverProcess.kill()
	}
})
