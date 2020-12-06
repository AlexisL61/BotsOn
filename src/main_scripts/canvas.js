var currentOpenWebPage,ipc
class Canvas{
    constructor(width,height){
        this.id = "canvas-"+Date.now()
        console.log("test"+currentOpenWebPage)
        currentOpenWebPage.executeJavaScript(`document.getElementById("canvas-section").innerHTML+="<canvas id='`+this.id+`' width='`+width+`' height='`+height+`'></canvas>"`)
    }
    executeOnCanvas(toExecute){
        currentOpenWebPage.executeJavaScript(`document.getElementById("`+this.id+`").`+toExecute)
    }
    executeOnContext(toExecute){
        currentOpenWebPage.executeJavaScript(`document.getElementById("`+this.id+`").getContext("2d").`+toExecute)
    }
    executeOnPage(toExecute){
        currentOpenWebPage.executeJavaScript(toExecute)
    }
    async toBuffer(){
        var thisObjectId = this.id
        currentOpenWebPage.executeJavaScript(`requestBuffer("`+this.id+`")`)
        return new Promise(function(resolve, reject) {
            ipc.once(thisObjectId+"-buffer-request",function(sender,intArray){
                resolve(Buffer.from(intArray.send))
            })
        })
    }
    async addImage(url,x,y,width,height){
        var thisObjectId = this.id
        currentOpenWebPage.executeJavaScript(`addImage("`+thisObjectId+`","`+url+`",`+x+`,`+y+`,`+width+`,`+height+`)`)
        return new Promise(function(resolve, reject) {
            ipc.once(thisObjectId+"-addimage-request",function(sender,args){
                resolve()
            })
        })
    }
    addFont(name,url){
        var thisObjectId = this.id
        currentOpenWebPage.executeJavaScript(`addFont("`+this.id+`","`+name+`","`+url+`")`)
        return new Promise(function(resolve, reject) {
            ipc.once(thisObjectId+"-addfont-request",function(sender,args){
                resolve()
            })
        })
    }
}
module.exports={
    init: function(webP,ipcR){
        console.log(webP)
        currentOpenWebPage = webP
        ipc = ipcR;
    },
    Canvas:Canvas
}