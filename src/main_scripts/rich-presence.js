var RPCclient
module.exports={
    init(Rc){
        RPCclient = Rc
    },
    changeRPC(data){
        RPCclient.setActivity({
            state: data.state,
            details: data.details,
            startTimestamp: Date.now(),
            largeImageKey: 'logo',
            instance: true,
        })
    }
}