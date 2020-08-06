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
Paramètres | Types | Description
------------ | ------------- | -------------
botId | String | L'identifiant du bot sélectionné
extensionId | String | L'identifiant de l'extension

**Chemin de récupération:** getConfigData
**Données retournées:** Donnée de configuration
