# Fichiers

Votre extension a besoin de plusieurs fichiers pour fonctionner
```
<id-extension>
 |__📁front-end
     |__📇index.html
 |__📁back-end
     |__📇main.js
 |__📇extension-data.json
 ``` 

D'autres fichiers peuvent aussi être ajoutés mais ils ne sont pas obligatoires pour faire fonctionner votre extension.

## Extension-data.json

Le fichier extension-data.json est le fichier principal de votre extension, il contient toutes les informations de votre extension.
Ce fichier peut accueillir les informations suivantes:
```json
  {   
    "name":"<nom de l'extension>",
    "id":"<id-extension>",
    "author":"<Auteur de l'extension>",
    "image":"<Image de l'extension>",
    "smallDescription":"<Description courte>",
    "description":"<Description de l'extension>",
    "help":{
      "active":"<Si l'extension s'affiche dans le help ou non (true ou false)>",
    	 "field":{
    		 "name":"<Nom du field s'ajoutant dans le help>",
    		 "value":"<Valeur du field s'ajoutant dans le help>"
    	 }
    },
    "require":["canvas"]
  }
```
> L'information *description* sera intégrée plus tard dans l'application, il est donc conseillé de la remplir

> L'information help est optionnel, mais il est conseillé de la remplir pour une meilleure intégration de votre extension dans l'app

> L'information require permet d'avoir accès à certaines options en plus, comme ici, le module BotsOn canvas

## Front-end

Le dossier front-end contient les fichiers visible lors de la configuration de l'extension.
L'application affichera automatiquement la page internet *index.html* sur l'écran de l'utilisateur lorsque il essaiera de modifier l'extension.
Vous pouvez aussi ajouter d'autres fichiers nécessaire à votre fichier *index.html* comme un fichier *main.js* ou encore *style.css*

## Back-end

Le dossier back-end contient les fichiers actifs lors de l'hébergement du bot.
L'application ouvrira automatiquement le fichier *main.js* lorsque l'utilisateur cliquera sur le bouton héberger sur le menu du bot.
Vous pouvez aussi ajouter d'autres fichiers nécessaire à votre fichier *main.js* comme un dossier *node_modules* contenant des librairies pour votre extension
