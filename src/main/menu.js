const { Menu } = require('electron');
const { openProjectDirectoryDialog } = require('./dialog');

function setupMenu(mainWindow) {
    const menu = Menu.buildFromTemplate([
        {
            label: '파일',
            submenu: [
                {
                    label: '경로 설정',
                    click: () => openProjectDirectoryDialog(mainWindow)
                },
                { type: 'separator' },
                { role: 'quit' }
            ]
        }
        // ,{
        //     label: 'Help',
        //     submenu: [
        //         { label: 'version', role: 'about' }
        //     ]
        // }
    ]);

    Menu.setApplicationMenu(menu);
}

module.exports = { setupMenu };
