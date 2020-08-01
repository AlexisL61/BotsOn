var ipcRenderer = parent.ipcRenderer
var botGuilds
var configData = {}
console.log("a")
ipcRenderer.send("getConfigData", { "botId": parent.currentBotOpenId, "extensionId": "welcome-goodbye-extension" })
ipcRenderer.send("getGuilds", { "botId": parent.currentBotOpenId })
ipcRenderer.on("getGuilds", async function (event, guildsData) {
    if (guildsData.success == true) {
        botGuilds = guildsData.data
        document.getElementById("serverSelect").innerHTML = `<option value="default">--Choisissez un serveur--</option>`
        for (var i in botGuilds) {
            ipcRenderer.send("getGuildChannels", { "botId": parent.currentBotOpenId, "guildId": botGuilds[i].id })
            document.getElementById("serverSelect").innerHTML += `<option value="` + botGuilds[i].id + `">` + botGuilds[i].name + `</option>`
        }
    }
})
ipcRenderer.on("getGuildChannels", async function(event,guildChannels){
    console.log(guildChannels)
    if (guildChannels.success == true) {
        botGuilds.find(guild=>guild.id == guildChannels.guildId).channels = guildChannels.data
        console.log(botGuilds)
    }
})

ipcRenderer.on("getConfigData", async function(event,config){
    configData = config
    console.log(configData)
})

ipcRenderer.on("saveConfigData", async function(event,result){
    if (result.success == true){
        document.getElementById("save-config-div-result").style.display = "block"
    }
})

function saveConfig(){
    var serverId = document.getElementById("serverSelect").value
    if (serverId!="default"){
        configData[serverId] = {"welcome":{},"goodbye":{}}
        configData[serverId].welcome.channel = document.getElementById("welcomeChannelSelect").value
        configData[serverId].goodbye.channel = document.getElementById("goodbyeChannelSelect").value
        configData[serverId].welcome.message = document.getElementById("welcomeMessageInput").value
        configData[serverId].goodbye.message = document.getElementById("goodbyeMessageInput").value
        ipcRenderer.send("saveConfigData",{"config":configData,"extensionId":"welcome-goodbye-extension","botId":parent.currentBotOpenId})
    }
}

function serverOnChange(){
    var server = document.getElementById("serverSelect").value
    document.getElementById("save-config-div-result").style.display = "none"
    if (server!="default"){
        document.getElementById("configMessagesArea").style.display = "block"
        var thisServerData = botGuilds.find(guild=>guild.id == server)
        document.getElementById("welcomeChannelSelect").innerHTML = `<option value="default">Aucun salon</option>`
        document.getElementById("goodbyeChannelSelect").innerHTML = `<option value="default">Aucun salon</option>`
        for (var i in thisServerData.channels){
            if (thisServerData.channels[i].type == "text"){
                document.getElementById("goodbyeChannelSelect").innerHTML+= `<option value="` + thisServerData.channels[i].id + `">` + thisServerData.channels[i].name + `</option>`
                document.getElementById("welcomeChannelSelect").innerHTML+= `<option value="` + thisServerData.channels[i].id + `">` + thisServerData.channels[i].name + `</option>`
            }
        }
        document.getElementById("welcomeMessageInput").value = ""
        document.getElementById("goodbyeMessageInput").value = ""
        if (configData[server] && configData[server].welcome){
            if (configData[server].welcome.channel != "default"){
                document.getElementById("welcomeChannelSelect").value = configData[server].welcome.channel
            }
            document.getElementById("welcomeMessageInput").value = configData[server].welcome.message
        }
        if (configData[server] && configData[server].goodbye){
            if (configData[server].goodbye.channel != "default"){
                document.getElementById("goodbyeChannelSelect").value = configData[server].goodbye.channel
            }
            document.getElementById("goodbyeMessageInput").value = configData[server].goodbye.message
        }
    }
}