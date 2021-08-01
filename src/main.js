// Import des scripts / modules
const { app, BrowserWindow } = require('electron');
const rpc = require('./src/utils/rpc');

/**
 * 
 * @description Permet de crée la première window
 * 
 * @returns BrowserWindow
 */
function createWindow () {
    const win = new BrowserWindow({
        width: 1200,
        height: 700,
        show: false, 
        icon: __dirname + '/src/img/ico/logo.ico',
        webPreferences: {
            nodeIntegration: true
        }
    });

    rpc.changeRPC({"state": "Sélectionne son bot"})

    win.loadFile('./public/index.html')

    return win;
}

app.on('ready', () => {

    let main = null
    // Création d'une fenetre de chargement
    let loading = new BrowserWindow({show: false, frame: false, width: 300, height: 400, icon: __dirname + '/src/img/ico/logo.ico',})
  
    loading.loadFile('./public/loading.html')

    loading.once('show', () => {
        main = createWindow()
        main.webContents.once('dom-ready', () => {
            console.log('main loaded')
            main.show()
            loading.hide()
            loading.close()
        })
    })
    loading.show()

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})