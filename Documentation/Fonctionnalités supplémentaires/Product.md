# Product
## Introduction
Il est possible, pour vos extensions, de créer des products. Ce sont des fonctionnalités additionnelles achetable contre des pièces.

## Création d'un product
Vous pouvez créer un product directement à partir de votre extension dans votre dashboard sur le site de [BotsOn](https://botsonapp.me/).

### Que mettre dans un product

Vous pouvez mettre dans votre product tous type de fichiers qui seront téléchargeables par un utilisateur ayant acheté le product.

Tous ces fichiers doivent se trouver dans un .zip

### Téléchargement du product
Les fichiers contenus dans le product seront ajoutés automatiquement dans votre extension si l'utilisateur a le product.

Exemple: 
Si dans mon zip, j'ajoute un fichier nommé "fichier_product_1" et un fichier nommé "fichier_product_2" et que l'id de mon product est 12345 alors, l'arborescence de mes fichiers donnera:

Si l'utilisateur a le product:
```
<id-extension>
 |__📁front-end
 |__📁back-end
 |__📁products
 |   |__📁12345
 |       |__📇fichier_product_1
 |       |__📇fichier_product_2
 |__📇extension-data.json
 ``` 

 Si l'utilisateur n'a pas le product:
```
<id-extension>
 |__📁front-end
 |__📁back-end
 |__📇extension-data.json
 ``` 

BotsOn ne va donc pas faire télécharger le product a une personne qui n'a pas le product

### Publier un product

Pour publier votre product, vous devez, comme pour une extension, le zipper et l'héberger quelque part.
Il vous sera alors demandé, lors de la création de votre product sur le site de BotsOn, un lien zip vers ce product

Après avoir créé un product, votre product va être vérifié par l'équipe de BotsOn.

Lors de la création de votre product, vous allez être redirigé vers la page de votre product. Cette page va vous permettre de récupérer son id (inclus dans l'url), nécessaire ensuite pour communiquer avec les serveurs de BotsOn.