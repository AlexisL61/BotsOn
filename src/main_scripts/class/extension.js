const fs = require("fs");
const axios = require("axios")
var dataFolder;

/**
 * @class Extension
 * @classdesc Extension BotsOn
 * 
 * @property {string} id - Id de l'extension
 * @property {string} url - Url de l'extension
 * @property {string} name - Nom de l'extension
 * @property {string} image - Image de l'extension
 * @property {string} smallDescription - Petite description de l'extension
 * @property {string} description - Description de l'extension
 * @property {string} author - Auteur de l'extension
 * @property {string} version - Version de l'extension
 * @property {object} extension_data - Données du fichier extension-data.json de l'extension
 */
class Extension{    
    constructor(id){
        this.id = id;
        this.url = dataFolder + "/extension-install/" + this.id + "/extension-data.json"
        console.log(this.url)
        if (!fs.existsSync(this.url)){
            this.id = undefined;
            this.url = undefined;
            return;
        }
        this.extension_data = JSON.parse(fs.readFileSync(dataFolder + "/extension-install/" + this.id + "/extension-data.json"))
        
        //Définition des variables provenant du extension_data.json
        this.name = this.extension_data.name
        this.image = this.extension_data.image
        this.smallDescription = this.extension_data.smallDescription
        this.description = this.extension_data.description
        this.author = this.extension_data.author
        this.version = this.extension_data.version
        if (!this.version){
            this.version = "1"
        }
    }
    uninstall(){
        try {
            fs.rmdirSync(dataFolder + "/extension-install/" + this.id, { recursive: true });
            return {"success":true}
        }catch(e){
            return {"success":false}
        }
    }
    toJSON(){
        return {id:this.id,name:this.name,url:this.url,image:this.image,smallDescription:this.smallDescription,description:this.description,author:this.author,version:this.version}
    }
    generateUpdateVerification(){
        var toPush = {}
        toPush.id = this.id
        toPush.version = "1"
        if (this.version){
            toPush.version = this.version
        }
        return toPush
    }
}
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


async function verifyUpdate(){
    var extensionsFound = getInstallExtensions()
    for (var i in extensionsFound){
        extensionsFound[i] = extensionsFound[i].generateUpdateVerification()
    }
    var result = await axios.get("https://botsonapp.me/api/verify-update?extensions="+JSON.stringify(extensionsFound))
    result = result.data
    var toSend = []
    console.log(result)
    for (i in extensionsFound){
        var extensionData = new Extension(extensionsFound[i].id)
        toSend.push({"name":extensionData.name,"id":extensionData.id,"image":extensionData.image,"status":result[extensionsFound[i].id].status,"download":result[extensionsFound[i].id].downloadLink,"extension":result[extensionsFound[i].id].extensionLink})
    }
    console.log(toSend)
    return toSend
}

function getInstallExtensions(){
    var extensionsFound = []
    if (fs.existsSync(dataFolder + "/extension-install")) {
        var availableExtensions = fs.readdirSync(dataFolder + "/extension-install")
        availableExtensions.forEach(function (extension) {
            if (!extension.startsWith(".") && fs.existsSync(dataFolder + "/extension-install" + "/" + extension + "/extension-data.json")){
                //console.log(extension)
                var thisExtension = new Extension(extension)
                extensionsFound.push(thisExtension)
            }
        })
    }
    return extensionsFound
}

module.exports = {
    init(dF){
        dataFolder = dF;
    },
    getInstallExtensions:getInstallExtensions,
    verifyUpdate:verifyUpdate,
    Extension:Extension,
    BotExtension:BotExtension
}