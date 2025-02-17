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

  // Obtén el nombre del proyecto (clave primera o específica) dentro de projects
  var projectKeys = Object.keys(angularJson.projects);
  if (projectKeys.length === 0) {
    console.error('No se encontraron proyectos en el archivo angular.json.');
    return;
  }

  // Se asume que el primer proyecto es el que queremos modificar en este caso específico
  var projectName = projectKeys[0];
  var project = angularJson.projects[projectName];

  // Asegúrate de que la clave 'assets' exista en la configuración de la arquitectura de construcción
  if (!project
    || !project.architect
    || !project.architect.build
    || !project.architect.build.options
    || !project.architect.build.options.assets) {
    console.error('Estructura no válida en el archivo angular.json.');
    return;
  }

  // Verifica si las nuevas claves ya existen antes de agregarlas
  var existingAssets = project.architect.build.options.assets || [];
  newAssets.forEach(function (newAsset) {
    var exists = existingAssets.some(function (existingAsset) {
      return existingAsset.glob === newAsset.glob && existingAsset.input === newAsset.input && existingAsset.output === newAsset.output;
    });

    if (!exists) {
      existingAssets.push(newAsset);
    }
  });

  // Actualiza la clave 'assets'
  project.architect.build.options.assets = existingAssets;

  if (!project.architect.serve.options) {
    project.architect.serve.options = { headers: headers };
  } else if (!project.architect.serve.options.headers) {
    project.architect.serve.options.headers = headers;
  } else {
    // TODO añadir a las claves existentes
  }

  angularJson.projects[projectName] = project;

  // Escribe el contenido modificado de vuelta al archivo angular.json
  fs.writeFile(angularJsonPath, JSON.stringify(angularJson, null, 2), function (err) {
    if (err) {
      console.error('Error al escribir en el archivo angular.json:', err);
    } else {
      console.log('Objetos agregados con éxito al archivo angular.json.');
    }
  });

});
