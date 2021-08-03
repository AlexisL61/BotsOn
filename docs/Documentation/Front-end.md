# Front-end

Le dossier front-end permet de changer la configuration de l'extension. Ce
dossier doit contenir, obligatoirement un fichier _index.html_

Lorsque l'utilisateur clique sur l'icone "modifier" (le crayon) en bas de
l'extension (voir image ci-dessous), l'application va charger la page index.html

![Modification](https://cdn.discordapp.com/attachments/664475681849212940/741021796362616862/unknown.png)

## A quoi sert la page index.html

La page _index.html_ permet de configurer l'extension. Chaque extension peut
sauvegarder sa propre configuration au format json. Cette configuration est
ensuite récupérable par l'extension par la suite

Il est bien entendu possible d'ajouter d'autres fichiers dans le dossier comme
des fichiers javascript (.js) et css qui peuvent être appelés par la page

## Communication avec electron

### IpcRenderer

L'objet IpcRenderer est l'objet principal permettant de communiquer avec
electron.

Pour utiliser cette objet, vous devez récupérer l'identifiant du bot sélectionné
et l'objet IpcRenderer

```javascript
//Récupération de l'identifiant du bot
var botId = parent.currentBotOpenId;
//Récupération de l'objet IpcRenderer
var ipcRenderer = parent.ipcRenderer;
```

Pour utiliser cet objet, vous devez envoyer une requète à électron de cette
manière:

```javascript
ipcRenderer.send("Chemin d'envoi", Données);
```

Electron va ensuite vous envoyer une réponse récupérable comme ceci

```javascript
ipcRenderer.on("Chemin de récupération", function (données) {});
```

Tous les chemins d'envoi disponibles sont marqués dans la catégorie Api ainsi
que leur chemin de récupération respectif

### Api

#### ipcRenderer.send("getConfigData",data)

Cette requête permet de récupérer d'anciennes données de configuration de votre
extension

****Paramètres d'envoi**** Paramètres | Types | Description ------------ |
------------- | ------------- botId | String | L'identifiant du bot sélectionné
extensionId | String | L'identifiant de l'extension

****Données récupérées****

> Electron renvoie un dictionnaire contenant la variable success (qui permet de
> voir si la requête a abouti) de type booléen et la variable data où se trouve
> les données

> Aucun tableau car le type de donnée n'est pas le même en fonction des données
> sauvegardées

****Exemple****

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

****Paramètres d'envoi**** Paramètres | Types | Description ------------ |
------------- | ------------- botId | String | L'identifiant du bot sélectionné
extensionId | String | L'identifiant de l'extension config | Array ou
dictionnary | Les données de la configuration à sauvegarder

****Données récupérées****

> Electron renvoie un dictionnaire contenant la variable success (qui permet de
> voir si la requête a abouti) de type booléen

****Exemple****

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

****Paramètres d'envoi**** Paramètres | Types | Description ------------ |
------------- | ------------- botId | String | L'identifiant du bot sélectionné

****Données récupérées****

> Electron renvoie un dictionnaire contenant la variable success (qui permet de
> voir si la requête a abouti) de type booléen et la variable data où se trouve
> les données

> La variable data est un tableau contenant des serveurs discord ayant comme
> propriété:

| Paramètres | Types  | Description                     |
| ---------- | ------ | ------------------------------- |
| id         | String | L'identifiant du serveur        |
| name       | String | Le nom du serveur               |
| icon       | String | L'icône du serveur              |
| ownerID    | String | L'id du propriétaire du serveur |

****Exemple****

```javascript
ipcRenderer.send("getGuilds", {"botId":"567828934689"})
ipcRenderer.on("getGuilds", function (status) {
   if (status.success==true){
      var servers = status.data
   }
}
```

#### ipcRenderer.send("getGuildChannels",data)

Cette requête permet de récupérer les salons existants correspondant à un id de
serveur donné

****Paramètres d'envoi**** Paramètres | Types | Description ------------ |
------------- | ------------- botId | String | L'identifiant du bot sélectionné
guildId | String | L'identifiant du serveur sélectionné

****Données récupérées****

> Electron renvoie un dictionnaire contenant la variable success (qui permet de
> voir si la requête a abouti) de type booléen et la variable data où se trouve
> les données

> La variable data est un tableau contenant des salons discord ayant comme
> propriété:

| Paramètres | Types  | Description                        |
| ---------- | ------ | ---------------------------------- |
| id         | String | L'identifiant du serveur           |
| name       | String | Le nom du serveur                  |
| parent     | Objet  | La catégorie du salon si existante |
| type       | String | Le type de ce salon                |

****Exemple****

```javascript
ipcRenderer.send("getGuildChannels", {"botId":"567828934689","guildId":"627495928949"})
ipcRenderer.on("getGuildChannels", function (status) {
   if (status.success==true){
      var channels = status.data
   }
}
```

#### ipcRenderer.send("getGuildRoles",data)

Cette requête permet de récupérer les salons existants correspondant à un id de
serveur donné

****Paramètres d'envoi**** Paramètres | Types | Description ------------ |
------------- | ------------- botId | String | L'identifiant du bot sélectionné
guildId | String | L'identifiant du serveur sélectionné

****Données récupérées****

> Electron renvoie un dictionnaire contenant la variable success (qui permet de
> voir si la requête a abouti) de type booléen et la variable data où se trouve
> les données

> La variable data est un tableau contenant des salons discord ayant comme
> propriété:

| Paramètres  | Types   | Description                                      |
| ----------- | ------- | ------------------------------------------------ |
| id          | String  | L'identifiant du rôle                            |
| name        | String  | Le nom du rôle                                   |
| permissions | Object  | Les permissions de ce rôle                       |
| position    | Number  | La position du rôle dans la hiérarchie des rôles |
| color       | Number  | Couleur du rôle                                  |
| mentionable | Boolean | Si le rôle est mentionnable ou non               |

****Exemple****

```javascript
ipcRenderer.send("getGuildRoles", {"botId":"567828934689","guildId":"627495928949"})
ipcRenderer.on("getGuildRoles", function (status) {
   if (status.success==true){
      var roles = status.data
   }
}
```

#### ipcRenderer.send("getGuildEmojis",data)

Cette requête permet de récupérer les salons existants correspondant à un id de
serveur donné

****Paramètres d'envoi**** Paramètres | Types | Description ------------ |
------------- | ------------- botId | String | L'identifiant du bot sélectionné
guildId | String | L'identifiant du serveur sélectionné

****Données récupérées****

> Electron renvoie un dictionnaire contenant la variable success (qui permet de
> voir si la requête a abouti) de type booléen et la variable data où se trouve
> les données

> La variable data est un tableau contenant des salons discord ayant comme
> propriété:

| Paramètres | Types   | Description                      |
| ---------- | ------- | -------------------------------- |
| id         | String  | L'identifiant de l'émoji         |
| name       | String  | Le nom de lémoji                 |
| available  | Boolean | Si l'émoji est disponible ou non |
| url        | String  | L'URL de l'émoji                 |
| animated   | Boolean | Si l'émoji est annimé ou non     |

****Exemple****

```javascript
ipcRenderer.send("getGuildEmojis", {"botId":"567828934689","guildId":"627495928949"})
ipcRenderer.on("getGuildEmojis", function (status) {
   if (status.success==true){
      var emojis = status.data
   }
}
```

#### ipcRenderer.send("getBotPrefix",data)

Cette requête permet de récupérer le prefix du bot renseigné par l'utilisateur
dans les paramètres du bot

****Paramètres d'envoi**** Paramètres | Types | Description ------------ |
------------- | ------------- botId | String | L'identifiant du bot sélectionné

****Données récupérées****

> Electron renvoie le prefix sans variable success

****Exemple****

```javascript
ipcRenderer.send("getBotPrefix", {"botId":"567828934689"})
ipcRenderer.on("getBotPrefix", function (prefix) {
   console.log("Le prefix du bot est "+prefix)
}
```

#### ipcRenderer.send("getProductInfo",data)

Cette requête permet de récupérer les informations d'un certain product

****Paramètres d'envoi**** Paramètres | Types | Description ------------ |
------------- | ------------- productId | String | L'identifiant du product

****Données récupérées****

> Electron renvoie un dictionnaire contenant la variable success (qui permet de
> voir si la requête a abouti) de type booléen et la variable data où se trouve
> les données

> La variable data est un dictionnaire contenant les propriétés suivantes:

| Paramètres | Types  | Description                  |
| ---------- | ------ | ---------------------------- |
| id         | String | L'identifiant du product     |
| name       | String | Le nom du product            |
| price      | Number | Le prix du product en pièces |

****Exemple****

```javascript
ipcRenderer.send("getProductInfo", {"productId":"126483950"})
ipcRenderer.once("getProductInfo", function (data) {
   console.log("Le nom du product est "+data.id)
}
```

#### ipcRenderer.send("userOwnProduct",data)

Cette requête permet de savoir si un utilisateur a bien un product

****Paramètres d'envoi**** Paramètres | Types | Description ------------ |
------------- | ------------- productId | String | L'identifiant du product

****Données récupérées****

> Electron renvoie une seule variable, un boolean qui indique si l'utilisateur a
> le product ou non

| Paramètres | Types  | Description                          |
| ---------- | ------ | ------------------------------------ |
| hasProduct | String | Si l'utilisateur a le product ou non |

****Exemple****

```javascript
ipcRenderer.send("userOwnProduct", {"productId":"126483950"})
ipcRenderer.once("userOwnProduct", function (hasProduct) {
   if (hasProduct){
      console.log("L'utilisateur a le product")
   }
}
```

#### ipcRenderer.send("openProduct",data)

Cette requête permet d'ouvrir le navigateur internet de l'utilisateur vers la
page d'un product donné

****Paramètres d'envoi**** Paramètres | Types | Description ------------ |
------------- | ------------- productId | String | L'identifiant du product

****Données récupérées****

> Electron ne renvoie aucune variable

****Exemple****

```javascript
ipcRenderer.send("openProduct", { productId: "126483950" });
//Ouverture de la page du product sur le site de BotsOn
```
