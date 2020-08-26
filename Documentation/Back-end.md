# Back-end

Le dossier back-end permet, une fois un bot en cours d'hébergement, de modifier le comportement de ce bot.

Pour modifier le comportement du bot, l'application utilise la librairie discord.js. La documentation de cette librairie est disponible ici: https://discord.js.org/

## Fichier main.js

Le fichier main.js est un fichier requis pour votre extension, c'est dans ce fichier que se trouve le code permettant de modifier le comportement du bot.

Votre fichier main.js doit obligatoirement contenir ceci:
```js

module.exports = {
  start(){
  
  }
}
```

La fonction start() sera appelée lorsque le bouton hébergement sera appuyée et lorsque l'authentification du bot sera un succès.

### Objet récupérable

Il est possible de récupérer certains objets provenant du programme principal de l'app à l'aide de l'élément this du module:
Nom | Description
------------ | -------------
client | Objet client de discord.js, déjà authentifié
electron | Objet de base provenant de la librairie electron.js
dataFolder | Chemin menant vers le dossier contenant les données de configuration et données de sauvegarde

> Exemple: this.client pour récupérer le client du bot

### Modules

Il est possible d'ajouter des modules pour votre extension. 
Pour en ajouter, créez un fichier package.json avec la commande npm init dans l'invite de commandes et ajoutez vos modules avec, par exemple, npm grâce à la commande npm i <nom module>

⚠️ Certains modules ne sont pas compatibles avec electron et ne peuvent donc pas être utilisés pour le moment:
* node-canvas
* isolated-vm 

##### Exception

Lors du démarrage de l'hébergement, l'application peut envoyer une erreur par rapport à la version d'electron et de vos modules qui ne sont pas les mêmes
Pour corriger ce problème, vous devez installer le module electron-rebuild et le module electron.
Le module electron téléchargé doit avoir la même version que la version d'electron de l'application: 9.0.5

Ensuite, suivez la documentation du module electron-rebuild pour modifier les modules et les rendre compatible avec electron.
