const { ipcRenderer } = require('electron');

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
                        const diffFilePath = await ipcRenderer.invoke('create-diff-file', projectPath, sourceBranch, targetBranch);
                        console.log(`Diff file created successfully at: ${diffFilePath}`);
                        alert(`Diff file created successfully at: ${diffFilePath}`);
                    } catch (error) {
                        console.error(`Error during diff file creation: ${error}`);
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
