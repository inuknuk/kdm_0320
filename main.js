// Fichier principal qui est lancé pour générer les pages

// Fonction utile qui peut être appelée à la volée et génère le contenu 
// Cette fonction se trouve dans le dossier "src".
const { generateContent } = require("./src/generate-content");

// On charge le contenu du json.
const content = require("./math/content.json");

// On lance la fonction de génération. Il faut ensuite aller voir le dossier "dist".
generateContent(content)
    // S'il se passe une erreur, on l'intercepte et on l'affiche.
    .catch(console.error);
