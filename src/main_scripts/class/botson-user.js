const axios = require("axios")

class BotsOnUser {
    constructor(token,userData){
        this.token = token
        this.userData = userData
    }
    async checkMembership(){
        try{
            var data = await axios({"method":"GET",
                "url":"https://botsonapp.me/api/isPremium/"+this.userData.id, 
                headers: {
                    authorization: this.token,
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
                authorization: this.token,
            },
        })
        if (fetchResult.data.success){
          return fetchResult.data.data.coins
        }else{
         return 0
        }
    }
    async getProductOwnLink(extensionId){
        var fetchResult = await axios(
            {"method":"GET",
            "url":"https://botsonapp.me/api/get-products-from-extension/"+extensionId, 
            headers: {
                authorization: this.token,
            },
        })
        if (fetchResult.data.success){
            var products = fetchResult.data.data
            var productToSend = []
            for (var i in products){
                var productFetch = await axios(
                    {"method":"GET",
                    "url":"https://botsonapp.me/api/own-product/"+products[i], 
                    headers: {
                        authorization: this.token,
                    },
                })
                if (productFetch.data.success && productFetch.data.data.hasProduct){
                    productToSend.push({"id":products[i],"download":productFetch.data.data.download})
                }
            }
            return productToSend
        }
        return []
    }
    async ownProduct(id){
        var productFetch = await axios(
            {"method":"GET",
            "url":"https://botsonapp.me/api/own-product/"+id, 
            headers: {
                authorization: this.token,
            },
        })
        if (productFetch.data.success && productFetch.data.data.hasProduct){
            return true
        }else{
            return false
        }
    }
}

module.exports={
    BotsOnUser:BotsOnUser
}