//Code source de BotsOn
//Pour la communication entre l'interface et ce script, il est utilisé l'objet ipcMain provenant de electron

//Modules and variables
const { app, BrowserWindow, autoUpdater,protocol,Menu,clipboard,Notification,shell,screen, ipcRenderer } = require('electron')
const appPath = app.getAppPath()
const electron = require("electron")
const ipc = electron.ipcMain
const path = require('path')
const unzip = require('extract-zip')
const axios = require("axios")
const fs = require("fs")
const fse = require('fs-extra');
const discord = require("discord.js")
const dataFolder = app.getPath('userData')
const {promisify} = require("util")
const child_process = require("child_process")
const directory = app.getAppPath()
const RPC = require("discord-rpc")
const RPCclient = new RPC.Client({ transport: 'ipc' })
var premiumData
var linkSave = ""

var currentlyBotHosting 

// id de l'application Discord suivi du scope identify pour se connecter à Discord
const clientId = '774665586001051648';
const scopes = [ 'identify'];

var botsOnUser

var mainWindow

console.log(dataFolder)

const discordTokenVerify = require("./main_scripts/verify-token.js")
const api = require("./main_scripts/api.js")
const richPresence = require("./main_scripts/rich-presence.js")
const botsOnUserModule = require("./main_scripts/botson-user.js")

var mainWebContent

const notificationFile = JSON.parse(fs.readFileSync(path.join(__dirname,"jsonFolder/notifications/notifications.json"),"utf8"))
console.log(process.arch)

function createErrorCode(errorCode){
  var errorNotif = JSON.parse(JSON.stringify(notificationFile.extension_error))
  errorNotif.body = errorNotif.body.replace("{errorCode}",errorCode)
  return errorNotif
}

function createWindow() {

	//Création de la fenêtre principale 
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 1000,
    center: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
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
      },
      {
        label: "Copier les fichiers de débuggage",
        accelerator: "F11",
        click: () => {
          copyDebugFile();
        }
      }
    ]
  }]))

  mainWebContent = mainWindow.webContents;
  
  //Ouverture d'une page exterieur lors d'un clique sur un lien à la place de l'ouvrir dans electron
  mainWindow.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    require('electron').shell.openExternal(url);
  });

  //Appel lorsque la fenêtre est fermée
  mainWindow.on("closed",function(){
    app.quit()
  })
}

function createDownloadWindow() {
  
  //Création de la fenêtre d'installation d'extension
  var mainScreen = screen.getPrimaryDisplay();
  var dimensions = mainScreen.workAreaSize;
  console.log(dimensions)
  mainWindow = new BrowserWindow({
    width: 400,
    height: 100,
      x:dimensions.width-410,
      y:dimensions.height-110,
      frame:false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  //load the index.html of the app.
  mainWindow.loadFile('download.html')
  mainWindow.setMenu(null)

  //Fermeture de la fenêtre si l'utilisateur appuie sur la croix
  ipc.once("closeDownload",function(event){
    mainWindow.close()
  })

  //Ouverture des dev tools pour les tests
  mainWindow.webContents.openDevTools()

  
}

//MacOs n'envoie pas d'arguments lors d'ouverture de liens BotsOn donc on utilise open-url
app.on("open-url",function(e,url){
  e.preventDefault();
  linkSave = url
  if (app.isReady()){
    createDownloadWindow()
  }
})

//Lorsque l'app est prête à être lancée
app.on("ready", () => {
  
  
  console.log(process.argv)
  //Regarde si il n'y a pas un argument commençant par BotsOn
  //Cela veut dire que BotsOn a été ouvert à partir d'un lien BotsOn
  if (!process.argv.find(arg=>arg.startsWith("botson://"))){
    if (linkSave){
      createDownloadWindow()
    }else{
      app.setAsDefaultProtocolClient("botson",process.execPath,{extensionInstaller:true})
      createWindow()
      //createDownloadWindow()
      
    }
  }else{
    linkSave = process.argv.find(arg=>arg.startsWith("botson://"))
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
  if (currentlyBotHosting){
    currentlyBotHosting.stopHosting()
  }
  
  if (process.platform !== 'darwin') app.quit()
})


//Récupère les données des extensions d'un bot précis
function getBotExtensionsData(args){
  var botExtensions = []
  var directory = app.getAppPath()
  if (fs.existsSync(dataFolder + "/bots/" + args.id + "/extensions")) {
    var botName = JSON.parse(fs.readFileSync(dataFolder + "/bots/" + args.id+"/botdata.json","utf8")).name
    richPresence.changeRPC({"state":"Configure "+botName})
    var extensions = fs.readdirSync(dataFolder + "/bots/" + args.id + "/extensions")
    extensions.forEach(function (extension) {
      if (!extension.startsWith(".") && fs.existsSync(dataFolder + "/extension-install/" + extension )){
      var thisExtensionData = JSON.parse(fs.readFileSync(dataFolder + "/extension-install/" + extension + "/extension-data.json","utf8"))
      thisExtensionData.active = JSON.parse(fs.readFileSync(dataFolder + "/bots/" + args.id + "/extensions/" + extension + "/status.json", "utf8")).active
      botExtensions.push(thisExtensionData)
      }
    })
  }
  return botExtensions
}

//Suppression d'une extension pour un bot
ipc.on("deleteExtensionFromBot",function(event,args){
  fs.rmdirSync(dataFolder + "/bots/" + args.botId + "/extensions/" + args.extensionId, { recursive: true });
  event.returnValue = true
})

//Suppression d'un bot
ipc.on("deleteBot",function(event,args){
  fs.rmdirSync(dataFolder + "/bots/" + args.botId, { recursive: true });
  new Notification({"title":"Suppression terminée","body":"Ce bot a bien été supprimé"}).show()
})

//Désinstallation d'une extension
ipc.on("uninstallExtension",function(event,args){
  fs.rmdirSync(dataFolder + "/extension-install/" + args.extensionId, { recursive: true });
  new Notification({"title":"Désinstallation terminée","body":"L'extension "+args.extensionId+" a bien été désinstallée."}).show()
})

//Initialisation de la connexion avec Discord
ipc.on("connect-discord",async function(event,args){
  try{

  	//Commence la connexion avec Discord
    RPCclient.login( {clientId,"scopes":["identify"],"redirect_uri":"https://botsonapp.me/connect"});
  }catch(e){
    
    console.log(e)
  }
  RPCclient.once("ready", async () => {
    //Mise à jour du rich presence et chargement de la page principale
    botsOnUser = new botsOnUserModule.BotsOnUser(RPCclient.accessToken,RPCclient.user)

    richPresence.init(RPCclient)
    richPresence.changeRPC({"state":"Sélectionne son bot"})
    console.log(RPCclient.user.username)

    mainWindow.loadFile('./index.html')
    mainWindow.setAlwaysOnTop(true); 
    setTimeout(function()
    {
      mainWindow.setAlwaysOnTop(false);
    },500)

    premiumData = await botsOnUser.checkMembership()
  })
  RPCclient.on("error",()=>{
  })
})

//Récupère le fichier de langage
ipc.on("getLanguageFile",function(event,language){
  var languageFile = fs.readFileSync(path.join(__dirname,"languages/"+language+".json"),"utf8")
  event.returnValue = JSON.parse(languageFile)
})

//communicate with webpage
ipc.on("firstTimeOpenApp", function (event, args) {
  if (fs.existsSync(dataFolder + "/appdata")) {
    event.returnValue = false
  } else {
    event.returnValue = true
  }
})

//Récupère la traduction
function getTranslate(lang,tr){
  var languageFile = JSON.parse(fs.readFileSync(path.join(__dirname,"languages/"+lang+".json"),"utf8"))
  return languageFile.find(l=>l.dest == "{"+tr+"}").translation
}

//Démarre l'exportation du bot
ipc.on("exportBot",async function(event,args){
  const copyAsync = promisify(fse.copy)
  const existsAsync = promisify(fs.exists)
  const mkdirAsync = promisify(fs.mkdir)
  const rmdirAsync = promisify(fs.rmdir)
  ipc.once("confirmWebPageExport",async function(event){
    if (! (await existsAsync(dataFolder+"/export"))){
      event.sender.send("webPageExport",{"subtitle":getTranslate("fr_FR","creatingExportationFile")})
      await mkdirAsync(dataFolder+"/export");
    }
    var currentId = Date.now()
    if (existsAsync(dataFolder+"/export/"+args.bot+" - "+currentId)){
      event.sender.send("webPageExport",{"subtitle":getTranslate("fr_FR","deletingExportationFile")})
      await rmdirAsync(dataFolder+"/export/"+args.bot+" - "+currentId,{recursive:true})
    }
    event.sender.send("webPageExport",{"subtitle":getTranslate("fr_FR","creatingThisExportationFolder")})
    await mkdirAsync(dataFolder+"/export/"+args.bot+" - "+currentId)
    event.sender.send("webPageExport",{"subtitle":getTranslate("fr_FR","exportationSystemCopy")})
    await copyAsync(path.join(__dirname,"export"), dataFolder+"/export/"+args.bot+" - "+currentId)
    var extensions = getBotExtensionsData({"id":args.bot})
    for (var i in extensions){
      event.sender.send("webPageExport",{"subtitle":getTranslate("fr_FR","extensionCopy")+": "+extensions[i].name + " (1/2)","percentage":Math.floor((i*2)*99/(extensions.length*2))})
      console.log(extensions[i].id + "1/2")
      await copyAsync(dataFolder+"/extension-install/"+extensions[i].id,dataFolder+"/export/"+args.bot+" - "+currentId+"/extensions/"+extensions[i].id)
      console.log(extensions[i].id + "2/2")
      event.sender.send("webPageExport",{"subtitle":"Copie de l'extension: "+extensions[i].name + " (2/2)","percentage":Math.floor((i*2+1)*99/extensions.length)})
      await copyAsync(dataFolder+"/bots/"+args.bot+"/extensions/"+extensions[i].id,dataFolder+"/export/"+args.bot+" - "+currentId+"/extensions-data/"+extensions[i].id)
    }
    event.sender.send("webPageExport",{"subtitle":getTranslate("fr_FR","finishing"),"percentage":99})
    var finalData = {}
    var botData = JSON.parse(fs.readFileSync(dataFolder+"/bots/"+args.bot+"/botdata.json","utf8"))
    console.log(botData)
    fs.writeFileSync(dataFolder+"/export/"+args.bot+" - "+currentId+"/.env","botToken="+botData.token)
    var thisBotPrefix = "!"
    if (botData.prefix){
      thisBotPrefix = botData.prefix
    }
    finalData.prefix = thisBotPrefix
    var thisBotUser = ""
    if (botData.user){
      thisBotUser = botData.user
    }
    if (RPCclient.user.id){
      finalData.user = RPCclient.user.id
    }else{
      finalData.user = thisBotUser
    }
    var thisBotIntents = {"presence":false,"guild_members":false}
    if (botData.intents){
      thisBotIntents = botData.intents
    }
    finalData.intents = thisBotIntents
    var thisBotGeneralCommands = {"help":false}
    if (botData.generalCommands){
      thisBotGeneralCommands = botData.generalCommands
    }
    finalData.generalCommands = thisBotGeneralCommands
    fs.writeFileSync(dataFolder+"/export/"+args.bot+" - "+currentId+"/config.json",JSON.stringify(finalData))
    event.sender.send("webPageExport",{"subtitle":getTranslate("fr_FR","exportationEnd"),"percentage":100,"bot":args.bot})
    
  })


  //Ouvre la fenêtre de l'exportation
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 1000,
    center: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  //load the index.html of the app.
  await mainWindow.loadFile('./webpage-files/export/export.html')
})

//Ouvre le dossier d'exportation
ipc.on("openExportFolder",function(event,args){
  console.log("receive")
  child_process.exec("explorer.exe /select,"+dataFolder+"\\export", function(stdout) {
    console.log(dataFolder)
});
})

//Retourne le dossier des données
ipc.on("getDataFolder",function(event,args){
  event.returnValue = dataFolder
})

//Ouvre la fenêtre de téléchargement pour télécharger une extension
ipc.on("startDownloadFromLink",function(event,url){
  linkSave = url
  createDownloadWindow()
})

//Commence le téléchargement d'une extension
ipc.on("downloadExtensionFromURL",function(event,args){
  var url
  if (linkSave.startsWith("botson://")){
    url = linkSave.split("botson://")[1]
  }else{
    url = linkSave
  }
  new Notification({"body":url,"title":"Test notif"}).show()
  var urlData = url.split("?")
  url = urlData[0]
  var params = urlData[1]
  var paramsDico = {}
  if (params){
    console.log(1)
    var splitParams = params.split("&")
    console.log(2)
    for (var i in splitParams){
      var data = splitParams[i].split("=")[0]
      var value = splitParams[i].split("=")[1]
      paramsDico[data] = value
    }
  }
  console.log(paramsDico)
  console.log("start")
      axios({
        method: "get",
        url: url,
        responseType: "stream"
    }).then(async function (response) {
      var fileName
      if (paramsDico["id"]){
        fileName = paramsDico["id"]
      }
      event.sender.send("downloadFinish")
      var stream = fs.createWriteStream(dataFolder+"/temp.zip")
      response.data.pipe(stream);
      stream.on("finish",async function(){
        try{
      if (!fs.existsSync(dataFolder + "/extension-install")){
        fs.mkdirSync(dataFolder + "/extension-install")
      }
        await unzip(dataFolder+"/temp.zip", {dir:dataFolder+"/extension-install"}) 
        console.log("unzip")
        event.sender.send("unzipFinish")
        if (fileName){
          var data = JSON.parse(fs.readFileSync(dataFolder+"/extension-install/"+fileName+"/extension-data.json","utf-8"))
          if (paramsDico["version"]){
            data.version = paramsDico["version"]
          }
          fs.writeFileSync(dataFolder+"/extension-install/"+fileName+"/extension-data.json",JSON.stringify(data))
        }
        event.sender.send("finalisationFinish")
    }catch(e){
      event.sender.send("error",{error:e})
    }
      
    })
    })
})

//Vérifie le token Discord
ipc.on("checkDiscordToken", async function (event, args) {
  console.log("checkToken")
  var verifierData = await discordTokenVerify.verify(args.token, discord)
  console.log(verifierData)
  if (args.addBot == true && verifierData.success) {
    var botData = verifierData.bot
    botData.token = args.token
    if (!fs.existsSync(dataFolder + "/bots")) {
      fs.mkdirSync(dataFolder + "/bots")
    }
    fs.mkdirSync(dataFolder + "/bots/" + botData.id)
    fs.writeFileSync(dataFolder + "/bots/" + botData.id + "/botdata.json", JSON.stringify(botData))
  }
  if (args.modifyBot == true && verifierData.success == true){
    if (args.botId != verifierData.bot.id){
      verifierData = {success:false}
    }else{
      var botCurrentData = JSON.parse(fs.readFileSync(dataFolder + "/bots/" + verifierData.bot.id + "/botdata.json","utf8"))
      botCurrentData.name = verifierData.bot.name
      botCurrentData.avatar = verifierData.bot.avatar
      botCurrentData.token = verifierData.bot.token
      fs.writeFileSync(dataFolder + "/bots/" + verifierData.bot.id + "/botdata.json", JSON.stringify(botCurrentData))
    }
  }
  event.sender.send("checkDiscordTokenResult", verifierData)
})

//Installe l'extension sur un bot
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

//Récupère le config d'un bot
ipc.on("getConfigData",function(event,args){
  if (args.botId && args.extensionId){
    event.sender.send("getConfigData",JSON.parse(fs.readFileSync(dataFolder+"/bots/"+args.botId+"/extensions/"+args.extensionId+"/data/webpage-data/config.json","utf8")))
  }else{
    new Notification(createErrorCode("config-2")).show()
  }
})

//Save le config d'un bot
ipc.on("saveConfigData",function(event,args){
  if (args.botId && args.extensionId){
    fs.writeFileSync(dataFolder+"/bots/"+args.botId+"/extensions/"+args.extensionId+"/data/webpage-data/config.json",JSON.stringify(args.config))
    event.sender.send("saveConfigData",{"success":true})
  }else{
    new Notification(createErrorCode("config-1")).show()
  }
})

//Récupération des données du bot (nom, tag, token, etc)
ipc.on("getBotPrivateData",function(event,args){
  var botData = JSON.parse(fs.readFileSync(dataFolder+"/bots/"+args.botId+"/botdata.json","utf8"))
  event.sender.send("getBotPrivateData",botData)
})

//Récupération des intents d'un bot
ipc.on("getBotIntents",function(event,args){
  var botData = JSON.parse(fs.readFileSync(dataFolder+"/bots/"+args.botId+"/botdata.json","utf8"))
  var thisBotIntents = {"presence_intent":false, "server_members_intent":false}
  if (botData.intents){
    thisBotIntents = botData.intents
  }
  event.sender.send("getBotIntents",thisBotIntents)
})

//Récupération des commandes générales (help)
ipc.on("getBotGeneralCommands",function(event,args){
  var botData = JSON.parse(fs.readFileSync(dataFolder+"/bots/"+args.botId+"/botdata.json","utf8"))
  var thisBotGeneralCommands = {"help":false}
  if (botData.generalCommands){
    thisBotGeneralCommands = botData.generalCommands
  }
  event.sender.send("getBotGeneralCommands",thisBotGeneralCommands)
})

//Récupération du préfix du bot
ipc.on("getBotPrefix",function(event,args){
  var botData = JSON.parse(fs.readFileSync(dataFolder+"/bots/"+args.botId+"/botdata.json","utf8"))
  var thisBotPrefix = "!"
  if (botData.prefix){
    thisBotPrefix = botData.prefix
  }
  event.sender.send("getBotPrefix",thisBotPrefix)
})

//Récupération de l'utilisateur du bot (Maintenant déprécié avec la connexion Discord)
ipc.on("getBotUser",function(event,args){
  var botData = JSON.parse(fs.readFileSync(dataFolder+"/bots/"+args.botId+"/botdata.json","utf8"))
  var thisBotUser
  if (botData.user){
    thisBotUser = botData.user
  }
  event.sender.send("getBotUser",thisBotUser)
})

//Modification du préfix du bot
ipc.on("modifyBotPrefix",function(event,args){
  var botData = JSON.parse(fs.readFileSync(dataFolder+"/bots/"+args.botId+"/botdata.json","utf8"))
  botData.prefix = args.prefix
  fs.writeFileSync(dataFolder+"/bots/"+args.botId+"/botdata.json",JSON.stringify(botData))
  event.returnValue = {"success":true}
})

//Modification de l'utilisateur de bot (Maintenant déprécié avec la connexion Discord)
ipc.on("modifyBotUser",function(event,args){
  var botData = JSON.parse(fs.readFileSync(dataFolder+"/bots/"+args.botId+"/botdata.json","utf8"))
  botData.user = args.user
  fs.writeFileSync(dataFolder+"/bots/"+args.botId+"/botdata.json",JSON.stringify(botData))
  event.returnValue = {"success":true}
})

//Modification des intents du bot
ipc.on("modifyBotIntent",function(event,args){
  var botData = JSON.parse(fs.readFileSync(dataFolder+"/bots/"+args.botId+"/botdata.json","utf8"))
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

//Modification des commandes générales du bot (help)
ipc.on("modifyBotGeneralCommand",function(event,args){
  var botData = JSON.parse(fs.readFileSync(dataFolder+"/bots/"+args.botId+"/botdata.json","utf8"))
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

//Modification de l'activation de l'extension
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

//Récupération des données d'une extension (Nom, description etc)
ipc.on("getExtensionData",function(event,args){
  if (args.id){
    if (fs.existsSync(dataFolder + "/extension-install/" + args.id + "/extension-data.json")) {
      event.returnValue = JSON.parse(fs.readFileSync(dataFolder + "/extension-install/" + args.id + "/extension-data.json","utf8"))
    }else{
      new Notification(createErrorCode("eData-2")).show()
    }
  }else{
    new Notification(createErrorCode("eData-1")).show()
  }
  
})

//Récupère les mises à jour dispo pour une extension
ipc.on("checkUpdateExtensions",async function(event){
  var extensionsFound = []
  if (fs.existsSync(dataFolder + "/extension-install")) {
    var availableExtensions = fs.readdirSync(dataFolder + "/extension-install")
    availableExtensions.forEach(function (extension) {
      if (!extension.startsWith(".") && fs.existsSync(dataFolder + "/extension-install/" + extension + "/extension-data.json")) {
        var extensionData = JSON.parse(fs.readFileSync(dataFolder + "/extension-install/" + extension + "/extension-data.json"))
        console.log(extensionData)
        var toPush = {}
        toPush.id = extensionData.id
        toPush.version = "1"
        if (extensionData.version){
          toPush.version = extensionData.version
        }
        extensionsFound.push(toPush)
      }
    })
  }
  var result = await axios.get("https://botsonapp.me/api/verify-update?extensions="+JSON.stringify(extensionsFound))
  result = result.data
  var toSend = []
  console.log(result)
  for (var i in extensionsFound){
    var extensionData = JSON.parse(fs.readFileSync(dataFolder + "/extension-install/" + extensionsFound[i].id + "/extension-data.json"))
    toSend.push({"name":extensionData.name,"id":extensionData.id,"image":extensionData.image,"status":result[extensionsFound[i].id].status,"download":result[extensionsFound[i].id].downloadLink,"extension":result[extensionsFound[i].id].extensionLink})
  }
  event.sender.send("checkUpdateExtensions",toSend)
})

function getToken(id){
  return JSON.parse(fs.readFileSync(dataFolder + "/bots/" + id + "/botdata.json","utf8")).token
}

//Coming soon!
ipc.on("getProductInfo",async function(event,args){

})

ipc.on("userOwnProduct",async function(event,args){
  
})

ipc.on("buyProduct",async function(event,args){
  
})

//Récupération des serveurs d'un bot
ipc.on("getGuilds", async function (event, args) {
  if (args.botId){
    var thisBotToken = getToken(args.botId)
    var guilds = await api.getBotGuilds(discord,thisBotToken,args.botId)
    console.log(guilds)
    event.sender.send("getGuilds",guilds)
  }else{
    return new Notification(createErrorCode("gGuilds-1")).show()
  }
})

//Récupération des salons d'un serveur
ipc.on("getGuildChannels", async function (event, args) {
  if (args.botId && args.guildId){
    var thisBotToken = getToken(args.botId)
    var channels = await api.getGuildChannels(discord,thisBotToken,args.botId,args.guildId)
    event.sender.send("getGuildChannels",channels)
  }else{
    return new Notification(createErrorCode("gChannels-1")).show()
  }
})

//Récupération des rôles d'un serveur
ipc.on("getGuildRoles", async function (event, args) {
  if (args.botId && args.guildId){
    console.log("GETROLES")
    var thisBotToken = getToken(args.botId)
    var roles = await api.getGuildRoles(discord,thisBotToken,args.botId,args.guildId)
    console.log(roles)
    event.sender.send("getGuildRoles",roles)
    var emojis = await api.getGuildEmojis(discord,thisBotToken,args.botId,args.guildId)
    console.log(emojis)
    event.sender.send("getGuildEmojis",emojis)
  }else{
    return new Notification(createErrorCode("gRoles-1")).show()
  }
})

//Récupération des émojis d'un serveur
ipc.on("getGuildEmojis", async function (event, args) {
  if (args.botId && args.guildId){
    console.log("GETEMOJIS")
    var thisBotToken = getToken(args.botId)
    var emojis = await api.getGuildEmojis(discord,thisBotToken,args.botId,args.guildId)
    event.sender.send("getGuildEmojis",emojis)
  }else{
    return new Notification(createErrorCode("gEmojis-1")).show()
  }
})

//Récupération des extensions disponible (extensions téléchargées)
ipc.on("getAvailableExtensions", function (event, args) {
  var extensionsFound = []
  if (fs.existsSync(dataFolder + "/extension-install")) {
    var availableExtensions = fs.readdirSync(dataFolder + "/extension-install")
    availableExtensions.forEach(function (extension) {
      if (!extension.startsWith(".") && fs.existsSync(dataFolder + "/extension-install/" + extension + "/extension-data.json")) {
        var extensionData = JSON.parse(fs.readFileSync(dataFolder + "/extension-install/" + extension + "/extension-data.json"))
        console.log(extensionData)
        extensionsFound.push({ "name": extensionData.name, "author": extensionData.author, "description": extensionData.description, "id": extensionData.id, "smallDescription": extensionData.smallDescription, "image": extensionData.image })
      }
    })
  }
  console.log(extensionsFound)
  event.returnValue = extensionsFound
})

//Démarre l'hébergement d'un bot
ipc.on("startHosting",async function (event,args){
  if (currentlyBotHosting){
  	//Si il y a déjà un hébergement en cours, on le stop
    currentlyBotHosting.stopHosting()
  }
  var botHosting = require("./main_scripts/hosting.js")
  botHosting.directory = dataFolder
  botHosting.electron = electron
  botHosting.dataExtensionFolder = dataFolder+"/bots/" + args.id + "/extensions"
  botHosting.ipc = ipc
  botHosting.path = path
  botHosting.notification = Notification
  var botData = JSON.parse(fs.readFileSync(dataFolder+"/bots/"+args.id+"/botdata.json","utf8"))
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
  if (!premiumData){
    premiumData = {}
    premiumData.premium = false
  }
  var botHostingResult = await botHosting.startHosting(discord,getToken(args.id),getBotExtensionsData(args),premiumData.premium,event.sender)
  console.log(botHostingResult)
  if (botHostingResult.success == false){
    new Notification({"title":"Erreur d'hébergement", "body":"Vérifiez que les intents de votre bot soient bien activés sur Discord.com et vérifiez votre Token"}).show()
  }
  currentlyBotHosting = botHosting
  event.sender.send("startHosting",botHostingResult)
})

//Fin de l'hébergement
ipc.on("endHosting",async function (event,args){
  if (currentlyBotHosting){
    var botHostingResult = await currentlyBotHosting.stopHosting()
    event.sender.send("endHosting",botHostingResult)
  }
})

//Récupération des extensions d'un bot
ipc.on("getBotExtensions",async function (event, args) {
  var botExtensions =  getBotExtensionsData(args)
  event.returnValue = botExtensions
})

//Récupération des données d'un bot
ipc.on("getBotData", function (event, args) {
  event.returnValue = JSON.parse(fs.readFileSync(dataFolder + "/bots" + "/" + args.id + "/botData.json", "utf8"))
})

//Récupération de l'utlisateur qui utilise BotsOn
ipc.on("getUser",function(event,args){
  event.returnValue = RPCclient.user
})

//Récupération des pièces de l'utilisateur pour l'afficher
ipc.on("getUserCoins",async function(event,args){
    event.sender.send("getUserCoins",await botsOnUser.getCoins())
})

//Récupération de tous les bots sauvegardées sur BotsOn
ipc.on("getUserBots", function (event, args) {
  var currentBots = []
  //check if folder with bot exist
  if (fs.existsSync(dataFolder + "/bots")) {
    //get all bots save
    var bots = fs.readdirSync(dataFolder + "/bots")
    bots.forEach(function (bot) {
      if (!bot.startsWith(".")){
        var thisBotData = JSON.parse(fs.readFileSync(dataFolder + "/bots" + "/" + bot + "/botData.json", "utf8"))
        console.log(thisBotData)
        currentBots.push(thisBotData)
      }
    })
  }
  event.returnValue = currentBots
})

//Copie du fichier de débuggage
function copyDebugFile(){
  var currentBots = []
  if (fs.existsSync(dataFolder + "/bots")) {
    //get all bots save
    var bots = fs.readdirSync(dataFolder + "/bots")
    bots.forEach(function (bot) {
      if (!bot.startsWith(".")){
        var thisBotData = JSON.parse(fs.readFileSync(dataFolder + "/bots" + "/" + bot + "/botData.json", "utf8"))
        console.log(thisBotData)
        thisBotData.token = "***" 
        var extensionsData = []
        var extensions = fs.readdirSync(dataFolder + "/bots" + "/" + bot +"/extensions")
        extensions.forEach(function (extension) {
          if (!extension.startsWith(".")){
            extensionsData.push(extension)
          }
        })
        currentBots.push({"data":thisBotData,"extensions":extensionsData})
      }
    })
  }
  var currentExtensions = []
  if (fs.existsSync(dataFolder + "/extension-install")) {
    var extensions = fs.readdirSync(dataFolder + "/extension-install")
    extensions.forEach(function (extension) {
      if (!extension.startsWith(".") && fs.existsSync(dataFolder + "/extension-install" + "/" + extension + "/extension-data.json")){
        var thisExtensionData = JSON.parse(fs.readFileSync(dataFolder + "/extension-install" + "/" + extension + "/extension-data.json", "utf8"))
        currentExtensions.push(thisExtensionData)
      }
    })
  }
  console.log(JSON.stringify(currentBots), JSON.stringify(currentExtensions))
  console.log(JSON.stringify({"bots":currentBots,"extensions":currentExtensions}))
  clipboard.writeText(JSON.stringify({"bots":currentBots,"extensions":currentExtensions}))
}