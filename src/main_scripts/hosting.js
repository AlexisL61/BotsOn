

var fs = require("fs")

var Discord = require("discord.js")

var electron = require("electron")
var {Notification,app,ipcMain} = require("electron")

const child_process = require("child_process")

var canvas  = require("./canvas.js")
var {openCanvasWindow} = require("./window-opener")

const Bot = require("./class/bot")
const Extension = require("./class/extension/extension.js")

const directory = app.getPath('userData')


class Hosting{
    /**
     * Créé un objet Hosting
     * @param {Bot} bot discord
     * @param {Array<Extension>} extensions Extensions du bot
     * @param {boolean} isPremium Valeur montrant si l'utilisateur est premium ou non
     */
    constructor(bot,extensions,isPremium,currentUser){
        this.bot = bot
        this.extensions = extensions
        this.premiumUser = isPremium
        this.currentUser = currentUser
    }

    
    startCanvas(){
        var hostingNeedCanvas = false
        for (var i in this.extensions){
            var thisExtension = this.extensions[i]
            if (thisExtension.status.active){
                if (thisExtension.extension_data.require && thisExtension.extension_data.require.find(data=>data=="canvas")){
                    hostingNeedCanvas = true
                }
            }
        }
        if (hostingNeedCanvas){
            var currentOpenWebPage = openCanvasWindow()
            this.currentOpenWebPage = currentOpenWebPage
            canvas.init(currentOpenWebPage.webContents, ipcMain)
        }
    }
    launchExtensions(){
        try{
            for (var i in this.extensions){
                if (this.extensions[i].status.active){
                    //Effaçage du cache pour le require pour que les tests d'extensions ne requiert pas de redémarrage de l'application
                    if (require.cache[require.resolve(directory+"/extension-install/"+this.extensions[i].id+"/back-end/main.js")]){
                        delete require.cache[require.resolve(directory+"/extension-install/"+this.extensions[i].id+"/back-end/main.js")]
                    }

                    //Ajout des variables:
                    var thisExtensionHost = require(directory+"/extension-install/"+this.extensions[i].id+"/back-end/main.js")
                    thisExtensionHost.client = this.client
                    thisExtensionHost.electron = electron
                    thisExtensionHost.location = directory+"/extension-install/"+this.extensions[i].id
                    thisExtensionHost.dataFolder = directory + "/bots/" + this.bot.id + "/extensions/"+this.extensions[i].id+"/data"
                    thisExtensionHost.prefix = this.bot.prefix
                    thisExtensionHost.intents = this.bot.intents
                    thisExtensionHost.user = this.currentUser
                    thisExtensionHost.discord = Discord
                    thisExtensionHost.onApp = true

                    if (this.extensions[i].extension_data.require && this.extensions[i].extension_data.require.find(data=>data=="canvas")){
                        thisExtensionHost.canvas = canvas
                    }

                    thisExtensionHost.start()
                }
            }


        }catch(e){
            if (!fs.existsSync(directory+"/logs")){
                fs.mkdirSync(directory+"/logs")
            }
            fs.writeFileSync(directory+"/logs/"+this.extensions[i].id+".txt",e)
            var thisIndex = i
            var customNotification = new Notification({"title":"Erreur démarrage d'extension","body":"L'extension "+this.extensions[i].name+" n'a pas pu démarrer. Cliquez pour voir l'erreur"})
            customNotification.show()
            customNotification.addListener('click', () => { 
                console.log("click")
                console.log(directory)
                child_process.exec('start "" '+directory+"\\logs\\"+this.extensions[thisIndex].id+".txt", function() {
                });
            });
        }
    }

    startHelpFunction(){
        var helpEmbed = {
            "title":"Help",
            "fields":[]
        }
        if (this.bot.generalCommands.help){
            for (var i in this.extensions){
                if (this.extensions[i].status.active){
                    var extensionData = this.extensions[i].extension_data
                    if (extensionData.help && extensionData.help.active){
                        while (extensionData.help.field.name.includes("{prefix}")){
                            extensionData.help.field.name = extensionData.help.field.name.replace("{prefix}",this.bot.prefix)
                        }
                        while (extensionData.help.field.value.includes("{prefix}")){
                            extensionData.help.field.value = extensionData.help.field.value.replace("{prefix}",this.bot.prefix)
                        }
                        helpEmbed.fields.push(extensionData.help.field)
                    }
                }
            }
            if (this.isPremium == false){
                helpEmbed.fields.push({
                    "name": "Crédits",
                    "value": "Créé avec [BotsOn](https://botsonapp.me/)"
                })
            }
            this.client.on("message",function(message){
                if (message.content.toLowerCase().startsWith(this.prefix+"help")){
                    message.channel.send({"embed":helpEmbed})
                }
            })
        }
    }

    startHosting(){
        var totalIntentsBit = this.bot.buildIntents()
        var client = new Discord.Client({ws:{intents:totalIntentsBit}})
        this.client = client
        var currentHosting = this
        client.login(this.bot.token)
        .then()
        .catch(function(error){
            console.log(error)
            currentHosting.client.emit("botLogin",{"success":false,"error":"onLogin"})
        })
        client.once("ready",function(){
            currentHosting.startCanvas()
            currentHosting.launchExtensions()
            currentHosting.client.emit("botLogin",{"success":true})
        })
        return new Promise((resolve) => {
            client.once("botLogin",function(data){
                resolve(data)
            })
        })
    }

    stopHosting(){
        if (this.client){
            this.client.emit("stopHosting")
            this.client.destroy()
        }
        if (this.currentOpenWebPage){
            try{
                this.currentOpenWebPage.close()
            }catch(e){
                //
            }
        }
        return {"success":true}
    }
}

module.exports = Hosting