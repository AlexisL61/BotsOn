# Front-end

Le dossier front-end permet de changer la configuration de l'extension.
Ce dossier doit contenir, obligatoirement un fichier *index.html*

Lorsque l'utilisateur clique sur l'icone "modifier" (le crayon) en bas de l'extension (voir image ci-dessous), l'application va charger la page index.html

![Modification](https://cdn.discordapp.com/attachments/664475681849212940/741021796362616862/unknown.png)

## A quoi sert la page index.html

La page *index.html* permet de configurer l'extension. 
Chaque extension peut sauvegarder sa propre configuration au format json. Cette configuration est ensuite récupérable par l'extension par la suite

Il est bien entendu possible d'ajouter d'autres fichiers dans le dossier comme des fichiers javascript (.js) et css qui peuvent être appelés par la page

## Communication avec electron

### IpcRenderer

L'objet IpcRenderer est l'objet principal permettant de communiquer avec electron.

Pour utiliser cette objet, vous devez récupérer l'identifiant du bot sélectionné et l'objet IpcRenderer

```javascript
//Récupération de l'identifiant du bot
var botId = parent.currentBotOpenId
//Récupération de l'objet IpcRenderer
var ipcRenderer = parent.ipcRenderer
```

Pour utiliser cet objet, vous devez envoyer une requète à électron de cette manière:
```javascript
ipcRenderer.send("Chemin d'envoi", Données)
```
Electron va ensuite vous envoyer une réponse récupérable comme ceci
```javascript
ipcRenderer.on("Chemin de récupération",function(données){

})
```

Tous les chemins d'envoi disponibles sont marqués dans la catégorie Api ainsi que leur chemin de récupération respectif

### Api

#### ipcRenderer.send("getConfigData",data)
Cette requête permet de récupérer d'anciennes données de configuration de votre extension

__**Paramètres d'envoi**__
Paramètres | Types | Description
------------ | ------------- | -------------
botId | String | L'identifiant du bot sélectionné
extensionId | String | L'identifiant de l'extension

__**Données récupérées**__
> Electron renvoi un dictionnaire contenant la variable success (qui permet de voir si la requête a abouti) de type booléen et la variable data où se trouve les données 

> Aucun tableau car le type de donnée n'est pas le même en fonction des données sauvegardées 

__**Exemple**__
```javascript
ipcRenderer.send("getConfigData", {"botId":"567828934689","extensionId":"welcome-goodbye-extension"})
ipcRenderer.on("getConfigData", function (status) {
   if (status.success==true){
      var data = status.data
   }
}
```

#### ipcRenderer.send("saveConfigData",data)
Cette requête permet de sauvegarder une configuration d'extension au format json

__**Paramètres d'envoi**__
Paramètres | Types | Description
------------ | ------------- | -------------
botId | String | L'identifiant du bot sélectionné
extensionId | String | L'identifiant de l'extension
config | Array ou dictionnary | Les données de la configuration à sauvegarder

__**Données récupérées**__
> Electron renvoi un dictionnaire contenant la variable success (qui permet de voir si la requête a abouti) de type booléen  


__**Exemple**__
```javascript
ipcRenderer.send("saveConfigData", {"botId":"567828934689","extensionId":"welcome-goodbye-extension","config":{"status":"Connecté avec BotsOn!"}})
ipcRenderer.on("saveConfigData", function (status) {
   if (status.success==true){
      //Données sauvegardées avec succès 
   }
}
```

#### ipcRenderer.send("getGuilds",data)
Cette requête permet de récupérer les serveurs du bot correspondant.

__**Paramètres d'envoi**__
Paramètres | Types | Description
------------ | ------------- | -------------
botId | String | L'identifiant du bot sélectionné

__**Données récupérées**__
> Electron renvoi un dictionnaire contenant la variable success (qui permet de voir si la requête a abouti) de type booléen et la variable data où se trouve les données 

> La variable data est un tableau contenant des serveurs discord ayant comme propriété: 

Paramètres | Types | Description
------------ | ------------- | -------------
id | String | L'identifiant du serveur
name | String | Le nom du serveur

__**Exemple**__
```javascript
ipcRenderer.send("getGuilds", {"botId":"567828934689"})
ipcRenderer.on("getGuilds", function (status) {
   if (status.success==true){
      var servers = status.data 
   }
}
```

#### ipcRenderer.send("getGuildChannels",data)
Cette requête permet de récupérer les salons existants correspondant à un id de serveur donné 

__**Paramètres d'envoi**__
Paramètres | Types | Description
------------ | ------------- | -------------
botId | String | L'identifiant du bot sélectionné
guildId | String | L'identifiant du serveur sélectionné 

__**Données récupérées**__
> Electron renvoi un dictionnaire contenant la variable success (qui permet de voir si la requête a abouti) de type booléen et la variable data où se trouve les données 

> La variable data est un tableau contenant des salons discord ayant comme propriété: 

Paramètres | Types | Description
------------ | ------------- | -------------
id | String | L'identifiant du serveur
name | String | Le nom du serveur
parent | Objet | La catégorie du salon si existante
type | String | Le type de ce salon

__**Exemple**__
```javascript
ipcRenderer.send("getGuildChannels", {"botId":"567828934689","guildId":"627495928949"})
ipcRenderer.on("getGuildChannels", function (status) {
   if (status.success==true){
      var channels = status.data 
   }
}
```
