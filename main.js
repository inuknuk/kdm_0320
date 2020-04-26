// Fichier principal qui est lancé pour générer les pages

// Ceci permet de créer des chemins d'accès aux fichiers simplement.
const path = require("path");

// Fonction utile qui peut être appelée à la volée et génère le contenu 
// Cette fonction se trouve dans le dossier "src".
const { generateCourses } = require("./src/generateCourses");

// On créer les paths 
const contentHistPath = path.join(__dirname, "./data/hist/content.json");
const contentMathPath = path.join(__dirname, "./data/math/content.json");
const contentLatinPath = path.join(__dirname, "./data/latin/content.json");
const contentSciPath = path.join(__dirname, "./data/sci/content.json");

const subjectContentPaths = [contentHistPath, contentMathPath, contentLatinPath, contentSciPath]

// On lance la fonction de génération. Il faut ensuite aller voir le dossier "destination".
generateCourses(subjectContentPaths)
    // S'il se passe une erreur, on l'intercepte et on l'affiche.
    .catch(console.error);