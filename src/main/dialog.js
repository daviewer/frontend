const { dialog, app, BrowserWindow } = require('electron');
const { fetchBranches } = require('./gitService');

function openProjectDirectoryDialog(mainWindow) {
    if (mainWindow) {
        dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory']
        }).then(result => {
            if (!result.canceled) {
                const projectPath = result.filePaths[0];
                fetchBranches(projectPath)  // fetchBranches 함수 호출
                    .then(branches => {
                        mainWindow.webContents.send('project-path-selected', projectPath);
                        mainWindow.webContents.send('branches-fetched', branches);
                    })
                    .catch(err => {
                        console.error('Error fetching branches:', err);
                    });
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

module.exports = {
    openProjectDirectoryDialog
};
