const { app, BrowserWindow, ipcMain, dialog , Menu} = require('electron');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const dayjs = require('dayjs');

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
        icon: path.join(__dirname, '../../renderer/resources/images', 'logo.png')
    });

    // 상단 메뉴 설정
    const menu = Menu.buildFromTemplate([
        {
            label: '파일',
            submenu: [
                {
                    label: '경로 설정',
                    click: () => openProjectDirectoryDialog()
                },
                { type: 'separator' },
                { role: 'quit' }
            ]
        },
        {
            label: 'Help',
            submenu: [
                { role: 'about' }
            ]
        }
    ]);

    Menu.setApplicationMenu(menu); // 메뉴 설정

    mainWindow.loadFile('src/main/views/index.html').then(() => {
        openProjectDirectoryDialog(); // 앱 시작 시 바로 경로 설정 다이얼로그를 띄움
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}


function openProjectDirectoryDialog() {
    const mainWindow = BrowserWindow.getFocusedWindow(); // 현재 포커스된 윈도우 가져오기

    if (mainWindow) {
        dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory']
        }).then(result => {
            if (!result.canceled) {
                const projectPath = result.filePaths[0];
                mainWindow.webContents.send('project-path-selected', projectPath);
            } else {
                app.quit(); // 사용자가 경로 선택을 취소하면 앱 종료
            }
        }).catch(err => {
            console.error('Error opening project directory dialog:', err);
        });
    } else {
        console.error('No active window found to open dialog');
    }
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

// Git 브랜치 목록 가져오기
ipcMain.handle('get-branches', (event, projectPath) => {
    console.log(`Fetching branches from: ${projectPath}`);

    return new Promise((resolve, reject) => {
        exec(`git -C ${projectPath} branch -a`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error fetching branches: ${stderr}`);
                reject(stderr);
            } else {
                console.log(`Branches fetched: ${stdout}`);
                const branches = stdout.split('\n').map(branch => branch.trim()).filter(branch => branch);
                resolve(branches);
            }
        });
    });
});

ipcMain.handle('create-diff-file', async (event, projectPath, sourceBranch, targetBranch) => {
    console.log(`Creating diff file for branches ${sourceBranch} and ${targetBranch}`);

    try {
        const cleanBranchName = (branch) => branch.replace('*', '').trim();

        // 1. reviewer_diff 폴더 확인 및 생성
        const diffFolderPath = path.join(projectPath, 'reviewer_diff');
        if (!fs.existsSync(diffFolderPath)) {
            fs.mkdirSync(diffFolderPath);
            console.log(`Created directory: ${diffFolderPath}`);
        }

        // 2. dayjs를 사용하여 현재 시간을 기반으로 파일명 생성 (초 단위)
        const timestamp = dayjs().format('YYYYMMDDHHmmss'); // dayjs를 사용한 포맷팅
        const diffFileName = `diff_${timestamp}.txt`;
        const diffFilePath = path.join(diffFolderPath, diffFileName);

        // Git diff 명령어 실행
        const diffCommand = `git -C ${projectPath} diff ${cleanBranchName(sourceBranch)}..${cleanBranchName(targetBranch)}`;
        console.log(`diff command: ${diffCommand}`)
        exec(diffCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error creating diff: ${stderr}`);
                throw new Error(stderr);
            } else {
                fs.writeFile(diffFilePath, stdout, (err) => {
                    if (err) {
                        console.error(`Error writing diff to file: ${err.message}`);
                        throw new Error(err.message);
                    } else {
                        console.log(`Diff file created at: ${diffFilePath}`);
                        event.returnValue = diffFilePath;
                    }
                });
            }
        });
    } catch (err) {
        console.error(`Error occurred in handler for 'create-diff-file': ${err.message}`);
        throw err;
    }
});