var languageFile
function getTranslation(tr) {
    return languageFile.find(l => l.dest == "{" + tr + "}").translation
}

function connectToDiscord() {
    ipcRenderer.send("connect-discord")
    document.getElementById("connect-btn").innerHTML = getTranslation("currentlyConnectingToDiscord")
    document.getElementById("connect-btn").classList.add("btn-blinking")
}


var allLanguages = ipcRenderer.sendSync("getAllLanguagesFile")
languageFile = ipcRenderer.sendSync("getLanguageFile", "fr_FR")
while (document.body.innerHTML.includes("{")) {
    for (var i in allLanguages) {
        document.body.innerHTML = document.body.innerHTML.replace(allLanguages[i], languageFile[allLanguages[i]])
    }
}

var loadingSmallBarre = `<div class="loadingSmallBarre" id="{id}" style="{style}"></div>`
var loadingBigBarre = `<div class="loadingBigBarre" id="{id}" style="{style}"></div>`
var loadingMovingBarre = `<div class="loadingMovingBarre" id="{id}" style="{style}"></div>`
var animateActive = false

async function startLoadingScreen(color) {
  var loadingScreen = document.getElementById("loadingScreen")
    loadingScreen.style.display = "block"
    await delay(10)
    loadingScreen.style.opacity = 1
    animateActive = true
    var tableLoading = {}

    for (var index = 0; index < 3; index++) {
        var i = index
        loadingScreen.innerHTML += loadingSmallBarre.replace("{id}", "loadingSmallBarre" + i).replace("{style}", "margin-left:" + (
            (Math.random() * 5) + (parseInt(i) * 25 + 18 - 3.5)
        ) + "vw;height:0vw;transition:height 1s,opacity 2s;opacity:0;background-color:"+color)
        var elementMarginLeft = parseInt(document.getElementById("loadingSmallBarre" + i).style.marginLeft.replace("vw", ""))
        tableLoading[i] = {}
        tableLoading[i]["elementMargin"] = elementMarginLeft
        tableLoading[i]["item1Margin"] = (-(Math.random() * 4) + (elementMarginLeft) - 2)
        tableLoading[i]["item2Margin"] = ((Math.random() * 4) + (elementMarginLeft) + 2)
        tableLoading[i]["item1Rapidity"] = Math.random() * 1 + 2
        tableLoading[i]["item1TimeEveryNewObject"] = tableLoading[i]["item1Rapidity"] + Math.random() * 2
        tableLoading[i]["item2Rapidity"] = Math.random() * 1 + 2
        tableLoading[i]["item2TimeEveryNewObject"] = tableLoading[i]["item2Rapidity"] + Math.random() * 2
        loadingScreen.innerHTML += `<div id="movingBarreDiv` + i + `1"></div>`

        loadingScreen.innerHTML += `<div id="movingBarreDiv` + i + `2"></div>`
        animate(tableLoading[i], "1", "movingBarreDiv" + i + "1",color)
        animate(tableLoading[i], "2", "movingBarreDiv" + i + "2",color)
    }
    for (var i = 0; i < 15; i++) {
        loadingScreen.innerHTML += loadingBigBarre.replace("{id}", "loadingBigBarre" + i).replace("{style}", "margin-left:" + (
            (Math.random() * 120) - 20
        ) + "vw;height:0vw;transition:height 1s,opacity 2s;opacity:0")
    }
    await delay(10)
    for (var i = 0; i < 3; i++) {
        document.getElementById("loadingSmallBarre" + i).style.height = "1vw"
        document.getElementById("loadingSmallBarre" + i).style.opacity = 1
        await delay(10)
    }
    for (var i = 0; i < 15; i++) {
        document.getElementById("loadingBigBarre" + i).style.height = ((Math.random() * 4) + 0.5) + "vw"
        document.getElementById("loadingBigBarre" + i).style.opacity = 1
        await delay(10)
    }
    async function animate(table, itemNumber, id,color) {
        if (animateActive == true) {
            var ratio = window.innerWidth / window.innerHeight
            console.log(document.body.clientWidth)
            var timeNumber = Math.random() * 100000
            document.getElementById(id).innerHTML += loadingMovingBarre.replace("{id}", "loadingMovingBarre" + timeNumber).replace("{style}", "margin-left:" + table["item" + itemNumber + "Margin"] + "vw;transition: ease-out " + table["item" + itemNumber + "Rapidity"] + "s; background-color:"+color)
            await delay(100)
            document.getElementById("loadingMovingBarre" + timeNumber).style.marginTop = "-50vh"
            console.log(document.getElementById("loadingMovingBarre" + timeNumber).style.marginLeft, table["item" + itemNumber + "Margin"] + (150 / ratio * 13 / 45))
            document.getElementById("loadingMovingBarre" + timeNumber).style.marginLeft = (table["item" + itemNumber + "Margin"] + (150 / ratio * 13 / 45)) + "vw"
            await delay(table["item" + itemNumber + "TimeEveryNewObject"] * 1000)
            animate(table,itemNumber,id,color)
            document.getElementById("loadingMovingBarre" + timeNumber).parentNode.removeChild(document.getElementById("loadingMovingBarre" + timeNumber))
        }
    }
}
async function stopLoadingScreen() {
    animateActive = false
    for (var i = 0; i < 3; i++) {
        document.getElementById("loadingSmallBarre" + i).style.transition = "0.4s"
        document.getElementById("loadingSmallBarre" + i).style.height = "3vw"
        document.getElementById("loadingSmallBarre" + i).style.opacity = 0
        await delay(10)
    }
    for (var i = 0; i < 15; i++) {
        document.getElementById("loadingBigBarre" + i).style.transition = "0.4s"
        document.getElementById("loadingBigBarre" + i).style.height = (parseInt(document.getElementById("loadingBigBarre" + i).style.height.replace("vw", "")) * 2) + "vw"
        document.getElementById("loadingBigBarre" + i).style.opacity = 0
        await delay(10)
    }
    var elements = document.getElementsByClassName("loadingMovingBarre")
    console.log(elements.length)
    console.log(elements)
    for (var i = 0; i < elements.length; i++) {
        elements.item(i).style.transition = "0.4s"
        elements.item(i).style.height = "1vw"
        elements.item(i).style.opacity = 0
    }
    await delay(400)
    loadingScreen.style.opacity = 0
    await delay(500)
    loadingScreen.style.display = "none"
    loadingScreen.innerHTML = ""
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

ipcRenderer.on("discord-rpc-loading-error",function(event,args){
    document.getElementById("connect-btn").innerHTML = "Se connecter à Discord"
    document.getElementById("connect-btn").classList.remove("btn-blinking")
})

ipcRenderer.on("loading", function (event, data) {
    if (data.type == "start") {
        startLoadingScreen(data.color)
    } else {
        stopLoadingScreen()
    }
})
ipcRenderer.on("append", async function (event, data) {
  await delay(1000)
    var childs = document.body.childNodes;
    var body = document.body
    console.log(childs.length)
    while (body.firstChild) {
      if (body.lastChild.id=="loadingScreen") break
      body.removeChild(body.lastChild);
    }
    stopLoadingScreen()
    await delay(500)
    var seEl = document.createElement("section")
    seEl.innerHTML = data.file
    document.body.appendChild(seEl)
    var scEl = document.createElement("SCRIPT")
    scEl.src = "../main-script.js"
    document.body.appendChild(scEl)
})
