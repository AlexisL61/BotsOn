//---------------------------------------------------//
//---------------------------------------------------//
//                     BotsOn                        //
//---------------------------------------------------//
//---------------------------------------------------//

//Ce bot provient d'une exportation du bot par BotsOn
//Merci d'utiliser l'application!

console.log('\x1b[36m%s\x1b[0m', '---------------------------------------------------\n---------------------------------------------------\n                     BotsOn                        \n---------------------------------------------------\n---------------------------------------------------\n\nCe bot provient d\'une exportation de bot par BotsOn\nMerci d\'utiliser l\'application!'); 
console.log("\x1b[0m")
const fs = require("fs")
if (!fs.existsSync("./node_modules")) console.warn("Vous devez tout d'abord lancer install.bat pour installer les modules requis")
const Discord = require("discord.js")
require('dotenv').config();
var canvas  = require("./main_scripts/canvas.js")

var configData = JSON.parse(fs.readFileSync("./config.json","utf-8"))

var prefix = configData.prefix
var intents = configData.intents
var user = configData.user
var generalCommands = configData.generalCommands
var helpEmbed = {
    "title":"Help",
    "fields":[

    ]
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

var client = new Discord.Client({ws:{intents:totalIntentsBit}})
// eslint-disable-next-line no-undef
client.login(process.env.botToken)
.then()
.catch(function(e){
    console.log(e)
    console.log("\x1b[31m","Un problème est survenu. Cela peut provenir d'un token mauvais ou d'une mauvaise configuration d'intents.","\x1b[0m")
})
var extensions = getBotExtensionsData()

client.once("ready",async function(){
    var needCanvas = false
    for (var i in extensions){
        if (extensions[i].active){
            var thisExtensionHost = JSON.parse(fs.readFileSync("./extensions/"+extensions[i].id+"/extension-data.json","utf8"))
            if (thisExtensionHost.require && thisExtensionHost.require.find(data=>data=="canvas")){
                needCanvas = true
            }
        }
    }
    if (needCanvas == true){
        canvas.init(false)
    }
    console.log('\x1b[36m%s\x1b[0m', 'Démarrage des extensions',"\x1b[0m");
    for (i in extensions){
        if (extensions[i].active){
            var thisExtensionData = JSON.parse(fs.readFileSync("./extensions/"+extensions[i].id+"/extension-data.json"))
            thisExtensionHost = require("./extensions/"+extensions[i].id+"/back-end/main.js")
            thisExtensionHost.client = client
            thisExtensionHost.electron = undefined
            thisExtensionHost.location = "./extensions/"+extensions[i].id
            thisExtensionHost.dataFolder = "./extensions-data/"+extensions[i].id+"/data"
            thisExtensionHost.prefix = prefix
            thisExtensionHost.intents = intents
            thisExtensionHost.user = user
            thisExtensionHost.discord = Discord
            thisExtensionHost.onApp = false
            if (thisExtensionData.require && thisExtensionData.require.find(data=>data=="canvas")){
                thisExtensionHost.canvas = canvas
            }
            try{
                console.log('\x1b[36m%s\x1b[0m', 'Démarrage de l\'extension: '+extensions[i].name,"\x1b[0m");
                thisExtensionHost.start()
            }catch(e){
                console.log(e)
            }
            
        }
    }
    
})

if (generalCommands.help){
    for (var i in extensions){
        if (extensions[i].active){
            var extensionData = JSON.parse(fs.readFileSync("./extensions/"+extensions[i].id+"/extension-data.json","utf-8"));
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
        if (message.content.toLowerCase().startsWith(prefix+"help")){
            message.channel.send({"embed":helpEmbed})
        }
    })
}

function getBotExtensionsData(){
    var botExtensions = []
      var extensions = fs.readdirSync("./extensions")
      extensions.forEach(function (extension) {
        if (fs.existsSync("./extensions/" + extension )){
            var thisExtensionData = JSON.parse(fs.readFileSync( "./extensions/" + extension + "/extension-data.json","utf8"))
            thisExtensionData.active = JSON.parse(fs.readFileSync("./extensions-data/" + extension + "/status.json", "utf8")).active
            botExtensions.push(thisExtensionData)
        }
      })
    return botExtensions
  }