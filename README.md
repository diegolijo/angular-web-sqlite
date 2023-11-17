# AngularWebSqlite

# instalar herramienta transpilación de la librería
- npm i ng-packagr

uso:
- añadir script a package.json del proyecto:
 "scripts": { "nombre-del-script": "ng-packagr -p projects/nommbre-librería/ng-package.json" }
- se lanza con ->  npm run nombre-del-script:
  genera la librería transpilada -> dist/nombre-librería


  https://medium.com/@insomniocode/creando-una-librer%C3%ADa-angular-y-subi%C3%A9ndola-a-npm-f78d212e8e71

  # generar la librería
- ng generate library nombre-librería  
  genera -> ./projects/nombre-librería

 falta
 
 -  pegar en el package.json final;
 
  "scripts": {
    "postinstall": "node src/lib/assets/angular-assets.js"
  },

- aumentar la versión
