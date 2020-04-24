// Ceci sont les modules qui permettent de faire des lectures/écritures dans les fichiers.
const fs = require("fs");
const fsExtra = require('fs-extra');


exports.test = function () {
    console.log("test concluant");
}

// Fonctions permetant de gérer les fichier et dossiers
exports.copyDirectory = function (oldPath, newPath) {
    if (fs.existsSync(oldPath)) {
        fs.mkdirSync(newPath, { recursive: true });
        fsExtra.copy(oldPath, newPath);
    }
}

exports.createDirectory = function (path) {
    if (!fs.existsSync(path))
        fs.mkdirSync(path, { recursive: true });
}

exports.saveFile = function (htmlPath, file) {
    fs.writeFileSync(htmlPath, file);
}