
//document.getElementById("body").style.backdropFilter = "blur(5px)"

var currentBotOpenId
var mainMenuSwitchActivate = false
var currentlyHosting = false
var currentlyInExtensionActiveMode = false
var languageFile
var ipcRenderer

console.log("HEY")
var mainMenuBotButton = `<div onclick="{onClickFunction}" oncontextmenu="{openContextMenuFunction}" id="{botId}" class="bot-menu-btn center">
<div>
<img src="{botImg}" class="avatar">
<p class="text-white">
{botName}
</p>
</div>
</div>`

var extensionActivateBtn = `<div onclick="{modifyConfigFunction}" id="{extensionId}" oncontextmenu="{openContextMenuFunction}" class="extension-bot-menu-btn {inactiveClass}" >
<span></span>
<img src="{extensionImg}" class="">
<div>
<h3>
{extensionName}
</h3>
<p>
{extensionDescription}
</p>
</div>

<img class="edit-extension-img" src="https://img.icons8.com/pastel-glyph/100/000000/edit.png">

<label class="switch">
<input type="checkbox" {switchPosition}>
<span class="slider round"></span>
</label>
</div>`

var addExtensionBtn = `<div onclick="openAddExtensionSection()" class="extension-bot-menu-btn extension-bot-menu-btn-no-color">
<img src="https://img.icons8.com/ios/100/000000/plus.png" class="">
<h3>
Ajouter une extension
</h3>
</div>`

var extensionAvailableBtn = `<div onclick="{onClickFunction}" class="extension-available-menu-btn {inactiveClass}">
<img src="{extensionImg}" class="">
<div>
<h3>
{extensionName}
</h3>
<p>
{extensionDescription}
</p>
<div>
</div>`

var extensionUpdateDiv = `<div class="extension-in-line">
<div class="left-part">
<img src="{extensionImg}">
<p>
{extensionName}
</p>
</div>
<div class="right-part"	style="display:{updateDisplay}">
<a target="_blank" href="{updateLink}"><button class="btn btn-success">
Mettre à jour
</button></a><br/>  
<a target="_blank" href="{informationLink}"><button class="btn btn-dark">
Informations
</button></a>
</div>
<div class="right-part"	style="display:{noUpdateDisplay}">
<a><button class="btn btn-outline-success">
À jour
</button></a>
</div>
<div class="right-part"	style="display:{notFoundDisplay}">
<a><button class="btn btn-outline-success">
Non trouvée
</button></a>
</div>
</div>`

function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

document.getElementById("extension-config-div").style.height = (window.innerHeight - 100) + "px"
window.addEventListener('resize', function(){
	document.getElementById("extension-config-div").style.height = (window.innerHeight - 100) + "px"
});


async function createNewBot() {
	document.getElementById("black-blur-background").style.display = "block"
	document.getElementById("add-bot-section").setAttribute("onclick","")
	document.getElementById("add-bot-section").style.display = "flex"
	await delay(1)
	document.getElementById("add-bot-main-div").style.marginTop = "0vh"
	document.getElementById("add-bot-main-div").style.opacity = "1"
	
	document.getElementById("black-blur-background").style.opacity = "0.4"
}

async function closeCreateNewBot(){
	document.getElementById("black-blur-background").style.opacity = "0"
	
	document.getElementById("add-bot-main-div").style.marginTop = "-40vh"
	document.getElementById("add-bot-main-div").style.opacity = "0"
	await delay(1000)
	document.getElementById("add-bot-section").style.display = "none"
	document.getElementById("black-blur-background").style.display = "none"
}

function updateBotsMenu() {
	var botsData = ipcRenderer.sendSync("getUserBots", "")
	var botList = document.getElementById("my-bots-placement")
	console.log(botList.childNodes.length)
	for (var i in botList.childNodes) {
		if (botList.childNodes[i].classList && !botList.childNodes[i].classList.contains("bot-menu-btn-no-color")) {
			botList.removeChild(botList.childNodes[i])
		}
	}
	for (var i in botsData) {
		var thisBot = botsData[i]
		var thisBotDiv = mainMenuBotButton
		thisBotDiv = thisBotDiv.replace("{onClickFunction}", "openBot('" + thisBot.id + "')")
		thisBotDiv = thisBotDiv.replace("{openContextMenuFunction}", "openBotContextMenu('" + thisBot.id + "')")
		thisBotDiv = thisBotDiv.replace("{botId}", "botWithId"+thisBot.id)
		thisBotDiv = thisBotDiv.replace("{botImg}", thisBot.avatar)
		thisBotDiv = thisBotDiv.replace("{botName}", thisBot.name)
		document.getElementById("my-bots-placement").innerHTML = thisBotDiv + document.getElementById("my-bots-placement").innerHTML
	}
}

async function openExtensionContextMenu(extensionId){
	console.log("test")
	var event = window.event;
	var x =	event.pageX
	var y = event.pageY
	console.log(x,y)
	var contextMenu = document.getElementById("context-menu")
	document.getElementById("extension-context-menu").style.display = "unset"
	document.getElementById("bot-context-menu").style.display = "none"
	contextMenu.style.display = "unset"
	if (x+contextMenu.clientHeight>window.innerWidth){
		x = x-((x+contextMenu.clientWidth)-window.innerWidth)
	}
	if (y+contextMenu.clientHeight>window.innerHeight){
		y = y-((y+contextMenu.clientHeight)-window.innerHeight)
	}
	contextMenu.style.marginLeft = x+"px";
	contextMenu.style.marginTop = y+"px";
	var botExtensions = ipcRenderer.sendSync("getBotExtensions", { id: currentBotOpenId })
	var thisExtension = botExtensions.find(ext => ext.id == extensionId)
	if (thisExtension.status.active){
		document.getElementById("extension-context-menu-activate").innerHTML = "Désactiver"
	}else{
		document.getElementById("extension-context-menu-activate").innerHTML = "Activer"
	}
	document.getElementById("uninstall-bot-extension-btn").setAttribute("onclick","uninstallExtension('"+extensionId+"')")
	document.getElementById("extension-context-menu-delete").setAttribute("onclick","deleteExtensionFromBot('"+extensionId+"')")
	document.getElementById("extension-context-menu-activate").setAttribute("onclick","changeExtensionActivation('"+extensionId+"')")
}

async function openBotContextMenu(bot){
	var event = window.event;
	var x =	event.pageX
	var y = event.pageY
	console.log(x,y)
	var contextMenu = document.getElementById("context-menu")
	document.getElementById("extension-context-menu").style.display = "none"
	document.getElementById("bot-context-menu").style.display = "unset"
	contextMenu.style.display = "unset"
	if (x+contextMenu.clientHeight>window.innerWidth){
		x = x-((x+contextMenu.clientWidth)-window.innerWidth)
	}
	if (y+contextMenu.clientHeight>window.innerHeight){
		y = y-((y+contextMenu.clientHeight)-window.innerHeight)
	}
	contextMenu.style.marginLeft = x+"px";
	contextMenu.style.marginTop = y+"px";
	var botsData = ipcRenderer.sendSync("getUserBots", "")
	var thisBotData = botsData.find(b=>b.id == bot)
	document.getElementById("delete-bot-btn").setAttribute("onclick","deleteBot('"+thisBotData.id+"')")
}

function uninstallExtension(extensionId){
	document.getElementById("extensionWithId"+extensionId).style.display="none"
	ipcRenderer.send("uninstallExtension",{"extensionId":extensionId})
	closeUninstallExtensionSection()
}

function deleteBot(bot){
	ipcRenderer.send("deleteBot",{"botId":bot})
	document.getElementById("botWithId"+bot).style.display="none"
	closeDeleteBotSection()
}

function deleteExtensionFromBot(extensionId){
	ipcRenderer.sendSync("deleteExtensionFromBot",{"extensionId":extensionId,"botId":currentBotOpenId})
	openBot(currentBotOpenId)
}

document.addEventListener("click",function(event){
	var contextMenu = document.getElementById("context-menu")
	contextMenu.style.display = "none"
})

async function openBot(id) {
	console.log("openBot")
	var botExtensions = ipcRenderer.sendSync("getBotExtensions", { id: id })
	var extensionList = document.getElementById("bot-extensions-list")
	
	extensionList.innerHTML = addExtensionBtn
	
	for (var i in botExtensions) {
		var thisExtensionData = botExtensions[i]
		var thisExtensionDiv = extensionActivateBtn
		thisExtensionDiv = thisExtensionDiv.replace("{openContextMenuFunction}","openExtensionContextMenu('"+thisExtensionData.id+"')")
		thisExtensionDiv = thisExtensionDiv.replace("{extensionId}","extensionWithId"+ thisExtensionData.id)
		thisExtensionDiv = thisExtensionDiv.replace("{extensionImg}", thisExtensionData.image)
		thisExtensionDiv = thisExtensionDiv.replace("{extensionName}", thisExtensionData.name)
		thisExtensionDiv = thisExtensionDiv.replace("{extensionDescription}", thisExtensionData.smallDescription)
		thisExtensionDiv = thisExtensionDiv.replace("{modifyConfigFunction}", "openConfigPage('"+thisExtensionData.id+"')")
		
		if (thisExtensionData.status.active == true){
			thisExtensionDiv = thisExtensionDiv.replace("{switchPosition}","checked")
			thisExtensionDiv = thisExtensionDiv.replace("{inactiveClass}","")
		}else{
			thisExtensionDiv = thisExtensionDiv.replace("{switchPosition}","")
			thisExtensionDiv = thisExtensionDiv.replace("{inactiveClass}","inactive")
		}
		document.getElementById("bot-extensions-list").innerHTML = thisExtensionDiv + document.getElementById("bot-extensions-list").innerHTML
	}
	document.getElementById("bot-select-section").style.display = "block"
	document.getElementById("my-bots-section").style.display = "none"
	
	var botData = ipcRenderer.sendSync("getBotData", { id: id })
	document.getElementById("bot-heberg-menu-img").src = botData.avatar
	document.getElementById("bot-heberg-menu-name").innerHTML = botData.name
	
	currentBotOpenId = id
	mainMenuSwitchActivate = false
	
	document.getElementById("botActiveMenuSection").style.display = "block"
	document.getElementById("menuBotImage").src = botData.avatar
	document.getElementById("menuBotName").innerHTML = botData.name
	
	changeExtensionActiveMode();
	changeExtensionActiveMode();
}

function changeExtensionActiveMode(data){
	currentlyInExtensionActiveMode = !currentlyInExtensionActiveMode
	if (data !==undefined){
		currentlyInExtensionActiveMode = data
	}
	if (currentlyInExtensionActiveMode){
		document.getElementById("indicator-active-mode").classList.add("active")
		var objects = document.getElementsByClassName("extension-bot-menu-btn")
		for (var i in objects){
			if (objects[i].classList && !objects[i].classList.contains("extension-bot-menu-btn-no-color")){
				objects[i].classList.add("tremble")
			}
		}
	}else{
		document.getElementById("indicator-active-mode").classList.remove("active")
		var objects = document.getElementsByClassName("extension-bot-menu-btn")
		for (var i in objects){
			console.log(objects[i])
			if (objects[i].classList && objects[i].classList.contains("tremble")){
				objects[i].classList.remove("tremble")
			}
		}
	}
}

function getTranslation(tr){
	return languageFile["{"+tr+"}"]
}

function openExtensionMenu(){
	document.getElementById("extension-config-div").style.display = "none"
	document.getElementById("bot-extensions-list").style.display = "block"
	document.getElementById("bot-parameters-main-div").style.display = "none"
	document.getElementById("bot-tools-main-div").style.display = "none"
	closeEveryBotParametersSubMenu()
	closeEveryBotToolsSubMenu()
	closeMenu()
}

function openBotMenu(){
	openExtensionMenu()
	document.getElementById("botActiveMenuSection").style.display = "none"
	document.getElementById("bot-select-section").style.display = "none"
	document.getElementById("my-bots-section").style.display = "block"
}

async function openConfigPage(extensionId){
	if (!currentlyInExtensionActiveMode){
		var dataFolder = ipcRenderer.sendSync("getDataFolder")
		document.getElementById("extension-config-import").src = dataFolder+"/extension-install/"+extensionId+"/front-end/index.html"
		document.getElementById("extension-config-div").style.display = "block"
		document.getElementById("bot-extensions-list").style.display = "none"
	}else{
		changeExtensionActivation(extensionId);
	}
}

async function changeExtensionActivation(extensionId){
	if (mainMenuSwitchActivate == false){
		mainMenuSwitchActivate = true
		var activationChange = ipcRenderer.sendSync("modifyExtensionActivation", { extensionId: extensionId , botId: currentBotOpenId})
		openBot(currentBotOpenId)
	}
}

async function openUpdateExtensionSection() {
	document.getElementById("black-blur-background").style.display = "block"
	document.getElementById("update-extension-section").style.display = "flex"
	await delay(1)
	document.getElementById("update-extension-main-div").style.marginTop = "0px"
	document.getElementById("update-extension-main-div").style.opacity = "1"
	document.getElementById("black-blur-background").style.opacity = "0.4"
	ipcRenderer.send("checkUpdateExtensions")
	ipcRenderer.on("checkUpdateExtensions",function(event,result){
		console.log("AAAAAAAAAAAAAAAAAAAA")
		var addToDiv = ""
		for (var i in result){
			var thisExtensionUpdateDiv = extensionUpdateDiv
			console.log(result[i].status)
			if (result[i].status == "notFound"){
				thisExtensionUpdateDiv = thisExtensionUpdateDiv.replace("{notFoundDisplay}","unset")
				thisExtensionUpdateDiv = thisExtensionUpdateDiv.replace("{noUpdateDisplay}","none")
				thisExtensionUpdateDiv = thisExtensionUpdateDiv.replace("{updateDisplay}","none")
			}
			if (result[i].status == "updateAvailable"){
				thisExtensionUpdateDiv = thisExtensionUpdateDiv.replace("{updateLink}",result[i].download)
				thisExtensionUpdateDiv = thisExtensionUpdateDiv.replace("{informationLink}",result[i].extension)
				thisExtensionUpdateDiv = thisExtensionUpdateDiv.replace("{notFoundDisplay}","none")
				thisExtensionUpdateDiv = thisExtensionUpdateDiv.replace("{noUpdateDisplay}","none")
				thisExtensionUpdateDiv = thisExtensionUpdateDiv.replace("{updateDisplay}","unset")
			}
			if (result[i].status == "updated"){
				thisExtensionUpdateDiv = thisExtensionUpdateDiv.replace("{notFoundDisplay}","none")
				thisExtensionUpdateDiv = thisExtensionUpdateDiv.replace("{noUpdateDisplay}","unset")
				thisExtensionUpdateDiv = thisExtensionUpdateDiv.replace("{updateDisplay}","none")
			}
			thisExtensionUpdateDiv = thisExtensionUpdateDiv.replace("{extensionName}",result[i].name)
			thisExtensionUpdateDiv = thisExtensionUpdateDiv.replace("{extensionImg}",result[i].image)
			addToDiv+=thisExtensionUpdateDiv
		}
		document.getElementById("extension-update-placement").innerHTML = addToDiv
	})
}

async function openUninstallExtensionSection() {
	document.getElementById("black-blur-background").style.display = "block"
	document.getElementById("uninstall-extension-section").style.display = "flex"
	await delay(1)
	document.getElementById("uninstall-extension-main-div").style.marginTop = "0px"
	document.getElementById("uninstall-extension-main-div").style.opacity = "1"
	document.getElementById("black-blur-background").style.opacity = "0.4"
}

async function openAddExtensionSection() {
	changeExtensionActiveMode(false);
	document.getElementById("black-blur-background").style.display = "block"
	document.getElementById("add-extension-section").style.display = "flex"
	await delay(1)
	document.getElementById("add-extension-main-div").style.marginTop = "0px"
	document.getElementById("add-extension-main-div").style.opacity = "1"
	document.getElementById("black-blur-background").style.opacity = "0.4"
	var availableExtensions = ipcRenderer.sendSync("getAvailableExtensions")
	var alreadyInstallExtensions = ipcRenderer.sendSync("getBotExtensions", { id: currentBotOpenId })
	document.getElementById("extension-available-placement").innerHTML = ""
	for (var i in availableExtensions) {
		var thisExtensionData = availableExtensions[i]
		console.log(thisExtensionData)
		var thisExtensionDiv = extensionAvailableBtn
		if (!alreadyInstallExtensions.find(extension=> extension.id == thisExtensionData.id)){
			thisExtensionDiv = thisExtensionDiv.replace("{onClickFunction}", "openConfirmInstall('" + thisExtensionData.id + "')")
			
			thisExtensionDiv = thisExtensionDiv.replace("{inactiveClass}","")
		}else{
			thisExtensionDiv = thisExtensionDiv.replace("{onClickFunction}", "")
			
			thisExtensionDiv = thisExtensionDiv.replace("{inactiveClass}","inactive")
		}
		thisExtensionDiv = thisExtensionDiv.replace("{extensionImg}", thisExtensionData.image)
		thisExtensionDiv = thisExtensionDiv.replace("{extensionName}", thisExtensionData.name)
		thisExtensionDiv = thisExtensionDiv.replace("{extensionDescription}", thisExtensionData.smallDescription)
		document.getElementById("extension-available-placement").innerHTML += thisExtensionDiv
	}
}

async function closeAddExtensionSection(){
	document.getElementById("black-blur-background").style.opacity = "0"
	document.getElementById("add-extension-main-div").style.marginTop = "80vh"
	document.getElementById("add-extension-main-div").style.opacity = "0"
	await delay(1000)
	document.getElementById("black-blur-background").style.display = "none"
	document.getElementById("add-extension-section").style.display = "none"
}

async function closeUpdateExtensionSection(){
	document.getElementById("black-blur-background").style.opacity = "0"
	document.getElementById("update-extension-main-div").style.marginTop = "80vh"
	document.getElementById("update-extension-main-div").style.opacity = "0"
	await delay(1000)
	document.getElementById("black-blur-background").style.display = "none"
	document.getElementById("update-extension-section").style.display = "none"
}

async function closeUninstallExtensionSection(){
	document.getElementById("black-blur-background").style.opacity = "0"
	document.getElementById("uninstall-extension-main-div").style.marginTop = "80vh"
	document.getElementById("uninstall-extension-main-div").style.opacity = "0"
	await delay(1000)
	document.getElementById("black-blur-background").style.display = "none"
	document.getElementById("uninstall-extension-section").style.display = "none"
}

async function openDeleteBotSection() {
	document.getElementById("black-blur-background").style.display = "block"
	document.getElementById("delete-bot-section").style.display = "flex"
	await delay(1)
	document.getElementById("delete-bot-main-div").style.marginTop = "0px"
	document.getElementById("delete-bot-main-div").style.opacity = "1"
	document.getElementById("black-blur-background").style.opacity = "0.4"
}

async function closeDeleteBotSection(){
	document.getElementById("black-blur-background").style.opacity = "0"
	document.getElementById("delete-bot-main-div").style.marginTop = "80vh"
	document.getElementById("delete-bot-main-div").style.opacity = "0"
	await delay(1000)
	document.getElementById("black-blur-background").style.display = "none"
	document.getElementById("delete-bot-section").style.display = "none"
}

function changeHostingStatus(){
	var hasAttribute = document.getElementById("heberg-bot-btn").hasAttribute("disabled")
	if (currentlyHosting===true && !hasAttribute){
		endHosting()
	}else{
		if (currentlyHosting===false && !hasAttribute){
			startHosting()
		}
	}
	
}

function startHosting(){
	document.getElementById("heberg-bot-btn").setAttribute("disabled",true)
	ipcRenderer.send("startHosting",{"id":currentBotOpenId})
}

function endHosting(){
	document.getElementById("heberg-bot-btn").setAttribute("disabled",true)
	ipcRenderer.send("endHosting",{"id":currentBotOpenId})
}

async function openConfirmInstall(extensionId) {
	var extensionData = ipcRenderer.sendSync("getExtensionData", { "id": extensionId })
	document.getElementById("add-extension-confirmation-description").innerHTML = "Vous allez ajouter l'extension <b>" + extensionData.name + "</b>. Cette extension peut accéder à votre bot lorsque vous l'hébergez. Ajoutez donc seulement des extensions de sources connues."
	document.getElementById("add-extension-confirmation-btn").setAttribute("onclick", "installExtension('" + extensionId + "')")
	
	document.getElementById("add-extension-main-div").style.marginTop = "-250px"
	document.getElementById("add-extension-main-div").style.opacity = "0"
	document.getElementById("add-extension-confirmation-div").style.display = "block"
	await delay(1)
	document.getElementById("add-extension-confirmation-div").style.marginTop = "0px"
	document.getElementById("add-extension-confirmation-div").style.opacity = "1"
}

async function cancelAddExtension() {
	document.getElementById("add-extension-confirmation-div").style.marginTop = "250px"
	document.getElementById("add-extension-confirmation-div").style.opacity = "0"
	document.getElementById("add-extension-main-div").style.marginTop = "0px"
	document.getElementById("add-extension-main-div").style.opacity = "1"
	await delay(800)
	
	document.getElementById("add-extension-confirmation-div").style.display = "none"
}

async function installExtension(id) {
	var installResult = ipcRenderer.sendSync("installExtension", { "extensionId": id, "botId": currentBotOpenId })
	if (installResult.success == true) {
		openBot(currentBotOpenId)
		
		document.getElementById("add-extension-confirmation-div").style.marginTop = "-250px"
		document.getElementById("add-extension-confirmation-div").style.opacity = "0"
		
		document.getElementById("black-blur-background").style.opacity = "0"
		
		await delay(800)
		
		document.getElementById("add-extension-confirmation-div").style.display = "none"
		document.getElementById("add-extension-section").style.display = "none"
		document.getElementById("black-blur-background").style.display = "none"
	}
}

async function start() {
	var languageData = ipcRenderer.sendSync("getCurrentLanguageFile")
	languageFile = languageData.data
	/*while (document.body.innerHTML.includes("{")){
		console.log(document.body.innerHTML.split("{")[1])
		for (var i in languageFile){
			document.body.innerHTML = document.body.innerHTML.replace(languageFile[i].dest,languageFile[i].translation)
		}
	}*/
	await delay(1000)
	var user = ipcRenderer.sendSync("getUser", "")
	ipcRenderer.send("getUserCoins","")
	console.log(user)
	document.getElementById("loading-section-title").innerHTML = getTranslation("welcome")+" "+user.username
	
	document.getElementById("loading-section-title").style.marginTop = "0px"
	document.getElementById("loading-section-title").style.opacity = "1"
	
	await delay(2000)
	
	document.getElementById("my-bots-section").style.display = "block"
	document.getElementById("loading-section").style.opacity = 0
	
	updateBotsMenu()
	
	await delay(1000)
	document.getElementById("loading-section").style.display = "none"
}

function openMenu() {
	document.getElementById("main-menu-div").classList.add("menu-div-open")
	document.getElementById("main-menu-div").classList.remove("menu-div-close")
}

async function verifyBotToken() {
	var token = document.getElementById("add-bot-token-input").value
	document.getElementById("add-bot-token-btn").setAttribute("disabled", "true")
	
	ipcRenderer.once("checkDiscordTokenResult", function (event, tokenVerifierResult) {
		if (tokenVerifierResult.success == false) {
			document.getElementById("add-bot-token-btn").removeAttribute("disabled")
			document.getElementById("add-bot-token-input").value = ""
			document.getElementById("add-bot-token-input").setAttribute("placeholder", getTranslation("incorrectToken"))
			document.getElementById("add-bot-token-input").classList.add("input-error")
		} else {
			document.getElementById("add-bot-main-div").style.marginTop = "-250px"
			document.getElementById("add-bot-main-div").style.opacity = "0"
			document.getElementById("add-bot-second-div").style.marginTop = "0px"
			document.getElementById("add-bot-second-div").style.opacity = "1"
			
			document.getElementById("add-bot-second-div-img").src = tokenVerifierResult.bot.avatar
			document.getElementById("add-bot-second-div-bot-name").innerHTML = tokenVerifierResult.bot.name
			
			updateBotsMenu()
		}
	})
	ipcRenderer.send("checkDiscordToken", { "token": token, "addBot": true })
}

function startBotExport(){
	ipcRenderer.send("exportBot",{"bot":currentBotOpenId})
}

function openBotParametersMenu(){
	openExtensionMenu()
	document.getElementById("bot-extensions-list").style.display="none"
	document.getElementById("bot-parameters-main-div").style.display = "block"
	
}

function openBotToolsMenu(){
	openExtensionMenu()
	document.getElementById("bot-extensions-list").style.display="none"
	document.getElementById("bot-tools-main-div").style.display = "block"
}

function generateInviteLink(){
	var permission = document.getElementById("bot-tools-invite-permission-number-input").value 
	document.getElementById("bot-tools-invite-input").value = "https://discord.com/oauth2/authorize?client_id="+currentBotOpenId+"&scope=bot&permissions="+permission
}

async function openBotToolsSubMenu(tool){
	document.getElementById("bot-tools-main-div").style.display = "none"
	if (tool == "invite"){
		document.getElementById("bot-tools-invite-div").style.display = "block"
		generateInviteLink()
	}
}

async function openBotParametersSubMenu(parameter){
	document.getElementById("bot-parameters-main-div").style.display = "none"
	if (parameter=="security"){
		document.getElementById("bot-parameters-security-div").style.display = "block"
		ipcRenderer.send("getBotPrivateData",{"botId":currentBotOpenId})
		ipcRenderer.once("getBotPrivateData",function(event,botData){
			document.getElementById("bot-token-parameters-input").value = botData.token
		})
	}
	if (parameter=="prefix"){
		document.getElementById("bot-parameters-prefix-div").style.display = "block"
		ipcRenderer.send("getBotPrefix",{"botId":currentBotOpenId})
		ipcRenderer.once("getBotPrefix",function(event,prefix){
			if (prefix){
				document.getElementById("bot-prefix-parameters-input").value = prefix
			}else{
				document.getElementById("bot-prefix-parameters-input").value = ""
			}
		})
	}
	if (parameter=="user"){
		document.getElementById("bot-parameters-user-div").style.display = "block"
		ipcRenderer.send("getBotUser",{"botId":currentBotOpenId})
		ipcRenderer.once("getBotUser",function(event,user){
			if (user){
				document.getElementById("bot-user-parameters-input").value = user
			}else{
				document.getElementById("bot-user-parameters-input").value = ""
			}
		})
	}
	if (parameter=="intents"){
		document.getElementById("bot-parameters-intents-div").style.display = "block"
		ipcRenderer.send("getBotIntents",{"botId":currentBotOpenId})
		ipcRenderer.once("getBotIntents",function(event,intents){
			console.log(intents)
			if (intents.presence){
				document.getElementById("bot-intents-parameters-input-presence").checked = "true"
			}
			if (intents.guild_members){
				document.getElementById("bot-intents-parameters-input-guild-members").checked = "true"
			}
		})
	}
	if (parameter=="generalcommands"){
		document.getElementById("bot-parameters-general-commands-div").style.display = "block"
		ipcRenderer.send("getBotGeneralCommands",{"botId":currentBotOpenId})
		ipcRenderer.once("getBotGeneralCommands",function(event,commands){
			console.log(commands)
			if (commands.help){
				document.getElementById("bot-general-commands-parameters-input-help").checked = "true"
			}
		})
	}
}

function closeEveryBotParametersSubMenu(){
	document.getElementById("bot-parameters-security-div").style.display = "none"
	document.getElementById("bot-parameters-prefix-div").style.display = "none"
	document.getElementById("bot-parameters-user-div").style.display = "none"
	document.getElementById("bot-parameters-intents-div").style.display = "none"
	document.getElementById("bot-parameters-general-commands-div").style.display = "none"
}

function closeEveryBotToolsSubMenu(){
	document.getElementById("bot-tools-invite-div").style.display = "none"
}

function editBotData(){
	ipcRenderer.send("checkDiscordToken", { "token": document.getElementById("bot-token-parameters-input").value, "modifyBot":true,"botId":currentBotOpenId })
	document.getElementById("edit-bot-data-btn").setAttribute("disabled",true)
	ipcRenderer.once("checkDiscordTokenResult",function(event,result){
		document.getElementById("edit-bot-data-btn").removeAttribute("disabled")
		if (result.success == true){
			openBot(result.bot.id)
		}
	})
}

function editBotPrefix(){
	document.getElementById("bot-prefix-parameters-input").style.borderColor = ""
	var prefixChangeResult = ipcRenderer.sendSync("modifyBotPrefix", {"botId":currentBotOpenId, "prefix": document.getElementById("bot-prefix-parameters-input").value})
	if (prefixChangeResult.success == true){
		document.getElementById("bot-prefix-parameters-input").style.borderColor = "green"
	}
}

function editBotUser(){
	document.getElementById("bot-user-parameters-input").style.borderColor = ""
	var userChangeResult = ipcRenderer.sendSync("modifyBotUser", {"botId":currentBotOpenId, "user": document.getElementById("bot-user-parameters-input").value})
	if (userChangeResult.success == true){
		document.getElementById("bot-user-parameters-input").style.borderColor = "green"
	}
}

function editBotIntents(intent){
	console.log(intent)
	ipcRenderer.sendSync("modifyBotIntent",{"botId":currentBotOpenId, "intent":intent})
}

function editBotGeneralCommands(command){
	console.log(command)
	ipcRenderer.sendSync("modifyBotGeneralCommand",{"botId":currentBotOpenId, "command":command})
}

async function closeAddBot() {
	document.getElementById("add-bot-second-div").style.marginTop = "-250px"
	document.getElementById("add-bot-second-div").style.opacity = "0"
	
	document.getElementById("black-blur-background").style.opacity = "0"
	
	await delay(800)
	
	document.getElementById("add-bot-section").style.display = "none"
	document.getElementById("black-blur-background").style.display = "none"
}

function closeMenu() {
	document.getElementById("main-menu-div").classList.add("menu-div-close")
	document.getElementById("main-menu-div").classList.remove("menu-div-open")
}

ipcRenderer.on("startHosting",function(event,data){
	document.getElementById("heberg-bot-btn").removeAttribute("disabled")
	if (data.success == true){
		currentlyHosting = true
		document.getElementById("heberg-bot-btn").innerHTML = "Hébergé"
		document.getElementById("heberg-bot-btn").classList.remove("btn-primary")
		document.getElementById("heberg-bot-btn").classList.add("btn-success")
	}
})

ipcRenderer.on("endHosting",function(event,data){
	document.getElementById("heberg-bot-btn").removeAttribute("disabled")
	if (data.success == true){
		currentlyHosting = false
		document.getElementById("heberg-bot-btn").innerHTML = "Héberger"
		document.getElementById("heberg-bot-btn").classList.remove("btn-success")
		document.getElementById("heberg-bot-btn").classList.add("btn-primary")
	}
})

ipcRenderer.on("getUserCoins",function(event,coins){
	document.getElementById("user-coins-placement-value").innerHTML=coins
})

async function startDownloadFromLink(){
	var link = document.getElementById("download-link-input").value
	if (link.startsWith("botson://")){
	ipcRenderer.send("startDownloadFromLink",link)
}else{
	document.getElementById("download-link-input").value = "Lien invalide"
}
}

start()