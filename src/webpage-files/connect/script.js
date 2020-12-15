
var languageFile
function getTranslation(tr){
	return languageFile.find(l=>l.dest == "{"+tr+"}").translation
}

function connectToDiscord(){
    ipcRenderer.send("connect-discord")
    document.getElementById("connect-btn").innerHTML = getTranslation("currentlyConnectingToDiscord")
    document.getElementById("connect-btn").classList.add("btn-blinking")
}

languageFile = ipcRenderer.sendSync("getLanguageFile","fr_FR")
	while (document.body.innerHTML.includes("{")){
		for (var i in languageFile){
			document.body.innerHTML = document.body.innerHTML.replace(languageFile[i].dest,languageFile[i].translation)
		}
	  }

/*for (var i=0;i<5;i++){
    document.getElementById("triangular1").innerHTML += `<div class="triangle" style="margin-left:`+(Math.random()*1000-50)+`px;margin-top:`+Math.random()*1000+`px;
    transform:rotate(`+Math.random()*360+`deg) scale(`+Math.random()+`); opacity:`+(Math.random()*0.5+0.5)+`"></div>`
    document.getElementById("triangular2").innerHTML += `<div class="triangle" style="margin-left:`+(Math.random()*1000-50)+`px;margin-top:`+Math.random()*1000+`px;
    transform:rotate(`+Math.random()*360+`deg) scale(`+Math.random()+`); opacity:`+(Math.random()*0.5+0.5)+`"></div>`
    document.getElementById("triangular3").innerHTML += `<div class="triangle" style="margin-left:`+(Math.random()*1000-50)+`px;margin-top:`+Math.random()*1000+`px;
    transform:rotate(`+Math.random()*360+`deg) scale(`+Math.random()+`); opacity:`+(Math.random()*0.5+0.5)+`"></div>`
}


document.getElementById("connect-section").addEventListener("mousemove",function(e){
    var x = e.pageX
    var y = e.pageY
    document.getElementById("triangular1").style.marginLeft = x/7.5-50+"px"
    document.getElementById("triangular1").style.marginTop = y/7.5-50+"px"
    document.getElementById("triangular2").style.marginLeft =  x/20-25+"px"
    document.getElementById("triangular2").style.marginTop =  y/20-25+"px"
    document.getElementById("triangular3").style.marginLeft = x/35-10+"px"
    document.getElementById("triangular3").style.marginTop = y/35-10+"px"
})*/