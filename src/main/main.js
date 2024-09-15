const { app, BrowserWindow } = require('electron');
const path = require('path');
const { setupMenu } = require('./menu');
const { openProjectDirectoryDialog } = require('./dialog');

// window 생성
function createWindow() {
    let mainWindow = new BrowserWindow({
        width: 600,
        height: 450,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
        },
        icon: path.join(__dirname, '../renderer/resources/images', 'logo.png')
    });

    // 메뉴 설정
    // setupMenu(mainWindow);

    mainWindow.loadFile('src/main/views/index.html').then(() => {
        openProjectDirectoryDialog(mainWindow);
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
