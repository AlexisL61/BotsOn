var currentOpenWebPage,ipc
var CanvasLibrary
class Canvas{
    constructor(width,height){
        this.id = "canvas-"+Date.now()
        console.log("test"+currentOpenWebPage)
        if (!CanvasLibrary){
            currentOpenWebPage.executeJavaScript(`document.getElementById("canvas-section").innerHTML+="<canvas id='`+this.id+`' width='`+width+`' height='`+height+`'></canvas>"`)
        }else{
            this.object = new CanvasLibrary.Canvas(width,height)
        }
    }
    executeOnCanvas(toExecute){
        if (!this.object){
            currentOpenWebPage.executeJavaScript(`document.getElementById("`+this.id+`").`+toExecute)
        }else{
            eval("this.object."+toExecute)
        }
    }
    executeOnContext(toExecute){
        if (!this.object){
            currentOpenWebPage.executeJavaScript(`document.getElementById("`+this.id+`").getContext("2d").`+toExecute)
        }else{
            eval("this.object.getContext('2d')."+toExecute)
        }
    }
    executeOnPage(toExecute){
        if (!this.object){
            currentOpenWebPage.executeJavaScript(toExecute)
        }
    }
    async toBuffer(){
        var thisObjectId = this.id
        if (!this.object){
            currentOpenWebPage.executeJavaScript(`requestBuffer("`+this.id+`")`)
            return new Promise(function(resolve, reject) {
                ipc.once(thisObjectId+"-buffer-request",function(sender,intArray){
                    console.log(intArray)
                    resolve(Buffer.from(intArray.send))
                })
            })
        }else{
            return this.object.toBuffer()
        }
    }
    async addImage(url,x,y,width,height){
        if (!this.object){
            var thisObjectId = this.id
            currentOpenWebPage.executeJavaScript(`addImage("`+thisObjectId+`","`+url+`",`+x+`,`+y+`,`+width+`,`+height+`)`)
            return new Promise(function(resolve, reject) {
                ipc.once(thisObjectId+"-addimage-request",function(sender,args){
                    resolve()
                })
            })
        }else{
            var img = await CanvasLibrary.loadImage(url)
            var ctx = this.object.getContext('2d');
            ctx.drawImage(img, x, y, width, height);
        }
    }
    addFont(name,url){
        if (!this.object){
            var thisObjectId = this.id
            currentOpenWebPage.executeJavaScript(`addFont("`+this.id+`","`+name+`","`+url+`")`)
            return new Promise(function(resolve, reject) {
                ipc.once(thisObjectId+"-addfont-request",function(sender,args){
                    resolve()
                })
            })
        }else{
            var font = new CanvasLibrary.Font(name,url)
            var ctx = this.object.getContext('2d');
            ctx.addFont(font)
        }
    }
}
module.exports={
    init: function(electron,webP,ipcR){
        if (electron){
            currentOpenWebPage = webP
            ipc = ipcR;
        }else{
            CanvasLibrary = require("canvas")
        }
    },
    Canvas:Canvas
}