var fs = require('fs');
var path = require('path');

var angularJsonPath = '../../../../../angular.json';
var projectPath = '../../../../../src';
var proxyFilePath = './proxy.conf.js';

// Nuevos objetos que deseas agregar a la clave assets
var newAssets = [
  {
    "glob": "**/*.js",
    "input": "./node_modules/angular-web-sqlite/src/lib/assets",
    "output": "./sqlite-client/"
  },
  {
    "glob": "**/*",
    "input": "./node_modules/@sqlite.org/sqlite-wasm/sqlite-wasm/jswasm/",
    "output": "./sqlite-client/"
  }
];

var headers = {
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp"
}

// Lee el contenido actual del archivo angular.json
fs.readFile(angularJsonPath, 'utf8', function (err, data) {
  if (err) {
    console.error('Error al leer el archivo angular.json:', err);
    return;
  }

  // Parsea el contenido JSON
  var angularJson = JSON.parse(data);

  // Asegúrate de que la clave 'assets' exista en la configuración de la arquitectura de construcción
  if (!angularJson.projects
    || !angularJson.projects.app
    || !angularJson.projects.app.architect
    || !angularJson.projects.app.architect.build
    || !angularJson.projects.app.architect.build.options
    || !angularJson.projects.app.architect.build.options.assets
    || !angularJson.projects.app.architect.serve
    || !angularJson.projects.app.architect.serve.options) {
    console.error('Estructura no válida en el archivo angular.json.');
    return;
  }

  // Verifica si las nuevas claves ya existen antes de agregarlas
  var existingAssets = angularJson.projects.app.architect.build.options.assets || [];
  newAssets.forEach(function (newAsset) {
    var exists = existingAssets.some(function (existingAsset) {
      return existingAsset.glob === newAsset.glob && existingAsset.input === newAsset.input && existingAsset.output === newAsset.output;
    });

    if (!exists) {
      existingAssets.push(newAsset);
    }
  });

  // Actualiza la clave 'assets'
  angularJson.projects.app.architect.build.options.assets = existingAssets;

  var serveOptionsPath = angularJson.projects.app.architect.serve.options;
  if (!serveOptionsPath.headers) {
    serveOptionsPath.headers = headers;
  }else{
    // TODO añadir a las claves existentes
  }

  angularJson.projects.app.architect.serve.options = serveOptionsPath


  // Escribe el contenido modificado de vuelta al archivo angular.json
  fs.writeFile(angularJsonPath, JSON.stringify(angularJson, null, 2), function (err) {
    if (err) {
      console.error('Error al escribir en el archivo angular.json:', err);
    } else {
      console.log('Objetos agregados con éxito al archivo angular.json.');
    }
  });

});
