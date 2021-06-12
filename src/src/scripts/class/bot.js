var fs =require("fs")

const {app} = require("electron")
const dataFolder = app.getPath('userData')
const BotExtension = require("./extension/bot-extension")
const Discord = require("discord.js")

/**
 * Création d'un bot
 */
class Bot{
    /**
     * Créé un bot Discord à partir d'un id de bot
     * @param {Discord.Snowflake} id Id du bot
     */
    constructor(id) {
        if (!fs.existsSync(dataFolder+"/bots/"+id+"/botdata.json"))
            return this.id = undefined
        /**
        * @type {Discord.Snowflake}
        */
        this.id = id
        this.bot_data = JSON.parse(fs.readFileSync(dataFolder+"/bots/"+id+"/botdata.json","utf8"))
        this.name = this.bot_data.name
        this.token = this.bot_data.token
        this.avatar = this.bot_data.avatar
        this.prefix = this.bot_data.prefix
        this.intents = this.bot_data.intents
        this.generalCommands = this.bot_data.generalCommands

        if (!this.prefix){
            this.prefix = "!"
        }
        if (!this.intents){
            this.intents = {"guild_members":false,"presence":false}
        }
        if (!this.generalCommands){
            this.generalCommands = {"help":false}
        }
    }

    /**
     * Retourne les extensions installées sur le bot
     * 
     * @returns {Array<BotExtension>} Extensions - Extensions du bot
     */
    getExtensions(){
        var extensions = fs.readdirSync(dataFolder + "/bots/" + this.id + "/extensions")
        var botExtensions = []
        var thisBot = this
        extensions.forEach(function (extension) {
            if (!extension.startsWith(".") && fs.existsSync(dataFolder + "/extension-install/" + extension )){
                var thisBotExtension = new BotExtension(extension,thisBot)
                botExtensions.push(thisBotExtension)
            }
        })
        return botExtensions
    }

    /**
     * Efface le bot
     * 
     * @return {boolean} Status - Retourne true si la suppression s'est bien passé, false sinon
     */
    delete(){
        try{
            fs.rmdirSync(dataFolder + "/bots/" + this.id, { recursive: true });
            return true
        }catch(e){
            return false
        }
    }

    /**
     * Ajoute une extension au bot
     * 
     * @param {string}  extension - Id d'extension
     * @return {boolean} Status - Retourne true si l'installation s'est bien passé, false sinon
     */
    installExtension(extension){
        if (!fs.existsSync(dataFolder+"/bots/"+this.id+"/extensions")){
            fs.mkdirSync(dataFolder+"/bots/"+this.id+"/extensions")
        }
        if (fs.existsSync(dataFolder+"/bots/"+this.id+"/extensions/"+extension)){
            fs.rmdirSync(dataFolder+"/bots/"+this.id+"/extensions/"+extension,{recursive:true})
        }
        fs.mkdirSync(dataFolder+"/bots/"+this.id+"/extensions/"+extension)
        fs.writeFileSync(dataFolder+"/bots/"+this.id+"/extensions/"+extension+"/status.json",JSON.stringify({"active":true}))
        fs.mkdirSync(dataFolder+"/bots/"+this.id+"/extensions/"+extension+"/data")
        fs.mkdirSync(dataFolder+"/bots/"+this.id+"/extensions/"+extension+"/data/webpage-data")
        fs.writeFileSync(dataFolder+"/bots/"+this.id+"/extensions/"+extension+"/data/webpage-data/config.json",JSON.stringify({}))
        fs.mkdirSync(dataFolder+"/bots/"+this.id+"/extensions/"+extension+"/data/bot-data")
    }

    /**
     * Sauvegarde le bot
     */
    save(){
        var toSave = {}
        toSave.id = this.id
        toSave.name = this.name
        toSave.token = this.token
        toSave.avatar = this.avatar
        toSave.prefix = this.prefix
        toSave.intents = this.intents
        toSave.generalCommands = this.generalCommands

        fs.writeFileSync(dataFolder+"/bots/"+this.id+"/botdata.json",JSON.stringify(toSave))
    }

    /**
     * Génère les intents requis du bot sous formes de Bit, compatible avec Discord.js
     * @returns {Discord.Intents} Intents - Intents de discord.js
     */
    buildIntents(){
        var DiscordIntents = Discord.Intents
        var totalIntentsBit = new Discord.Intents()
        totalIntentsBit.add(DiscordIntents.NON_PRIVILEGED)
        if (this.intents.presence){
            totalIntentsBit.add("GUILD_PRESENCES")
        }
        if (this.intents.guild_members){
            totalIntentsBit.add("GUILD_MEMBERS")
        }
        return totalIntentsBit
    }
}

module.exports = Bot