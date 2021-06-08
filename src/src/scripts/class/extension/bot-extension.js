const fs = require("fs");
const {app} = require('electron')
const dataFolder = app.getPath('userData')
const Extension = require("./extension")
/**
 * Représentation d'une extension dans un bot
 * 
 * @class BotExtension
 * @classdesc 
 * 
 * 
 */
 class BotExtension extends Extension{
    constructor(id,bot){
        super(id)
        this.bot = bot
        this.status = JSON.parse(fs.readFileSync(dataFolder+"/bots/"+bot.id+"/extensions/"+id+"/status.json","utf-8"))
    }

    /**
     * Supprime une extension d'un bot
     * 
     * @returns {boolean} Succès - true si la suppression s'est bien passé, false sinon
     */
    delete(){
        try{
            fs.rmdirSync(dataFolder + "/bots/" + this.bot.id + "/extensions/" + this.id, { recursive: true });
            return true
        }catch(e){
            return false
        }
    }

    /**
     * Retourne la configuration de l'extension
     * 
     * @return {object} Configuration - Configuration de l'extension
     */
    getConfig(){
        console.log(this.bot)
        if (fs.existsSync(dataFolder+"/bots/"+this.bot.id+"/extensions/"+this.id+"/data/webpage-data/config.json"))
            return fs.readFileSync(dataFolder+"/bots/"+this.bot.id+"/extensions/"+this.id+"/data/webpage-data/config.json","utf-8")
        return undefined
    }

    /**
     * Sauvegarde la configuration donnée
     * @param {object} config - Configuration
     */
    saveConfig(config){
        this.status = config
        fs.writeFileSync(dataFolder+"/bots/"+this.bot.id+"/extensions/"+this.id+"/data/webpage-data/config.json",JSON.stringify(config))
    }

    /**
     * Retourne le statut de l'extension
     * 
     * @return {object} Statut - Statut de l'extension
     */
    getStatus(){
        var thisExtension = this
        if (fs.existsSync(dataFolder+"/bots/"+thisExtension.bot.id+"/extensions/"+thisExtension.id+"/status.json"))
            return JSON.parse(fs.readFileSync(dataFolder+"/bots/"+thisExtension.bot.id+"/extensions/"+thisExtension.id+"/status.json","utf-8"))
        return undefined
    }

    /**
     * Sauvegarde le statut donné
     * @param {object} config - Configuration
     */
    saveStatus(config){
        fs.writeFileSync(dataFolder+"/bots/"+this.bot.id+"/extensions/"+this.id+"/status.json",JSON.stringify(config))
        return
    }
}

module.exports = BotExtension