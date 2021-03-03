const axios = require("axios")

class BotsOnUser {
    constructor(token,userData){
        this.token = token
        this.userData = userData
    }
    async checkMembership(){
        try{
            var data = await axios({"method":"GET",
                "url":"https://botsonapp.me/api/isPremium/"+RPCclient.user.id, 
                headers: {
                    authorization: RPCclient.accessToken,
                },
            })
            return data.data
        }catch(e){
            return {"premium":false}
        }
    }
    async getCoins(){
        var fetchResult = await axios(
            {"method":"GET",
            "url":"https://botsonapp.me/api/get-user-coins", 
            headers: {
                authorization: RPCclient.accessToken,
            },
        })
        if (fetchResult.data.success){
          return fetchResult.data.data.coins
        }else{
         return 0
        }
    }
}

module.exports={
    BotsOnUser:BotsOnUser
}