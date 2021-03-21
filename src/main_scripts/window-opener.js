var path = require("path")
var fs = require("fs")
const {app, BrowserWindow, Menu, clipboard} = require('electron')
const dataFolder = app.getPath('userData')
const extensionModule = require("./class/extension/extension.js")

function copyDebugFile() {
    var currentBots = []
    if (fs.existsSync(dataFolder + "/bots")) { // get all bots save
        var bots = fs.readdirSync(dataFolder + "/bots")
        bots.forEach(function (bot) {
            if (! bot.startsWith(".")) {
                var thisBotData = JSON.parse(fs.readFileSync(dataFolder + "/bots" + "/" + bot + "/botdata.json", "utf8"))
                console.log(thisBotData)
                thisBotData.token = "***"
                var extensionsData = []
                if (fs.existsSync(dataFolder + "/bots/"+bot+"/extensions")){
                    var extensions = fs.readdirSync(dataFolder + "/bots" + "/" + bot + "/extensions")
                    extensions.forEach(function (extension) {
                        if (! extension.startsWith(".")) {
                            extensionsData.push(extension)
                        }
                    })
                }
                currentBots.push({"data": thisBotData, "extensions": extensionsData})
            }
        })
    }
    var currentExtensions = extensionModule.getInstallExtensions()

    console.log(JSON.stringify(currentBots), JSON.stringify(currentExtensions))
    console.log(JSON.stringify({"bots": currentBots, "extensions": currentExtensions}))
    clipboard.writeText(JSON.stringify({"bots": currentBots, "extensions": currentExtensions}))
}

function openMainWindow() {
    var mainWindow
    mainWindow = new BrowserWindow({
        icon: __dirname + '\\..\\files\\images\\logo.png',
        width: 1000,
        height: 1000,
        center: true,
        webPreferences: {
            preload: path.join(__dirname, '../preload.js')
        }
    })

    mainWindow.loadFile('./webpage-files/connect/connect.html')

    mainWindow.setMenu(Menu.buildFromTemplate([{
            label: "Debug",
            submenu: [
                {
                    label: "Ouvrir les Dev Tools",
                    accelerator: "F12",
                    click: () => {
                        mainWindow.webContents.toggleDevTools();
                    }
                }, {
                    label: "Copier les fichiers de débuggage",
                    accelerator: "F11",
                    click: () => {
                        copyDebugFile();
                    }
                }
            ]
        }]))
    return mainWindow
}

function openExportWindow() {
    var mainWindow = new BrowserWindow({
        icon: __dirname + '\\..\\files\\images\\logo.png',
        width: 1000,
        height: 1000,
        center: true,
        webPreferences: {
            preload: path.join(__dirname, '../preload.js')
        }
    })

    mainWindow.loadFile('./webpage-files/export/export.html')
    return mainWindow
}

function openDownloadWindow(screen) {
    var mainScreen = screen.getPrimaryDisplay();
    var dimensions = mainScreen.workAreaSize;
    var mainWindow = new BrowserWindow({
        icon: __dirname + '\\..\\files\\images\\logo.png',
        width: 400,
        height: 100,
        x: dimensions.width - 410,
        y: dimensions.height - 110,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, '../preload.js')
        }
    })

    // load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname,'../download.html'))
    return mainWindow
}

async function openCanvasWindow() {
    var currentOpenWebPage = new BrowserWindow({
        width: 1000,
        height: 1000,
        center: true,
        show: false,
        webPreferences: { // eslint-disable-next-line no-undef
            preload: path.join(__dirname, '../preload.js')
        }
    })
    await currentOpenWebPage.loadFile('./webpage-files/canvas/canvas.html')
    return currentOpenWebPage
}

module.exports = {
    openMainWindow: openMainWindow,
    openExportWindow: openExportWindow,
    openDownloadWindow: openDownloadWindow,
    openCanvasWindow:openCanvasWindow
}
