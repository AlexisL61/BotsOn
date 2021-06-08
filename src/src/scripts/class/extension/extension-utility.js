const fs = require("fs");
const Extension = require("./extension")
const axios = require("axios")
var dataFolder;

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
    verifyUpdate:verifyUpdate
}