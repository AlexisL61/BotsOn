const { ipcRenderer } = require('electron');
const canvasToBuffer = require("canvas-to-buffer")
console.log("preload")
window.ipcRenderer = ipcRenderer
window.canvasToBuffer = canvasToBuffer