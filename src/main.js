//Modules and variables
const { app, BrowserWindow, autoUpdater,protocol,Menu } = require('electron')
const electron = require("electron")
const ipc = electron.ipcMain
const path = require('path')
const unzip = require('extract-zip')
const axios = require("axios")
const fs = require("fs")
const discord = require("discord.js")
const isDev = require('electron-is-dev');
const dataFolder = app.getPath('userData')
const directory = app.getAppPath()
const RPC = require("discord-rpc")
const RPCclient = new RPC.Client({ transport: 'ipc' })

const clientId = '774665586001051648';
const scopes = [ 'identify'];

var mainWindow

console.log(dataFolder)

const discordTokenVerify = require("./main_scripts/verify-token.js")
const api = require("./main_scripts/api.js")
const botHosting = require("./main_scripts/hosting.js")
const richPresence = require("./main_scripts/rich-presence.js")

console.log(process.arch)
//const server = 'https://update.electronjs.org'
//const feed = `${server}/AlexisL61/BotsOn/${process.platform}-${process.arch}/${app.getVersion()}`
//console.log(feed)
//if (!isDev){
//  autoUpdater.setFeedURL(feed)
//setInterval(() => {
//  autoUpdater.checkForUpdates()
//},  10 * 1000)
//}

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
      }
    ]
  }]))

  //mainWindow.webContents.openDevTools();

  
  //mainWindow.webContents.executeJavaScript(`console.log("`+process.argv+`")`)

  mainWindow.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    require('electron').shell.openExternal(url);
  });
}

function createDownloadWindow() {

  //creating window with electron
  mainWindow = new BrowserWindow({
    width: 500,
    height: 500,
    center: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  //load the index.html of the app.
  mainWindow.loadFile('download.html')
  mainWindow.setMenu(null)

  //mainWindow.webContents.openDevTools()

  
}

app.on("ready", () => {
  console.log(process.argv)
  if (!process.argv.find(arg=>arg.startsWith("botson://"))){
    app.setAsDefaultProtocolClient("botson",process.execPath,{extensionInstaller:true})
    createWindow()
    //createDownloadWindow()
    
  }else{
    createDownloadWindow()
    
  }

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed
app.on('window-all-closed', function () {
  botHosting.stopHosting()
  if (process.platform !== 'darwin') app.quit()
})

function getBotExtensionsData(args){
  var botExtensions = []
  var directory = app.getAppPath()
  if (fs.existsSync(dataFolder + "/bots/" + args.id + "/extensions")) {
    var botName = JSON.parse(fs.readFileSync(dataFolder + "/bots/" + args.id+"/botdata.json")).name
    richPresence.changeRPC({"state":"Configure "+botName})
    var extensions = fs.readdirSync(dataFolder + "/bots/" + args.id + "/extensions")
    extensions.forEach(function (extension) {
      if (fs.existsSync(dataFolder + "/extension-install/" + extension )){
      var thisExtensionData = JSON.parse(fs.readFileSync(dataFolder + "/extension-install/" + extension + "/extension-data.json"))
      thisExtensionData.active = JSON.parse(fs.readFileSync(dataFolder + "/bots/" + args.id + "/extensions/" + extension + "/status.json", "utf8")).active
      botExtensions.push(thisExtensionData)
      }
    })
  }
  return botExtensions
}

ipc.on("connect-discord",function(event,args){
  try{
    RPCclient.login({ clientId});
  }catch(e){
    
    console.log("ERROR")
  }
  RPCclient.once("connected", () => {
    richPresence.init(RPCclient)
    richPresence.changeRPC({"state":"Sélectionne son bot"})
    console.log(RPCclient.user.username)
    mainWindow.loadFile('./index.html')
    event.sender.send("connect-discord",{"status":"connect"})
  })
  RPCclient.on("error",()=>{
  })
})


//communicate with webpage
ipc.on("firstTimeOpenApp", function (event, args) {
  if (fs.existsSync(dataFolder + "/appdata")) {
    event.returnValue = false
  } else {
    event.returnValue = true
  }
})

ipc.on("getDataFolder",function(event,args){
  event.returnValue = dataFolder
})

ipc.on("downloadExtensionFromURL",function(event,args){
  var url = process.argv.find(arg=>arg.startsWith("botson://")).split("botson://")[1]
      axios({
        method: "get",
        url: url,
        responseType: "stream"
    }).then(async function (response) {
      event.sender.send("downloadFinish")
      var stream = fs.createWriteStream(dataFolder+"/temp.zip")
      response.data.pipe(stream);
      stream.on("finish",async function(){
        try{
      if (!fs.existsSync(dataFolder + "/extension-install")){
        fs.mkdirSync(dataFolder + "/extension-install")
      }
        await unzip(dataFolder+"/temp.zip", {dir:dataFolder+"/extension-install"}) 
        event.sender.send("unzipFinish")
    }catch(e){
      event.sender.send("error",{error:e})
    }
      
    })
    })
})

ipc.on("checkDiscordToken", async function (event, args) {
  console.log("checkToken")
  var verifierData = await discordTokenVerify.verify(args.token, discord)
  console.log(verifierData)
  if (args.addBot == true && verifierData.success) {
    var botData = verifierData.bot
    botData.token = args.token
    if (!fs.existsSync(dataFolder + "\\bots")) {
      fs.mkdirSync(dataFolder + "\\bots")
    }
    fs.mkdirSync(dataFolder + "\\bots\\" + botData.id)
    fs.writeFileSync(dataFolder + "\\bots\\" + botData.id + "\\botdata.json", JSON.stringify(botData))
  }
  if (args.modifyBot == true && verifierData.success == true){
    if (args.botId != verifierData.bot.id){
      verifierData = {success:false}
    }else{
      var botCurrentData = fs.readFileSync(dataFolder + "\\bots\\" + verifierData.bot.id + "\\botdata.json","utf8")
      botCurrentData.name = verifierData.bot.name
      botCurrentData.avatar = verifierData.bot.avatar
      botCurrentData.token = verifierData.bot.token
      fs.writeFileSync(dataFolder + "\\bots\\" + verifierData.bot.id + "\\botdata.json", JSON.stringify(botCurrentData))
    }
  }
  event.sender.send("checkDiscordTokenResult", verifierData)
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

ipc.on("getBotPrivateData",function(event,args){
  var botData = JSON.parse(fs.readFileSync(dataFolder+"/bots/"+args.botId+"/botdata.json","utf-8"))
  event.sender.send("getBotPrivateData",botData)
})

ipc.on("getBotIntents",function(event,args){
  var botData = JSON.parse(fs.readFileSync(dataFolder+"/bots/"+args.botId+"/botdata.json","utf-8"))
  var thisBotIntents = {"presence_intent":false, "server_members_intent":false}
  if (botData.intents){
    thisBotIntents = botData.intents
  }
  event.sender.send("getBotIntents",thisBotIntents)
})

ipc.on("getBotGeneralCommands",function(event,args){
  var botData = JSON.parse(fs.readFileSync(dataFolder+"/bots/"+args.botId+"/botdata.json","utf-8"))
  var thisBotGeneralCommands = {"help":false}
  if (botData.generalCommands){
    thisBotGeneralCommands = botData.generalCommands
  }
  event.sender.send("getBotGeneralCommands",thisBotGeneralCommands)
})

ipc.on("getBotPrefix",function(event,args){
  var botData = JSON.parse(fs.readFileSync(dataFolder+"/bots/"+args.botId+"/botdata.json","utf-8"))
  var thisBotPrefix = "!"
  if (botData.prefix){
    thisBotPrefix = botData.prefix
  }
  event.sender.send("getBotPrefix",thisBotPrefix)
})

ipc.on("getBotUser",function(event,args){
  var botData = JSON.parse(fs.readFileSync(dataFolder+"/bots/"+args.botId+"/botdata.json","utf-8"))
  var thisBotUser
  if (botData.user){
    thisBotUser = botData.user
  }
  event.sender.send("getBotUser",thisBotUser)
})

ipc.on("modifyBotPrefix",function(event,args){
  var botData = JSON.parse(fs.readFileSync(dataFolder+"/bots/"+args.botId+"/botdata.json","utf-8"))
  botData.prefix = args.prefix
  fs.writeFileSync(dataFolder+"/bots/"+args.botId+"/botdata.json",JSON.stringify(botData))
  event.returnValue = {"success":true}
})

ipc.on("modifyBotUser",function(event,args){
  var botData = JSON.parse(fs.readFileSync(dataFolder+"/bots/"+args.botId+"/botdata.json","utf-8"))
  botData.user = args.user
  fs.writeFileSync(dataFolder+"/bots/"+args.botId+"/botdata.json",JSON.stringify(botData))
  event.returnValue = {"success":true}
})

ipc.on("modifyBotIntent",function(event,args){
  var botData = JSON.parse(fs.readFileSync(dataFolder+"/bots/"+args.botId+"/botdata.json","utf-8"))
  if (!botData.intents){
    botData.intents = {}
  }
  if (!botData.intents[args.intent]){
    botData.intents[args.intent] = false
  }
  botData.intents[args.intent] = !botData.intents[args.intent]
  console.log("intents: "+botData.intents)
  fs.writeFileSync(dataFolder+"/bots/"+args.botId+"/botdata.json",JSON.stringify(botData))
  event.returnValue = {"success":true}
})

ipc.on("modifyBotGeneralCommand",function(event,args){
  var botData = JSON.parse(fs.readFileSync(dataFolder+"/bots/"+args.botId+"/botdata.json","utf-8"))
  if (!botData.generalCommands){
    botData.generalCommands = {}
  }
  if (!botData.generalCommands[args.command]){
    botData.generalCommands[args.command] = false
  }
  botData.generalCommands[args.command] = !botData.generalCommands[args.command]
  console.log("intents: "+botData.generalCommands)
  fs.writeFileSync(dataFolder+"/bots/"+args.botId+"/botdata.json",JSON.stringify(botData))
  event.returnValue = {"success":true}
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
  if (fs.existsSync(dataFolder + "/extension-install/" + args.id + "/extension-data.json")) {
    event.returnValue = JSON.parse(fs.readFileSync(dataFolder + "/extension-install/" + args.id + "/extension-data.json"))
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

ipc.on("getGuildRoles", async function (event, args) {
  console.log("GETROLES")
  var thisBotToken = getToken(args.botId)
  var roles = await api.getGuildRoles(discord,thisBotToken,args.botId,args.guildId)
  console.log(roles)
  event.sender.send("getGuildRoles",roles)
  var emojis = await api.getGuildEmojis(discord,thisBotToken,args.botId,args.guildId)
  console.log(emojis)
  event.sender.send("getGuildEmojis",emojis)
})

ipc.on("getGuildEmojis", async function (event, args) {
  console.log("GETEMOJIS")
  var thisBotToken = getToken(args.botId)
  var emojis = await api.getGuildEmojis(discord,thisBotToken,args.botId,args.guildId)
  event.sender.send("getGuildEmojis",emojis)

})

ipc.on("getAvailableExtensions", function (event, args) {
  var extensionsFound = []
  if (fs.existsSync(dataFolder + "/extension-install")) {
    var availableExtensions = fs.readdirSync(dataFolder + "/extension-install")
    availableExtensions.forEach(function (extension) {
      if (fs.existsSync(dataFolder + "/extension-install/" + extension + "/extension-data.json")) {
        var extensionData = JSON.parse(fs.readFileSync(dataFolder + "/extension-install/" + extension + "/extension-data.json"))
        console.log(extensionData)
        extensionsFound.push({ "name": extensionData.name, "author": extensionData.author, "description": extensionData.description, "id": extensionData.id, "smallDescription": extensionData.smallDescription, "image": extensionData.image })
      }
    })
  }
  console.log(extensionsFound)
  event.returnValue = extensionsFound
})

ipc.on("startHosting",async function (event,args){
  botHosting.directory = dataFolder
  botHosting.electron = electron
  botHosting.dataExtensionFolder = dataFolder+"/bots/" + args.id + "/extensions"
  var botData = JSON.parse(fs.readFileSync(dataFolder+"/bots/"+args.id+"/botdata.json","utf-8"))
  var thisBotPrefix = "!"
  if (botData.prefix){
    thisBotPrefix = botData.prefix
  }
  botHosting.prefix = thisBotPrefix
  var thisBotUser = ""
  if (botData.user){
    thisBotUser = botData.user
  }
  if (RPCclient.user.id){
    botHosting.user = RPCclient.user.id
  }else{
    botHosting.user = thisBotUser
  }
  var thisBotIntents = {"presence":false,"guild_members":false}
  if (botData.intents){
    thisBotIntents = botData.intents
  }
  botHosting.intents = thisBotIntents
  var thisBotGeneralCommands = {"help":false}
  if (botData.generalCommands){
    thisBotGeneralCommands = botData.generalCommands
  }
  botHosting.generalCommands = thisBotGeneralCommands
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

ipc.on("getUser",function(event,args){
  event.returnValue = RPCclient.user
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
