const { ipcRenderer } = require('electron');
const axios = require('axios');
const fs = require('fs');

document.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.on('project-path-selected', async (event, projectPath) => {
        console.log(`Project path selected: ${projectPath}`);

        try {
            const branches = await ipcRenderer.invoke('get-branches', projectPath);
            console.log(`Branches: ${branches}`);

            const sourceBranchSelect = document.getElementById('sourceBranch');
            const targetBranchSelect = document.getElementById('targetBranch');

            branches.forEach(branch => {
                const option1 = document.createElement('option');
                option1.value = branch;
                option1.textContent = branch;
                sourceBranchSelect.appendChild(option1);

                const option2 = document.createElement('option');
                option2.value = branch;
                option2.textContent = branch;
                targetBranchSelect.appendChild(option2);
            });

            document.getElementById('runReview').addEventListener('click', async () => {
                const sourceBranch = sourceBranchSelect.value;
                const targetBranch = targetBranchSelect.value;

                if (sourceBranch && targetBranch) {
                    try {
                        // 로딩 창 열기
                        ipcRenderer.send('show-loading-window');

                        const diffFilePath = await ipcRenderer.invoke('create-diff-file', projectPath, sourceBranch, targetBranch);
                        console.log(`Diff file created successfully, path: ${diffFilePath}`);

                        const fileBuffer = fs.readFileSync(diffFilePath);
                        const fileName = diffFilePath.split('/').pop();

                        const formData = new FormData();
                        const file = new Blob([fileBuffer], { type: 'text/plain' });
                        formData.append('diff-file', new File([file], fileName));

                        const parameter = { sourceBranch, targetBranch };
                        formData.append('param', new Blob([JSON.stringify(parameter)], { type: 'application/json' }));

                        const response = await axios.post('http://localhost:8080/v1/diff-analysis/submit', formData, {
                            headers: {
                                'Content-Type': 'multipart/form-data'
                            }
                        });

                        const { code, message, body } = response.data;

                        // 로딩 창 닫기
                        ipcRenderer.send('close-loading-window');

                        const newWindow = window.open('', 'API Response', 'width=1000,height=800');
                        if (code === 200) {
                            newWindow.document.write(`<h2>분석결과</h2><pre>${body}</pre>`);
                        } else {
                            newWindow.document.write(`<h2>오류발생</h2><p>${message}</p>`);
                        }
                    } catch (error) {
                        console.error(`Error during diff file creation or API call: ${error}`);

                        // 에러 발생 시 로딩 창 닫기
                        ipcRenderer.send('close-loading-window');

                        alert(`Error: ${error}`);
                    }
                } else {
                    alert('Please select both source and target branches.');
                }
            });
        } catch (error) {
            console.error(`Error fetching branches: ${error}`);
            alert(`Error fetching branches: ${error}`);
        }
    });
});
document.getElementById('close-btn').addEventListener('click', () => {
    require('electron').ipcRenderer.send('close-window');
});
