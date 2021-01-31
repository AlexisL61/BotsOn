
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

var loadingSmallBarre = `<div class="loadingSmallBarre" id="{id}" style="{style}"></div>`
var loadingBigBarre = `<div class="loadingBigBarre" id="{id}" style="{style}"></div>`
var loadingMovingBarre = `<div class="loadingMovingBarre" id="{id}" style="{style}"></div>`
var animateActive = false

      async function startLoadingScreen(){
        document.getElementById("loadingScreen").style.display="block"
        await delay(10)
        document.getElementById("loadingScreen").style.opacity = 1
        animateActive = true
        var tableLoading = []
        
        for (var index=0;index<3;index++){
          var i = index
          document.getElementById("loadingScreen").innerHTML += loadingSmallBarre.replace("{id}","loadingSmallBarre"+i).replace("{style}","margin-left:"+((Math.random()*5)+(parseInt(i)*25+18-3.5))+"vw;height:0vw;transition:height 1s,opacity 2s;opacity:0")
          var elementMarginLeft = parseInt(document.getElementById("loadingSmallBarre"+i).style.marginLeft.replace("vw",""))
          tableLoading[i] = {}
          tableLoading[i]["elementMargin"] = elementMarginLeft
          tableLoading[i]["item1Margin"] = (-(Math.random()*4)+(elementMarginLeft)-2)
          tableLoading[i]["item2Margin"] = ((Math.random()*4)+(elementMarginLeft)+2)
          tableLoading[i]["item1Rapidity"] = Math.random()*1+2
          tableLoading[i]["item1TimeEveryNewObject"] = tableLoading[i]["item1Rapidity"] + Math.random()*2
          tableLoading[i]["item2Rapidity"] = Math.random()*1+2
          tableLoading[i]["item2TimeEveryNewObject"] = tableLoading[i]["item2Rapidity"] + Math.random()*2
          document.getElementById("loadingScreen").innerHTML += `<div id="movingBarreDiv`+i+`1"></div>`
          
          document.getElementById("loadingScreen").innerHTML += `<div id="movingBarreDiv`+i+`2"></div>`
          animate(tableLoading[i],"1","movingBarreDiv"+i+"1")
          animate(tableLoading[i],"2","movingBarreDiv"+i+"2")
        }
        for (var i=0;i<15;i++){
          document.getElementById("loadingScreen").innerHTML += loadingBigBarre.replace("{id}","loadingBigBarre"+i).replace("{style}","margin-left:"+((Math.random()*120)-20)+"vw;height:0vw;transition:height 1s,opacity 2s;opacity:0")
        }
        await delay(10)
        for (var i=0;i<3;i++){
          document.getElementById("loadingSmallBarre"+i).style.height="1vw"
          document.getElementById("loadingSmallBarre"+i).style.opacity=1
          await delay(10)
        }
        for (var i=0;i<15;i++){
          document.getElementById("loadingBigBarre"+i).style.height=((Math.random()*4)+0.5)+"vw"
          document.getElementById("loadingBigBarre"+i).style.opacity=1
          await delay(10)
        }
        async function animate(table,itemNumber,id){
          if (animateActive == true){
              var ratio = window.innerWidth/window.innerHeight
              console.log(document.body.clientWidth)
              var timeNumber = Math.random()*100000
              document.getElementById(id).innerHTML += loadingMovingBarre.replace("{id}","loadingMovingBarre"+timeNumber).replace("{style}","margin-left:"+table["item"+itemNumber+"Margin"]+"vw;transition: ease-out "+table["item"+itemNumber+"Rapidity"]+"s")
              await delay(100)
              document.getElementById("loadingMovingBarre"+timeNumber).style.marginTop="-50vh"
              console.log(document.getElementById("loadingMovingBarre"+timeNumber).style.marginLeft,table["item"+itemNumber+"Margin"]+(150/ratio*13/45))
              document.getElementById("loadingMovingBarre"+timeNumber).style.marginLeft=(table["item"+itemNumber+"Margin"]+(150/ratio*13/45))+"vw"
              await delay(table["item"+itemNumber+"TimeEveryNewObject"]*1000)
          
              animate(table,itemNumber,id)
              document.getElementById("loadingMovingBarre"+timeNumber).parentNode.removeChild(document.getElementById("loadingMovingBarre"+timeNumber))
          }
        }  
      }
      async function stopLoadingScreen(){
        animateActive = false
        for (var i=0;i<3;i++){
          document.getElementById("loadingSmallBarre"+i).style.transition = "0.4s"
          document.getElementById("loadingSmallBarre"+i).style.height="3vw"
          document.getElementById("loadingSmallBarre"+i).style.opacity=0
          await delay(10)
        }
        for (var i=0;i<15;i++){
          document.getElementById("loadingBigBarre"+i).style.transition = "0.4s"
          document.getElementById("loadingBigBarre"+i).style.height=(parseInt(document.getElementById("loadingBigBarre"+i).style.height.replace("vw",""))*2)+"vw"
          document.getElementById("loadingBigBarre"+i).style.opacity=0
          await delay(10)
        }
        var elements = document.getElementsByClassName("loadingMovingBarre")
        console.log(elements.length)
        console.log(elements)
        for (var i=0;i<elements.length;i++){
          elements.item(i).style.transition = "0.4s"
          elements.item(i).style.height = "1vw"
          elements.item(i).style.opacity = 0
        }
        await delay(400)
        document.getElementById("loadingScreen").style.opacity = 0
        await delay(500)
        document.getElementById("loadingScreen").style.display="none"
        document.getElementById("loadingScreen").innerHTML = ""
      }
      function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }
      //startLoadingScreen()
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