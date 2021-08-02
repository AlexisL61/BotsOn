# Canvas

Le module node-canvas est indisponible en raison d'un soucis de compatibilité avec Electron.
Un module de substitution a donc été mis en place utilisant l'élement canvas sur une page html.

Cette fonctionnalité nécessite l'activation dans le fichier extension-data.json de cette façon:

```json
  require: ["canvas"]
```

## Créer un Canvas

Pour créer un élément Canvas, rien de plus simple. 

Récupérez tout d'abord dans votre extension le module canvas:

```js
  var {Canvas} = this.canvas
```

Vous allez ensuite pouvoir créer un élément canvas en créant un nouvel élément canvas et en incluant son longueur et sa hauteur en paramètre:

```js
  var my_canvas = new Canvas(200,100)
```

Ici, un Canvas de 200px de longueur et de 100px de hauteur sera créé

## Utilisation du Canvas

### Ecrire sur le Canvas
Vous allez pouvoir écrire sur le Canvas presque de la même façon qu'avec un Canvas du module node-canvas.

Pour dessiner sur le Canvas, vous pouvez utiliser la fonction executeOnContext() qui éxécutera la chaine de caractère donnée en paramètre. Exemple:

```js
  my_canvas.executeOnContext("font = '25px Arial'");
  my_canvas.executeOnContext("fillStyle = '#000000'");
  my_canvas.executeOnContext("fillText('Vive Canvas',50,50)")
```

Vous pouvez aussi éxécuter du code sur l'objet Canvas directement avec executeOnContext() ou encore dans la page web où se trouve votre canvas avec executeOnWebPage()

### Ajouter une image
Vous allez pouvoir ajouter une image directement sur votre Canvas avec la fonction addImage()

Cette fonction accepte comme argument: Une URL, une position x, une position y, une longueur et une hauteur.

Cette fonction est une fonction asynchrone qui retourne void lorsque l'image sera ajoutée sur votre Canvas. Exemple:

```js
  await my_canvas.addImage("https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",50,0,100,100)
  //Le logo Github a bien été ajouté sur le Canvas à la position 50 en x, et 0 en y et avec comme taille 100px en longueur et 100px en hautueur
```

### Ajouter une police
Vous allez pouvoir ajouter une police customisée avec la fonction addFont()

Cette fonction accepte comme argument: Un nom de police, qui pourra être utilisé lorsque vous allez écrire du texte et un URL vers la police correspondante

Cette fonction est une fonction asynchrone qui retourne void lorsque la police sera ajoutée sur la page web et lorsqu'elle sera chargée. Exemple:

```js
  await my_canvas.addFont("ma_police","./super-police.ttf")
  //Ajoute super_police.ttf comme police disponible pour l'écriture sur votre Canvas sous le nom ma_police
  thisCanvas.executeOnContext("font = '25px ma_police'")
```

### Récupération du buffer du Canvas
Pour récupérer un buffer du Canvas pour ensuite l'envoyer par Discord, vous pouvez utiliser la fonction toBuffer()

Cette fonction asynchrone retourne le buffer du Canvas. Exemple:

```js
  var buffer = await my_canvas.toBuffer()
  var attachment = new Discord.MessageAttachment(buffer);
  message.channel.send(attachment)
```
