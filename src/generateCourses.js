// Ceci permet de créer des chemins d'accès aux fichiers simplement.
const path = require("path");

// functions
const { generateIndex, generateSubjectContentArray, createNewSubjectDir,
    generateSubjectLevelPage, generateLessonPage, extractLessonJSON,
    createNewLessonDir, generateQuestionPage } = require("./functions");


// Exportation de la fonction de génération.
module.exports.generateCourses = async subjectContentPaths => {
    const newDirPath = path.join(__dirname, "../destination"); // Il s'agit du dossier des nouvelles pages 
    generateIndex(newDirPath)
    const subjectsContents = generateSubjectContentArray(subjectContentPaths) // Contenu de chacun des Subjects

    for (const subjectContent of subjectsContents) {
        createNewSubjectDir(newDirPath, subjectContent)
        const levels = ["0", "3", "4", "5"];     // Level 0 permet de créer la page contenant toute les leçons
        for (const level of levels) {
            generateSubjectLevelPage(newDirPath, subjectContent, subjectsContents, level)
        };

        for (const theme of subjectContent.themes) {
            // On sélectionne les cours qui correspondent au thème en question
            const selectedLessons = subjectContent.lessons.filter(lesson => lesson.theme === theme.id);
            console.log(selectedLessons.length, "leçons dans le thème : ", theme.title);

            // La constante "lesson" correspond à la leçon issue du json de la table des matières
            for (const lesson of selectedLessons) {
                const dataPath = path.join(__dirname, "../data/");    // Il s'agit du chemin des données JSON
                createNewLessonDir(newDirPath, dataPath, subjectContent, lesson);
                const lessonJson = extractLessonJSON(dataPath, subjectContent, lesson);
                generateLessonPage(newDirPath, dataPath, subjectContent, subjectsContents, lesson, lessonJson);

                const numberQuestions = lessonJson.questions.length;
                for (let i = 1; i <= numberQuestions; i++) {
                    generateQuestionPage(newDirPath, dataPath, i, subjectContent, subjectsContents, lesson, lessonJson);
                }
            }
        }
    }
};
