var client
var botId

function connectBot(discord, token) {
    client = new discord.Client()
    client.login(token)
        .catch(function (error) {
            console.log("error")
            client.emit("botLogin", { "success": false })
        })
    client.once("ready", function () {
        console.log("client "+client)
        botId = client.user.id
        client.emit("botLogin", { "success": true})
    })
    client.once("error", function (error) {
        client.emit("botLogin", { "success": false })
    })

    return new Promise((resolve, reject) => {
        client.once("botLogin", function (data) {
            resolve(data)
        })
    })
}
module.exports = {
    async getBotGuilds(discord, token, id) {
        console.log("getBotGuilds")
        var dataToKeep = ["id", "name"]
        if (!client || !client.user || client.user.id != id) {
            var connectBotData = await connectBot(discord, token)
            if (connectBotData.success == false) {
                return { "success": false, "error": "Bot can not connect" }
            }
        }
        var guildsArray = []
        client.guilds.cache.each(function (guild) {
            var data = {}
            for (var i in dataToKeep) {
                data[dataToKeep[i]] = guild[dataToKeep[i]]
            }
            guildsArray.push(data)
        })
        console.log("endgetBotGuilds")
        return { "success": true, "data": guildsArray }
    },
    async getGuildChannels(discord,token,id,guildId){
        console.log("getGuildChannels")
        var dataToKeep = ["id","name","parent","type"]
        if (!client || !client.user || client.user.id!=id){
            var connectBotData = await connectBot(discord,token)
            if (connectBotData.success == false){
                return {"success":false,"error":"Bot can not connect"}
            }
        }
        var channelsArray = []
    client.guilds.cache.get(guildId).channels.cache.each(function(channel){
      var data = {}
      for (var i in dataToKeep){
          if (dataToKeep[i] == "parent" && channel[dataToKeep[i]]){
            data[dataToKeep[i]] = {}
            var parentDataToKeep = ["name","id"]
            for (var a in parentDataToKeep){
                data[dataToKeep[i]][parentDataToKeep[a]] = channel[dataToKeep[i]][parentDataToKeep[a]]
            }
          }else{
            data[dataToKeep[i]] = channel[dataToKeep[i]]
          }
      }
      channelsArray.push(data)
    })
    return {"success":true,"data":channelsArray,guildId:guildId}
    }
}