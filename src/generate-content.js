// Fichier qui contient l'algorithme de génération.

// Ceci est un templater : transforme un template ejs en html.
const ejs = require("ejs");

// Ceci est un module qui permet de faire des lectures/écritures dans les fichiers.
const fs = require("fs");
const fsExtra = require('fs-extra');

// Ceci permet de créer des chemins d'accès aux fichiers simplement.
const path = require("path");

// Fonctions permetant de gérer les fichier et dossiers
function copyDirectory(oldPath, newPath) {
    if (fs.existsSync(oldPath)) {
        fs.mkdirSync(newPath, { recursive: true });
        fsExtra.copy(oldPath, newPath);
    }
}
function createDirectory(path) {
    if (!fs.existsSync(path))
        fs.mkdirSync(path, { recursive: true });
}
function saveFile(htmlPath, file) {
    fs.writeFileSync(htmlPath, file);
}
// Exportation de la fonction de génération.
module.exports.generateContent = async subjects => {
    // On commence par générer la racine du dossier 
    // où l'on souhaite enregistrer l'arborescence ("destination/index.html").
    const indexPath = path.join(__dirname, "../destination");
    const indexPathHtml = path.join(indexPath, "index.html");

    createDirectory(indexPath);


    const indexRender = await ejs.renderFile(
        path.join(__dirname, "../templates/index.ejs"),
        {
            indexPath: indexPathHtml,
            rootPath: indexPath,
        }
    );
    saveFile(indexPathHtml, indexRender);
    console.log(`Writing to ${indexPathHtml}`);

    for (const subjectContent of subjects) {

        const subjectPath = path.join(indexPath, subjectContent.id);
        createDirectory(subjectPath);

        const levels = ["0", "3", "4", "5"];
        // Level 0 permet de créer la page contenant toute les leçons

        // On génère les pages de table des matières selon l'age sélectionné
        for (const level of levels) {
            const levelPathHtml = path.join(subjectPath, subjectContent.id + level + ".html");
            const levelRender = await ejs.renderFile(
                path.join(__dirname, "../templates/subjectPage.ejs"),
                {
                    subjectContent: subjectContent,
                    allSubjectsContent: subjects,
                    currentLesson: undefined,
                    rootPath: indexPath,
                    indexPath: indexPathHtml,
                    currentLevel: level,
                })
            saveFile(levelPathHtml, levelRender);
        };

        // // On parcourt tous les thèmes
        for (const theme of subjectContent.themes) {
            // On sélectionne les cours qui correspondent au thème en question
            const selectedLessons = subjectContent.lessons.filter(
                lesson =>
                    lesson.theme === theme.id
            );
            console.log(selectedLessons.length, "leçons dans le thème : ", theme.title);

            // // On parcourt toutes les leçons de chaque thème
            // La constante "lesson" correspond à la leçon issue du json de la table des matières
            for (const lesson of selectedLessons) {
                // On définit le nouveau chemins

                const newLessonPath = path.join(subjectPath, lesson.id.split('/')[1]);
                const lessonid = lesson.id.substring(lesson.id.length - 2, lesson.id.length);
                const newLessonHtmlPath = path.join(newLessonPath, lessonid + ".html");

                // On définit l'ancien chemin
                const oldLessonPath = path.join(__dirname,
                    "../data/" + subjectContent.id + "/",
                    lesson.id.substring(lesson.id.length - 2, lesson.id.length),
                    "/");
                const lessonJsonPath = path.join(oldLessonPath, "content.json");

                // On définit les chemin des dossier img et latex pour les copier
                const oldImgPath = path.join(oldLessonPath, "img");
                const newImgPath = path.join(newLessonPath, "/img");
                const oldLatexPath = path.join(oldLessonPath, "latex");
                const newLatexPath = path.join(newLessonPath, "/latex");

                createDirectory(newLessonPath)

                copyDirectory(oldImgPath, newImgPath);

                copyDirectory(oldLatexPath, newLatexPath);

                // On récupère les informations du Json du cours
                const lessonJson = require(lessonJsonPath);

                // C'est ici que se passe la génération du template.
                // Tous les cours partagent la même structure de page, on part donc toujours du même fichier de base.
                // le seul truc qui change, ce sont les paramètres du cours (le contenu, le titre, etc.).
                // On crée un fichier html pour chacun des cours du thème
                const lessonRender = await ejs.renderFile(
                    path.join(__dirname, "../templates/lessonPage.ejs"),
                    {
                        subjectContent: subjectContent,
                        allSubjectsContent: subjects,
                        currentLesson: lesson,
                        rootPath: indexPath,
                        indexPath: indexPathHtml,
                        lessonContent: lessonJson,
                    }
                );

                saveFile(newLessonHtmlPath, lessonRender);

                // // On créer les pages de questions
                const numberQuestions = lessonJson.questions.length;

                for (let i = 1; i <= numberQuestions; i++) {
                    questionHtmlPath = path.join(newLessonPath, "question" + i + ".html")

                    const questionRender = await ejs.renderFile(
                        path.join(__dirname, "../templates/questions.ejs"),
                        {
                            subjectContent: subjectContent,
                            allSubjectsContent: subjects,
                            currentLesson: lesson,
                            rootPath: indexPath,
                            indexPath: indexPathHtml,
                            lessonContent: lessonJson,
                            questionJson: lessonJson.questions[i - 1],
                            counter: i,
                        }
                    );

                    saveFile(questionHtmlPath, questionRender);
                }
            }
        }
    }
};
