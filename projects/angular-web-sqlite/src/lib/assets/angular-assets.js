var fs = require('fs');

var angularJsonPath = '../../../../../angular.json';

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

// Lee el contenido actual del archivo angular.json
fs.readFile(angularJsonPath, 'utf8', function (err, data) {
    if (err) {
        console.error('Error al leer el archivo angular.json:', err);
        return;
    }

    // Parsea el contenido JSON
    var angularJson = JSON.parse(data);

    // Asegúrate de que la clave 'assets' exista en la configuración de la arquitectura de construcción
    if (!angularJson.projects || !angularJson.projects.app || !angularJson.projects.app.architect || !angularJson.projects.app.architect.build || !angularJson.projects.app.architect.build.options || !angularJson.projects.app.architect.build.options.assets) {
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


    // Escribe el contenido modificado de vuelta al archivo angular.json
    fs.writeFile(angularJsonPath, JSON.stringify(angularJson, null, 2), function (err) {
        if (err) {
            console.error('Error al escribir en el archivo angular.json:', err);
        } else {
            console.log('Objetos agregados con éxito al archivo angular.json.');
        }
    });
});
