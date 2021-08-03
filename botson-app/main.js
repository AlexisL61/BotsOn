// Import des scripts / modules
const {app, BrowserWindow} = require('electron');
const isDev = require("electron-is-dev");
const path = require('path');
// const rpc = require('./src/utils/rpc');

/**
 *
 * @description Permet de crée la première window
 *
 * @returns BrowserWindow
 */
function createMainWindow() {
  const win = new BrowserWindow({
    width : 1200,
    height : 700,
    show : false,
    icon : __dirname + '/src/img/ico/logo.ico',
    webPreferences : {
      preload : 'preload.js',
    }
  });

  // rpc.changeRPC({"state": "Sélectionne son bot"})

  win.loadURL(isDev ? "http://localhost:3000"
                    : `file://${path.join(__dirname, "/build/index.html")}`);

  // Ouverture de la DevTools
  if (isDev) {
    win.webContents.openDevTools({mode : "detach"});
  }

  return win;
}

//////////////////////////////////////////////
app.on('ready', () => {

    let main = null
// Création d'une fenetre de chargement
let loading = new BrowserWindow({
  show : false,
  frame : false,
  width : 300,
  height : 400,
  icon : __dirname + '/src/img/ico/logo.ico',
})

loading.loadFile('./build/loading.html')

    loading.once('show', () => {
        main = createMainWindow()
        main.webContents.once('dom-ready', () => {
            console.log('main loaded')
        main.show()
        loading.hide()
            loading.close()
        })
    })
            loading.show()

    app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0)
    createMainWindow()
    })
});

    app.on('window-all-closed', function() {
      if (process.platform !== 'darwin')
        app.quit()
    })