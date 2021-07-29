const { app, BrowserWindow } = require('electron');

function createWindow () {
    const win = new BrowserWindow({
        width: 1200,
        height: 700,
        show: false
    })

    win.loadFile('./pages/home.html')

    return win;
}

app.on('ready', () => {

    let main = null
    let loading = new BrowserWindow({show: false, frame: false, width: 300, height: 400})
  
    loading.loadFile('./pages/loading.html')

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