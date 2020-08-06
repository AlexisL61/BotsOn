var client,directory,dataExtensionFolder

module.exports = {

    startHosting(Discord,token,extensions){
        directory = this.directory
        electron = this.electron
        dataExtensionFolder = this.dataExtensionFolder
        if (client != undefined){
            client.destroy()
        }
        client = new Discord.Client()
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
                    thisExtensionHost.dataFolder = dataExtensionFolder+"/"+extensions[i].id+"/data"
                    console.log("thisExtensionHost")
                    thisExtensionHost.start()
                }
            }
            client.emit("botLogin",{"success":true})
        })
        return new Promise((resolve, reject) => {
            client.once("botLogin",function(data){
                resolve(data)
            })
        })
    },
    stopHosting(){
        if (client){
        client.destroy()
        }
        return {"success":true}
    }
}