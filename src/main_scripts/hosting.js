
var client,directory,dataExtensionFolder,ipcRenderer,prefix,intents,user
var fs = require("fs")


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
        ipcRenderer = this.ipcRenderer
        prefix = this.prefix
        intents = this.intents
        user = this.user
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
        
        client.once("ready",function(){
            console.log(extensions)
            for (var i in extensions){
                if (extensions[i].active){
                    var thisExtensionHost = require(directory+"/extension-install/"+extensions[i].id+"/back-end/main.js")
                    thisExtensionHost.client = client
                    thisExtensionHost.electron = electron
                    thisExtensionHost.location = directory+"/extension-install/"+extensions[i].id
                    thisExtensionHost.dataFolder = dataExtensionFolder+"/"+extensions[i].id+"/data"
                    thisExtensionHost.prefix = prefix
                    thisExtensionHost.intents = intents
                    thisExtensionHost.user = user
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
        return {"success":true}
    }
}