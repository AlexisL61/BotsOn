module.exports = {
    verify(token,discord){
        const client = new discord.Client()
            client.login(token)
            .then()
            .catch(function(error){
                console.log(error)
                console.log(1)
                client.emit("botLogin",{"success":false})
            })
        client.once("ready",function(){
            console.log(client.user)
            var botImg = client.user.displayAvatarURL()
            var botName = client.user.username
            var botId = client.user.id
            client.emit("botLogin",{"success":true,"bot":{"name":botName,"avatar":botImg,"id":botId}})
            client.destroy()
        })
        client.once("error",function(){
            console.log(2)
            client.emit("botLogin",{"success":false})
        })
        return new Promise((resolve, reject) => {
            client.once("botLogin",function(data){
                console.log("login")
                resolve(data)
            })
        })
    }
}