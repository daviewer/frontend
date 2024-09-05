const { ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const dayjs = require('dayjs');
const { exec } = require('child_process');

// Git 브랜치 목록 가져오기
ipcMain.handle('get-branches', (event, projectPath) => {
    return fetchBranches(projectPath);
});

ipcMain.handle('create-diff-file', async (event, projectPath, sourceBranch, targetBranch) => {
    return createDiffFile(event, projectPath, sourceBranch, targetBranch);
});

function fetchBranches(projectPath) {
    return new Promise((resolve, reject) => {
        exec(`git -C ${projectPath} branch -a`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error fetching branches: ${stderr}`);
                reject(stderr);
            } else {
                const branches = stdout.split('\n').map(branch => branch.trim()).filter(branch => branch);
                resolve(branches);
            }
        });
    });
}

function createDiffFile(event, projectPath, sourceBranch, targetBranch) {
    return new Promise((resolve, reject) => {
        const cleanBranchName = (branch) => branch.replace('*', '').trim();

        const diffFolderPath = path.join(projectPath, 'reviewer_diff');
        if (!fs.existsSync(diffFolderPath)) {
            fs.mkdirSync(diffFolderPath);
        }

        const timestamp = dayjs().format('YYYYMMDDHHmmss');
        const diffFileName = `diff_${timestamp}.txt`;
        const diffFilePath = path.join(diffFolderPath, diffFileName);

        const diffCommand = `git -C ${projectPath} diff ${cleanBranchName(sourceBranch)}..${cleanBranchName(targetBranch)}`;
        exec(diffCommand, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(stderr));
            } else {
                fs.writeFile(diffFilePath, stdout, (err) => {
                    if (err) {
                        reject(new Error(err.message));
                    } else {
                        resolve(diffFilePath);
                    }
                });
            }
        });
    });
}

module.exports = {
    fetchBranches
};
