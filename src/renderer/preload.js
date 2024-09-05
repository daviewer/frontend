// preload.js
const { contextBridge } = require('electron');

// 예제: 노출할 API 설정 (필요에 따라 추가)
contextBridge.exposeInMainWorld('myAPI', {
    doSomething: () => {
        console.log("Doing something from preload.js!");
    }
});
