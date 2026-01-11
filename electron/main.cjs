const electron = require('electron');
const { app, BrowserWindow } = electron;
const path = require('path');
// const { fileURLToPath } = require('url'); // Not needed in CJS

// In CJS, __dirname and __filename are available globally
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // For MVP ease. In prod, use preload.
        },
        autoHideMenuBar: true,
        backgroundColor: '#000000',
        icon: path.join(__dirname, 'icon.png')
    });

    // Load the local URL for development or the local file for production.
    const isDev = process.env.IS_DEV === 'true';

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
