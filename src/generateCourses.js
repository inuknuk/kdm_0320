const { copyDirectory, createDirectory, saveFile } = require("./utils");

// Ceci est un templater : transforme un template ejs en html.
const ejs = require("ejs");

// Ceci est un module qui permet de faire des lectures/écritures dans les fichiers.
const fs = require("fs");

// Ceci permet de créer des chemins d'accès aux fichiers simplement.
const path = require("path");

// functional functions
const { generateIndex, generateSubjectContentArray, generateLevelPage,
    generateLessonPage, extractLessonJSON, createNewDir, generateQuestionPage } = require("./function");


// Exportation de la fonction de génération.
module.exports.generateCourses = async subjectContentPaths => {
    const newDirPath = path.join(__dirname, "../destination");
    generateIndex(newDirPath)

    let subjectsContents = generateSubjectContentArray(subjectContentPaths)

    for (const subjectContent of subjectsContents) {
        const subjectPath = path.join(newDirPath, subjectContent.id);
        createDirectory(subjectPath);
        const levels = ["0", "3", "4", "5"];     // Level 0 permet de créer la page contenant toute les leçons

        for (const level of levels) {    // On génère les pages de table des matières selon l'age sélectionné
            generateLevelPage(newDirPath, subjectContent, subjectsContents, level)
        };

        for (const theme of subjectContent.themes) {    // On parcourt tous les thèmes
            // On sélectionne les cours qui correspondent au thème en question
            const selectedLessons = subjectContent.lessons.filter(lesson => lesson.theme === theme.id);
            console.log(selectedLessons.length, "leçons dans le thème : ", theme.title);

            // // On parcourt toutes les leçons de chaque thème
            // La constante "lesson" correspond à la leçon issue du json de la table des matières
            for (const lesson of selectedLessons) {
                // On définit l'ancien chemin
                const dataPath = path.join(__dirname, "../data/");
                const lessonJson = extractLessonJSON(dataPath, subjectContent, lesson);
                createNewDir(newDirPath, dataPath, subjectContent, lesson);
                generateLessonPage(newDirPath, dataPath, subjectContent, subjectsContents, lesson, lessonJson);

                const numberQuestions = lessonJson.questions.length;
                for (let i = 1; i <= numberQuestions; i++) {
                    generateQuestionPage(newDirPath, dataPath, i, subjectContent, subjectsContents, lesson, lessonJson);
                }
            }
        }
    }
};
