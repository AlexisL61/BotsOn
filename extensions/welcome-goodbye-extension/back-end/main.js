var client,dataFolder
const fs = require("fs")
module.exports = {
    start(){
        client = this.client
        dataFolder = this.dataFolder
        var configData = JSON.parse(fs.readFileSync(dataFolder+"/webpage-data/config.json","utf-8"))
        client.on("guildMemberAdd",function(member){
            if (configData[member.guild.id] && configData[member.guild.id].welcome.channel != "default"){
                if (member.guild.channels.cache.has(configData[member.guild.id].welcome.channel)){
                    var thisChannel = member.guild.channels.cache.get(configData[member.guild.id].welcome.channel)
                    var messageToSend = configData[member.guild.id].welcome.message
                    messageToSend=messageToSend.replace("{member}","<@"+member.id+">")
                    thisChannel.send(messageToSend)
                }
            }
        })
        client.on("guildMemberRemove",function(member){
            if (configData[member.guild.id] && configData[member.guild.id].goodbye.channel != "default"){
                if (member.guild.channels.cache.has(configData[member.guild.id].goodbye.channel)){
                    var thisChannel = member.guild.channels.cache.get(configData[member.guild.id].goodbye.channel)
                    var messageToSend = configData[member.guild.id].goodbye.message
                    messageToSend=messageToSend.replace("{member}","<@"+member.id+">")
                    thisChannel.send(messageToSend)
                }
            }
        })
    }
}