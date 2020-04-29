// Ceci permet de créer des chemins d'accès aux fichiers simplement.
const path = require("path");
// Ceci est un templater : transforme un template ejs en html.
const ejs = require("ejs");
// Ceci est un module qui permet de faire des lectures/écritures dans les fichiers.
const fs = require("fs");

const { copyDirectory, createDirectory, saveFile, loadJson } = require("./utils");

const { latexReplacement, pathTransformer, subjectPathCreator,
    subjectLevelPathCreator, lessonPathCreator, questionPathCreator } = require("./templaterFunctions");

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
                generateLessonPage(newDirPath, dataPath, subjectContent, subjectsContents, lesson);

                const numberQuestions = extractLessonJSON(dataPath, subjectContent, lesson).questions.length;
                for (let i = 1; i <= numberQuestions; i++) {
                    generateQuestionPage(newDirPath, dataPath, i, subjectContent, subjectsContents, lesson);
                }
            }
        }
    }
};

async function generateIndex(newDirPath) {
    const indexHtml = path.join(newDirPath, "index.html");
    createDirectory(newDirPath);

    let pathHist = pathTransformer(newDirPath + "/hist/hist0.html");
    let pathMath = pathTransformer(newDirPath + "/math/math0.html");
    let pathLatin = pathTransformer(newDirPath + "/latin/latin0.html");
    let pathSci = pathTransformer(newDirPath + "/sci/sci0.html");

    const indexRender = await ejs.renderFile(
        path.join(__dirname, "../templates/index.ejs"),
        {
            indexPath: indexHtml,
            pathHist: pathHist,
            pathMath: pathMath,
            pathLatin: pathLatin,
            pathSci: pathSci,
            pathTransformer: pathTransformer,
        }
    );
    saveFile(indexHtml, indexRender);
    console.log(`Writing to ${indexHtml}`);
}

function generateSubjectContentArray(PathsArray) {
    let contentArray = [];
    for (const newPath of PathsArray) {
        contentArray.push(loadJson(newPath))
    };
    return contentArray;
}

function createNewSubjectDir(newDirPath, subjectContent) {
    const subjectPath = path.join(newDirPath, subjectContent.id);
    createDirectory(subjectPath);
}

async function generateSubjectLevelPage(newDirPath, subjectContent, subjectsContents, level) {
    const indexHtml = path.join(newDirPath, "index.html");
    const levelPathHtml = path.join(newDirPath, subjectContent.id, subjectContent.id + level + ".html");

    const levelPageParams = {
        indexPath: indexHtml,
        rootPath: newDirPath,
        currentLevel: level,
        subjectPathCreator: subjectPathCreator,
        pathTransformer: pathTransformer,
        subjectLevelPathCreator: subjectLevelPathCreator,
        lessonPathCreator: lessonPathCreator,
        subjectContent: subjectContent,
        allSubjectsContent: subjectsContents,
        pathArray: subjectLevelPathCreator(subjectContent, newDirPath),
    }
    const levelRender = await ejs.renderFile(
        path.join(__dirname, "../templates/subjectLevelPage.ejs"), levelPageParams)

    saveFile(levelPathHtml, levelRender);
}

async function generateLessonPage(newDirPath, dataPath, subjectContent, subjectsContents, lesson) {
    const indexHtml = pathTransformer(path.join(newDirPath, "index.html"));
    const lessonJson = extractLessonJSON(dataPath, subjectContent, lesson)

    const lessonid = lesson.id.substring(lesson.id.length - 2, lesson.id.length);
    const newLessonHtmlPath = path.join(newDirPath,
        subjectContent.id,
        lesson.id.split('/')[1],
        lessonid + ".html");

    const lessonPageParams = {
        subjectContent: subjectContent,
        allSubjectsContent: subjectsContents,
        currentLesson: lesson,
        rootPath: newDirPath,
        indexPath: indexHtml,
        dataPath: dataPath,
        lessonContent: lessonJson,
        latexReplacement: latexReplacement,
        subjectPathCreator: subjectPathCreator,
        pathTransformer: pathTransformer,
        questionPathCreator: questionPathCreator,
        subjectPath: pathTransformer(subjectPathCreator(subjectContent, "0", newDirPath)),
        questionPath: pathTransformer(questionPathCreator(subjectContent, lesson, 1, newDirPath)),
    }
    const lessonRender = await ejs.renderFile(
        path.join(__dirname, "../templates/lessonPage.ejs"), lessonPageParams);

    saveFile(newLessonHtmlPath, lessonRender);
}

function createNewLessonDir(newDirPath, dataPath, subjectContent, lesson) {
    const newLessonPath = path.join(newDirPath, subjectContent.id, lesson.id.split('/')[1]);
    const oldLessonPath = path.join(dataPath
        + subjectContent.id + "/",
        lesson.id.substring(lesson.id.length - 2, lesson.id.length),
        "/");

    // On définit les chemin du dossier img pour le copier
    const oldImgPath = path.join(oldLessonPath, "img");
    const newImgPath = path.join(newLessonPath, "/img");

    createDirectory(newLessonPath)
    copyDirectory(oldImgPath, newImgPath);
}

function extractLessonJSON(dataPath, subjectContent, lesson) {
    const lessonJsonPath = path.join(dataPath
        + subjectContent.id + "/",
        lesson.id.substring(lesson.id.length - 2, lesson.id.length),
        "/content.json");
    const lessonJson = loadJson(lessonJsonPath);
    return lessonJson;
}

async function generateQuestionPage(newDirPath, dataPath, i, subjectContent, subjectsContents, lesson) {
    const indexHtml = pathTransformer(path.join(newDirPath, "index.html"));
    const lessonJson = extractLessonJSON(dataPath, subjectContent, lesson)

    const subjectPath = path.join(newDirPath, subjectContent.id);
    const newLessonPath = path.join(subjectPath, lesson.id.split('/')[1]);
    const questionHtmlPath = path.join(newLessonPath, "question" + i + ".html")

    const questionRender = await ejs.renderFile(
        path.join(__dirname, "../templates/questions.ejs"),
        {
            subjectContent: subjectContent,
            allSubjectsContent: subjectsContents,
            currentLesson: lesson,
            rootPath: newDirPath,
            indexPath: indexHtml,
            lessonContent: lessonJson,
            questionJson: lessonJson.questions[i - 1],
            counter: i,
            latexReplacement: latexReplacement,
            subjectPathCreator: subjectPathCreator,
            pathTransformer: pathTransformer,
            questionPathCreator: questionPathCreator,
            lessonPathCreator: lessonPathCreator,
            subjectPath: pathTransformer(subjectPathCreator(subjectContent, "0", newDirPath)),
            lessonPath: pathTransformer(lessonPathCreator(subjectContent, lesson, newDirPath)),
            questionContent: latexReplacement(lessonJson.questions[i - 1].question, dataPath + lessonJson.id + "/latex/"),
            nextQuestionPath: pathTransformer(questionPathCreator(subjectContent, lesson, i + 1, newDirPath)),
            lastQuestionPath: pathTransformer(questionPathCreator(subjectContent, lesson, i - 1, newDirPath)),
        }
    );
    saveFile(questionHtmlPath, questionRender);
}
