const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('myAPI', {
    doSomething: () => {
        console.log("Doing something from preload.js!");
    }
});
