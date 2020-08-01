//Modules and variables
const { app, BrowserWindow, autoUpdater } = require('electron')
const electron = require("electron")
const ipc = electron.ipcMain
const path = require('path')
const fs = require("fs")
const discord = require("discord.js")
const isDev = require('electron-is-dev');
const dataFolder = app.getPath('userData')
const directory = app.getAppPath()

console.log(dataFolder)

const discordTokenVerify = require("./main_scripts/verify-token.js")
const api = require("./main_scripts/api.js")
const botHosting = require("./main_scripts/hosting.js")

console.log(process.arch)
const server = 'https://update.electronjs.org'
const feed = `${server}/AlexisL61/BotsOn/${process.platform}-${process.arch}/${app.getVersion()}`
console.log(feed)
if (!isDev){
  autoUpdater.setFeedURL(feed)
setInterval(() => {
  autoUpdater.checkForUpdates()
},  10 * 1000)
}

function createWindow() {

  //creating window with electron
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 1000,
    center: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  //load the index.html of the app.
  mainWindow.loadFile('index.html')
  mainWindow.setMenu(null)

  mainWindow.webContents.openDevTools()
}

app.on("ready", () => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

function getBotExtensionsData(args){
  var botExtensions = []
  var directory = app.getAppPath()
  if (fs.existsSync(dataFolder + "/bots/" + args.id + "/extensions")) {
    var extensions = fs.readdirSync(dataFolder + "/bots/" + args.id + "/extensions")
    extensions.forEach(function (extension) {
      var thisExtensionData = JSON.parse(fs.readFileSync(directory + "/extensions/" + extension + "/extension-data.json"))
      thisExtensionData.active = JSON.parse(fs.readFileSync(dataFolder + "/bots/" + args.id + "/extensions/" + extension + "/status.json", "utf8")).active
      botExtensions.push(thisExtensionData)
    })
  }
  return botExtensions
}

//communicate with webpage
ipc.on("firstTimeOpenApp", function (event, args) {
  if (fs.existsSync(dataFolder + "/appdata")) {
    event.returnValue = false
  } else {
    event.returnValue = true
  }
})

ipc.on("checkDiscordToken", async function (event, args) {
  console.log("checkToken")
  var verifierData = await discordTokenVerify.verify(args.token, discord)
  console.log(verifierData)
  event.sender.send("checkDiscordTokenResult", verifierData)
  if (args.addBot == true) {
    var botData = verifierData.bot
    botData.token = args.token
    if (!fs.existsSync(dataFolder + "\\bots")) {
      fs.mkdirSync(dataFolder + "\\bots")
    }
    fs.mkdirSync(dataFolder + "\\bots\\" + botData.id)
    fs.writeFileSync(dataFolder + "\\bots\\" + botData.id + "\\botdata.json", JSON.stringify(botData))
  }
})

ipc.on("installExtension",function(event,args){
  if (!fs.existsSync(dataFolder+"/bots/"+args.botId+"/extensions")){
    fs.mkdirSync(dataFolder+"/bots/"+args.botId+"/extensions")
  }
  fs.mkdirSync(dataFolder+"/bots/"+args.botId+"/extensions/"+args.extensionId)
  fs.writeFileSync(dataFolder+"/bots/"+args.botId+"/extensions/"+args.extensionId+"/status.json",JSON.stringify({"active":true}))
  fs.mkdirSync(dataFolder+"/bots/"+args.botId+"/extensions/"+args.extensionId+"/data")
  fs.mkdirSync(dataFolder+"/bots/"+args.botId+"/extensions/"+args.extensionId+"/data/webpage-data")
  fs.writeFileSync(dataFolder+"/bots/"+args.botId+"/extensions/"+args.extensionId+"/data/webpage-data/config.json",JSON.stringify({}))
  fs.mkdirSync(dataFolder+"/bots/"+args.botId+"/extensions/"+args.extensionId+"/data/bot-data")
  event.returnValue = {success:true}
})

ipc.on("getConfigData",function(event,args){
  event.sender.send("getConfigData",JSON.parse(fs.readFileSync(dataFolder+"/bots/"+args.botId+"/extensions/"+args.extensionId+"/data/webpage-data/config.json","utf-8")))
})

ipc.on("saveConfigData",function(event,args){
  fs.writeFileSync(dataFolder+"/bots/"+args.botId+"/extensions/"+args.extensionId+"/data/webpage-data/config.json",JSON.stringify(args.config))
  event.sender.send("saveConfigData",{"success":true})
})

ipc.on("modifyExtensionActivation",function(event,args){
  currentActive = JSON.parse(fs.readFileSync(dataFolder + "/bots/" + args.botId + "/extensions/" + args.extensionId + "/status.json", "utf8")).active
  if (currentActive == false){
    currentActive = true
  }else{
    currentActive = false
  }
  console.log("active"+ currentActive)
  fs.writeFileSync(dataFolder + "/bots/" + args.botId + "/extensions/" + args.extensionId + "/status.json", JSON.stringify({"active":currentActive}))
  event.returnValue = {"success":true}
})

ipc.on("getExtensionData",function(event,args){
  if (fs.existsSync(directory + "/extensions/" + args.id + "/extension-data.json")) {
    event.returnValue = JSON.parse(fs.readFileSync(directory + "/extensions/" + args.id + "/extension-data.json"))
  }
})

function getToken(id){
  return JSON.parse(fs.readFileSync(dataFolder + "\\bots\\" + id + "\\botdata.json")).token
}

ipc.on("getGuilds", async function (event, args) {
  var thisBotToken = getToken(args.botId)
  var guilds = await api.getBotGuilds(discord,thisBotToken,args.botId)
  console.log(guilds)
  event.sender.send("getGuilds",guilds)
})

ipc.on("getGuildChannels", async function (event, args) {
  var thisBotToken = getToken(args.botId)
  var channels = await api.getGuildChannels(discord,thisBotToken,args.botId,args.guildId)
  event.sender.send("getGuildChannels",channels)
})

ipc.on("getAvailableExtensions", function (event, args) {
  var directory = app.getAppPath()
  var extensionsFound = []
  if (fs.existsSync(directory + "/extensions")) {
    var availableExtensions = fs.readdirSync(directory + "/extensions")
    availableExtensions.forEach(function (extension) {
      if (fs.existsSync(directory + "/extensions/" + extension + "/extension-data.json")) {
        var extensionData = JSON.parse(fs.readFileSync(directory + "/extensions/" + extension + "/extension-data.json"))
        console.log(extensionData)
        extensionsFound.push({ "name": extensionData.name, "author": extensionData.author, "description": extensionData.description, "id": extensionData.id, "smallDescription": extensionData.smallDescription, "image": extensionData.image })
      }
    })
  }
  event.returnValue = extensionsFound
})

ipc.on("startHosting",async function (event,args){
  botHosting.directory = directory
  botHosting.dataExtensionFolder = dataFolder+"/bots/" + args.id + "/extensions"
  console.log(args)
  var botHostingResult = await botHosting.startHosting(discord,getToken(args.id),getBotExtensionsData(args),event.sender)
  console.log(botHostingResult)
  event.sender.send("startHosting",botHostingResult)
})

ipc.on("endHosting",async function (event,args){
  var botHostingResult = await botHosting.stopHosting()
  event.sender.send("endHosting",botHostingResult)
})

ipc.on("getBotExtensions",function (event, args) {
  var botExtensions =  getBotExtensionsData(args)
  event.returnValue = botExtensions
})

ipc.on("getBotData", function (event, args) {
  event.returnValue = JSON.parse(fs.readFileSync(dataFolder + "/bots" + "/" + args.id + "/botData.json", "utf8"))
})

ipc.on("getUserBots", function (event, args) {
  var currentBots = []
  //check if folder with bot exist
  if (fs.existsSync(dataFolder + "\\bots")) {
    //get all bots save
    var bots = fs.readdirSync(dataFolder + "/bots")
    bots.forEach(function (bot) {
      var thisBotData = JSON.parse(fs.readFileSync(dataFolder + "/bots" + "/" + bot + "/botData.json", "utf8"))
      console.log(thisBotData)
      currentBots.push(thisBotData)
    })
  }
  event.returnValue = currentBots
})
