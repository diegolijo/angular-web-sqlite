var path = require('path');
var shell = require('shelljs');

// Obtener la ruta completa de la carpeta antigua y nueva utilizando __dirname
var rutaAntigua = path.resolve(__dirname, '../dist/bundle/sqlite-worker.js');
var rutaNueva = path.resolve(__dirname, '../../projects/angular-web-sqlite/src/lib/assets');

// Mover la carpeta a la nueva ubicación
shell.mv('-f', rutaAntigua, rutaNueva);