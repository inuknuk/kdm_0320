// Fichier qui contient l'algorithme de génération.

// Ceci est un templater : transforme un template ejs en html.
const ejs = require("ejs");

// Ceci est un module qui permet de faire des lectures/écritures dans les fichiers.
const fs = require("fs");
const fs_extra = require('fs-extra');

// Ceci permet de créer des chemins d'accès aux fichiers simplement.
const path = require("path");

// Copier un dossier et son contenu 
function copy_directory(oldPath, newPath) {
    if (fs.existsSync(oldPath)) {
        fs.mkdirSync(newPath, { recursive: true });
        fs_extra.copy(oldPath, newPath);
    }
}

// Exportation de la fonction de génération.
module.exports.generateContent = async content => {
    // On commence par générer la racine du dossier 
    // où l'on souhaite enregistrer l'arborescence ("destination/index.html").
    const indexPath = path.join(__dirname, "../destination");
    const indexPathHtml = path.join(indexPath, "index.html");


    console.log(`Writing to ${indexPathHtml}`);

    // On génère le page index.html
    // Il s'agit de la page d'acceuil
    const indexRender = await ejs.renderFile(
        path.join(__dirname, "../templates/index.ejs"),
        {
            allContent: content,
            currentLesson: undefined,
            rootPath: indexPath,
        }
    );
    // Une fois l'index généré, on le sauvegarde.
    fs.writeFileSync(indexPathHtml, indexRender);

    const levels = ["3", "4", "5"];
    // On génère les pages de table des matières selon l'age sélectionné
    for (const level of levels) {
        const levelPath = path.join(indexPath, level + ".html");
        const levelRender = await ejs.renderFile(
            path.join(__dirname, "../templates/level.ejs"),
            {
                allContent: content,
                currentLesson: undefined,
                rootPath: indexPath,
                currentLevel: level,
            })
        fs.writeFileSync(levelPath, levelRender);
    };



    // // On parcourt tous les thèmes
    for (const theme of content.themes) {
        const themePath = path.join(__dirname, "../destination", theme.id);

        // On crée un dossier pour chacun des thèmes
        if (!fs.existsSync(themePath))
            fs.mkdirSync(themePath, { recursive: true });

        // On sélectionne les cours qui correspondent au thème en question
        const selectedLessons = content.lessons.filter(
            lesson =>
                lesson.theme === theme.id
        );
        console.log("number of selected lessons", selectedLessons.length);


        // // On parcourt tous les leçons de chaque thème
        for (const lesson of selectedLessons) {
            // On définit le nouveau chemin
            // On supprime les : et les / pour créer les noms de dossier
            let lessonTitle = lesson.title.replace(':', '');
            lessonTitle = lessonTitle.replace('/', '');
            const newLessonPath = path.join(themePath, lessonTitle);
            const lessonid = lesson.id.substring(lesson.id.length - 2, lesson.id.length);
            const newLessonHtmlPath = path.join(newLessonPath, lessonid + ".html");

            // On définit l'ancien chemin
            const oldLessonPath = path.join(__dirname,
                "../math/",
                lesson.id.substring(lesson.id.length - 2, lesson.id.length),
                "/");
            const lessonJsonPath = path.join(oldLessonPath, "content.json");

            // On définit les chemin des dossier img et latex pour les copier
            const oldImgPath = path.join(oldLessonPath, "img");
            const newImgPath = path.join(newLessonPath, "/img");
            const oldLatexPath = path.join(oldLessonPath, "latex");
            const newLatexPath = path.join(newLessonPath, "/latex");

            // On crée un dossier pour chacun des cours du thème            
            if (!fs.existsSync(newLessonPath))
                fs.mkdirSync(newLessonPath, { recursive: true });

            // On copie le dossier img dans le nouveau dossier
            copy_directory(oldImgPath, newImgPath);

            // On copie le dossier latex dans le nouveau dossier
            copy_directory(oldLatexPath, newLatexPath);

            // On récupère les informations du Json du cours pour le finir à la génération du template
            const lessonJson = require(lessonJsonPath);
            // C'est ici que se passe la génération du template.
            // Tous les cours partagent la même structure de page, on part donc toujours du même fichier de base.
            // le seul truc qui change, ce sont les paramètres du cours (le contenu, le titre, etc.).
            // On crée un fichier html pour chacun des cours du thème
            const render = await ejs.renderFile(
                path.join(__dirname, "../templates/lesson.ejs"),
                {
                    allContent: content,
                    currentLesson: lesson,
                    rootPath: indexPath,
                    lessonContent: lessonJson,
                }
            );

            // Une fois le cours généré, on le sauvegarde.
            fs.writeFileSync(newLessonHtmlPath, render);

            // // On créer les pages de questions
            const numberQuestions = lessonJson.questions.length;
            // On créer le dossier contenant les questions
            const questionDirectoryPath = path.join(newLessonPath, "questions");

            if (!fs.existsSync(questionDirectoryPath))
                fs.mkdirSync(questionDirectoryPath, { recursive: true });

            for (let i = 0; i < numberQuestions; i++) {
                questionHtmlPath = path.join(questionDirectoryPath, i + ".html")

                const render = await ejs.renderFile(
                    path.join(__dirname, "../templates/questions.ejs"),
                    {
                        allContent: content,
                        currentLesson: lesson,
                        rootPath: indexPath,
                        lessonContent: lessonJson,
                        question: lessonJson.questions[i]
                    }
                );

                // Une fois le cours généré, on le sauvegarde.
                fs.writeFileSync(questionHtmlPath, render);



            }
        }
    }

};
