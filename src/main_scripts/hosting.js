
var client,directory,dataExtensionFolder,ipcRenderer,prefix,intents,user,path
var fs = require("fs")
var currentOpenWebPage
var canvas  = require("./canvas.js")
console.log(canvas)
module.exports = {

    startHosting(Discord,token,extensions){
        var helpEmbed = {
            "title":"Help",
            "fields":[
        
            ]
        }

        directory = this.directory
        electron = this.electron
        dataExtensionFolder = this.dataExtensionFolder
        ipcRenderer = this.ipc
        prefix = this.prefix
        intents = this.intents
        user = this.user
        path = this.path
        generalCommands = this.generalCommands
        if (client != undefined){
            client.destroy()
        }
        var DiscordIntents = Discord.Intents
        var totalIntentsBit = new Discord.Intents()
        totalIntentsBit.add(DiscordIntents.NON_PRIVILEGED)
        if (intents.presence){
            totalIntentsBit.add("GUILD_PRESENCES")
        }
        if (intents.guild_members){
            totalIntentsBit.add("GUILD_MEMBERS")
        }
        client = new Discord.Client({ws:{intents:totalIntentsBit}})
        client.login(token)
        
        .then()
        .catch(function(error){
            console.log(error)
            client.emit("botLogin",{"success":false,"error":"onLogin"})
        })
        
        client.once("ready",async function(){
            console.log(extensions)
            var needCanvas = false
            for (var i in extensions){
                if (extensions[i].active){
                    var thisExtensionHost = JSON.parse(fs.readFileSync(directory+"/extension-install/"+extensions[i].id+"/extension-data.json"))
                    if (thisExtensionHost.require && thisExtensionHost.require.find(data=>data=="canvas")){
                        needCanvas = true
                    }
                }
            }
            if (needCanvas == true){
                currentOpenWebPage = new electron.BrowserWindow({
                    width:1000,
                    height:1000,
                    center: true,
                    show:false,
                    webPreferences: {
                        preload: path.join(__dirname, '../preload.js')
                    }
                })
                await currentOpenWebPage.loadFile('./webpage-files/canvas/canvas.html')
                currentOpenWebPage.webContents.openDevTools()
                canvas.init(currentOpenWebPage.webContents,ipcRenderer)
            }
            for (var i in extensions){
                if (extensions[i].active){
                    var thisExtensionData = JSON.parse(fs.readFileSync(directory+"/extension-install/"+extensions[i].id+"/extension-data.json"))
                    var thisExtensionHost = require(directory+"/extension-install/"+extensions[i].id+"/back-end/main.js")
                    thisExtensionHost.client = client
                    thisExtensionHost.electron = electron
                    thisExtensionHost.location = directory+"/extension-install/"+extensions[i].id
                    thisExtensionHost.dataFolder = dataExtensionFolder+"/"+extensions[i].id+"/data"
                    thisExtensionHost.prefix = prefix
                    thisExtensionHost.intents = intents
                    thisExtensionHost.user = user
                    thisExtensionHost.discord = Discord
                    thisExtensionHost.onApp = true
                    if (thisExtensionData.require && thisExtensionData.require.find(data=>data=="canvas")){
                        thisExtensionHost.canvas = canvas
                        console.log(canvas)
                    }
                    console.log("thisExtensionHost")
                    thisExtensionHost.start()
                }
            }
            client.emit("botLogin",{"success":true})
        })

        if (generalCommands.help){
            for (var i in extensions){
                if (extensions[i].active){
                    var extensionData = JSON.parse(fs.readFileSync(directory+"/extension-install/"+extensions[i].id+"/extension-data.json","utf-8"));
                    if (extensionData.help && extensionData.help.active){
                        while (extensionData.help.field.name.includes("{prefix}")){
                            extensionData.help.field.name = extensionData.help.field.name.replace("{prefix}",prefix)
                        }
                        while (extensionData.help.field.value.includes("{prefix}")){
                            extensionData.help.field.value = extensionData.help.field.value.replace("{prefix}",prefix)
                        }
                        helpEmbed.fields.push(extensionData.help.field)
                    }
                }
            }
            client.on("message",function(message){
                console.log("MESSAGE")
                if (message.content.toLowerCase().startsWith(prefix+"help")){
                    message.channel.send({"embed":helpEmbed})
                }
            })
        }

        return new Promise((resolve, reject) => {
            client.once("botLogin",function(data){
                resolve(data)
            })
        })

       

        
    },
    stopHosting(){
        if (client){
            client.emit("stopHosting")
            client.destroy()
        }
        if (currentOpenWebPage){
            currentOpenWebPage.close()
        }
        return {"success":true}
    }
}