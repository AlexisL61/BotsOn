const fs = require("fs");
const {app} = require('electron')
const dataFolder = app.getPath('userData')

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

module.exports = Extension