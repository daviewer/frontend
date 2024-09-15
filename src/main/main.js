const { app, BrowserWindow } = require('electron');
const path = require('path');
const { setupMenu } = require('./menu');  // setupMenu로 함수 호출
const { openProjectDirectoryDialog } = require('./dialog');

// window 생성
function createWindow() {
    let mainWindow = new BrowserWindow({
        width: 800,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
        },
        icon: path.join(__dirname, '../renderer/resources/images', 'logo.png')
    });

    // 메뉴 설정
    setupMenu(mainWindow);  // setupMenu로 호출
    mainWindow.webContents.openDevTools(); // 이 줄 추가


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
