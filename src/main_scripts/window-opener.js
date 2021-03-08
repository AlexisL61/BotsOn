var path = require("path")
var fs = require("fs")
const {app, BrowserWindow, Menu, clipboard} = require('electron')
const dataFolder = app.getPath('userData')
const extensionModule = require("./class/extension.js")

function copyDebugFile() {
    var currentBots = []
    if (fs.existsSync(dataFolder + "/bots")) { // get all bots save
        var bots = fs.readdirSync(dataFolder + "/bots")
        bots.forEach(function (bot) {
            if (! bot.startsWith(".")) {
                var thisBotData = JSON.parse(fs.readFileSync(dataFolder + "/bots" + "/" + bot + "/botData.json", "utf8"))
                console.log(thisBotData)
                thisBotData.token = "***"
                var extensionsData = []
                var extensions = fs.readdirSync(dataFolder + "/bots" + "/" + bot + "/extensions")
                extensions.forEach(function (extension) {
                    if (! extension.startsWith(".")) {
                        extensionsData.push(extension)
                    }
                })
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

function openDownloadWindow() {
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
    mainWindow.loadFile('../download.html')
    mainWindow.setMenu(null)
    return mainWindow
}

module.exports = {
    openMainWindow: openMainWindow,
    openExportWindow: openExportWindow,
    openDownloadWindow: openDownloadWindow
}
