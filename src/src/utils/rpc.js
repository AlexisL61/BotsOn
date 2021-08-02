const RPC = require('discord-rpc');
const RPCclient = new RPC.Client({transport: 'ipc'});

module.exports={
    changeRPC(data){
        RPCclient.setActivity({
            state: data.state,
            details: data.details,
            startTimestamp: Date.now(),
            largeImageKey: 'logo',
            instance: true,
            buttons: [{label: "WebSite", url: "https://botsonapp.me"}],
        });
    }
}