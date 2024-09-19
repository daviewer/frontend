const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { setupMenu } = require('./menu');
const { openProjectDirectoryDialog } = require('./dialog');

// window 생성
function createWindow() {
    let mainWindow = new BrowserWindow({
        width: 600,
        height: 380,
        frame: false, // 프레임리스 설정
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
        },
        icon: path.join(__dirname, '../renderer/resources/images/logo.png'),
    });
    // mac os dock & 메뉴 설정
    setupDockIcon();
    setupMenu(mainWindow);

    mainWindow.loadFile('src/main/views/index.html').then(() => {
        openProjectDirectoryDialog(mainWindow);
    });

    ipcMain.on('close-window', () => {
        mainWindow.close();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function createLoadingWindow() {
    loadingWindow = new BrowserWindow({
        width: 286,
        height: 179,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });

    loadingWindow.loadFile('src/main/views/loader.html');
}

function setupDockIcon() {
    const nativeImage = require('electron').nativeImage;
    const image = nativeImage.createFromPath(path.join(__dirname, '../renderer/resources/images/logo.png'));
    app.dock.setIcon(image);
}

// IPC로 로딩 창 열기
ipcMain.on('show-loading-window', () => {
    createLoadingWindow();
});

// IPC로 로딩 창 닫기
ipcMain.on('close-loading-window', () => {
    if (loadingWindow) {
        loadingWindow.close();
        loadingWindow = null;
    }
});

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
