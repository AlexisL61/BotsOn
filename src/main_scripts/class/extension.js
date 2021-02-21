const fs = require("fs");
const axios = require("axios")
var dataFolder;

class Extension{
    id;
    url;
    name;
    image;
    smallDescription;
    description;
    author;
    version;

    constructor(data){
        this.id = data;
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

class BotExtension extends Extension{

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
    for (var i in extensionsFound){
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
                thisExtension = new Extension(extension)
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
    verifyUpdate:verifyUpdate
}