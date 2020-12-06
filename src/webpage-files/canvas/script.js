function requestBuffer(id){
    var canvas = new canvasToBuffer(document.getElementById(id))
    ipcRenderer.send(id+"-buffer-request",{"send":canvas.toBuffer()})
}

function addImage(id,url,x,y,width,height){
    base_image = new Image();
    base_image.src = url;
    base_image.onload = function(){
        document.getElementById(id).getContext("2d").drawImage(base_image, x, y, width, height);
        ipcRenderer.send(id+"-addimage-request",{})
    }
}

async function addFont(id,Name,FontFileName){
    var font = new FontFace(Name, "url("+FontFileName+")");
    await font.load()
    document.fonts.add(font);
    ipcRenderer.send(id+"-addfont-request",{})
   
}

function test(id){
    var canvas = new canvasToBuffer(document.getElementById(id))
    console.log(canvas.toBuffer())
    ipcRenderer.send("canvas-bug",{"send":canvas.toBuffer()})
}