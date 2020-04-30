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
    const allSubjectsContent = generateSubjectContentArray(subjectContentPaths) // Contenu de chacun des Subjects

    for (const subjectContent of allSubjectsContent) {
        createNewSubjectDir(newDirPath, subjectContent.id)
        const levels = ["0", "3", "4", "5"];     // Level 0 permet de créer la page contenant toute les leçons
        for (const level of levels) {
            generateSubjectLevelPage(newDirPath, subjectContent, allSubjectsContent, level)
        };

        for (const theme of subjectContent.themes) {
            // On sélectionne les cours qui correspondent au thème en question
            const selectedLessons = subjectContent.lessons.filter(lesson => lesson.theme === theme.id);
            console.log(selectedLessons.length, "leçons dans le thème : ", theme.title);

            // La constante "lesson" correspond à la leçon issue du json de la table des matières
            for (const lesson of selectedLessons) {
                const oldDirPath = path.join(__dirname, "../data/");    // Il s'agit du chemin des données JSON
                createNewLessonDir(newDirPath, oldDirPath, subjectContent.id, lesson.id);

                // A modifier
                const numberLessonPages = extractLessonJSON(oldDirPath, subjectContent.id, lesson.id).pages.length;
                if (numberLessonPages == 0) { // Cas ou il n'y a pas encore de pages de créer
                    generateZeroPage(newDirPath, oldDirPath, subjectContent, allSubjectsContent, lesson);
                }
                for (let i = 1; i <= numberLessonPages; i++) {
                    generateLessonPage(newDirPath, oldDirPath, i, subjectContent, allSubjectsContent, lesson);
                }

                const numberQuestions = extractLessonJSON(oldDirPath, subjectContent.id, lesson.id).questions.length;
                for (let i = 1; i <= numberQuestions; i++) {
                    generateQuestionPage(newDirPath, oldDirPath, i, subjectContent, allSubjectsContent, lesson);
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

function generateSubjectContentArray(pathsArray) {
    let contentArray = [];
    for (const newPath of pathsArray) {
        contentArray.push(loadJson(newPath))
    };
    return contentArray;
}

function createNewSubjectDir(newDirPath, subjectContentId) {
    const subjectPath = path.join(newDirPath, subjectContentId);
    createDirectory(subjectPath);
}

async function generateSubjectLevelPage(newDirPath, subjectContent, allSubjectsContent, level) {
    const indexHtml = path.join(newDirPath, "index.html");
    const levelPathHtml = path.join(newDirPath, subjectContent.id, subjectContent.id + level + ".html");

    const levelPageParams = {
        indexPath: indexHtml,
        newDirPath: newDirPath,
        currentLevel: level,
        subjectPathCreator: subjectPathCreator,
        pathTransformer: pathTransformer,
        lessonPathCreator: lessonPathCreator,
        subjectContent: subjectContent,
        allSubjectsContent: allSubjectsContent,
        pathArray: subjectLevelPathCreator(subjectContent.id, newDirPath),
    }
    const levelRender = await ejs.renderFile(
        path.join(__dirname, "../templates/subjectLevelPage.ejs"), levelPageParams)

    saveFile(levelPathHtml, levelRender);
}

async function generateLessonPage(newDirPath, oldDirPath, i, subjectContent, allSubjectsContent, lesson) {
    const indexHtml = pathTransformer(path.join(newDirPath, "index.html"));
    const lessonId = lessonNumberFromId(lesson.id);
    const lessonJson = extractLessonJSON(oldDirPath, subjectContent.id, lessonId);

    const newLessonHtmlPath = lessonPathCreator(subjectContent.id, lesson.id, i, newDirPath)

    const pageHtml = path.join(oldDirPath, lessonJson.pages[i - 1]);
    const pageContent = fs.readFileSync(pageHtml).toString();
    const latexFolderPath = oldDirPath + lessonJson.id + "/latex/";

    const lessonPageParams = {
        subjectContent: subjectContent,
        allSubjectsContent: allSubjectsContent,
        currentLesson: lesson,
        newDirPath: newDirPath,
        indexPath: indexHtml,
        oldDirPath: oldDirPath,
        lessonJson: lessonJson,
        counter: i,
        latexReplacement: latexReplacement,
        subjectPathCreator: subjectPathCreator,
        pathTransformer: pathTransformer,
        pageContent: latexReplacement(pageContent, latexFolderPath),
        subjectPath: pathTransformer(subjectPathCreator(subjectContent.id, "0", newDirPath)),
        questionPath: pathTransformer(questionPathCreator(subjectContent.id, lesson.id, 1, newDirPath)),
        nextLessonPagePath: pathTransformer(lessonPathCreator(subjectContent.id, lesson.id, i + 1, newDirPath)),
        lastLessonPagePath: pathTransformer(lessonPathCreator(subjectContent.id, lesson.id, i - 1, newDirPath)),
    }
    const lessonRender = await ejs.renderFile(
        path.join(__dirname, "../templates/lessonPage.ejs"), lessonPageParams);

    saveFile(newLessonHtmlPath, lessonRender);
}

async function generateZeroPage(newDirPath, oldDirPath, subjectContent, allSubjectsContent, lesson) {
    const indexHtml = pathTransformer(path.join(newDirPath, "index.html"));
    const lessonId = lessonNumberFromId(lesson.id);
    const lessonJson = extractLessonJSON(oldDirPath, subjectContent.id, lessonId);

    const newLessonHtmlPath = lessonPathCreator(subjectContent.id, lesson.id, 1, newDirPath)

    const pageContent = "<p>A venir</p>"

    const lessonPageParams = {
        subjectContent: subjectContent,
        allSubjectsContent: allSubjectsContent,
        currentLesson: lesson,
        newDirPath: newDirPath,
        indexPath: indexHtml,
        oldDirPath: oldDirPath,
        lessonJson: lessonJson,
        counter: 1,
        latexReplacement: latexReplacement,
        subjectPathCreator: subjectPathCreator,
        pathTransformer: pathTransformer,
        pageContent: pageContent,
        subjectPath: pathTransformer(subjectPathCreator(subjectContent.id, "0", newDirPath)),
        questionPath: pathTransformer(questionPathCreator(subjectContent.id, lesson.id, 1, newDirPath)),
        nextLessonPagePath: pathTransformer(lessonPathCreator(subjectContent.id, lesson.id, 2, newDirPath)),
        lastLessonPagePath: pathTransformer(lessonPathCreator(subjectContent.id, lesson.id, 0, newDirPath)),
    }
    const lessonRender = await ejs.renderFile(
        path.join(__dirname, "../templates/lessonPage.ejs"), lessonPageParams);

    saveFile(newLessonHtmlPath, lessonRender);
}

function createNewLessonDir(newDirPath, oldDirPath, subjectContentId, lessonId) {
    const newLessonPath = path.join(newDirPath, subjectContentId, lessonId.split('/')[1]);
    const oldLessonPath = path.join(oldDirPath + subjectContentId + "/", lessonNumberFromId(lessonId), "/");

    // On définit les chemins du dossier img pour le copier
    const oldImgPath = path.join(oldLessonPath, "img");
    const newImgPath = path.join(newLessonPath, "/img");

    createDirectory(newLessonPath)
    copyDirectory(oldImgPath, newImgPath);
}

function extractLessonJSON(oldDirPath, subjectId, lessonId) {
    const lessonJsonPath = path.join(oldDirPath + subjectId + "/", lessonNumberFromId(lessonId), "/content.json");
    const lessonJson = loadJson(lessonJsonPath);
    return lessonJson;
}

async function generateQuestionPage(newDirPath, oldDirPath, i, subjectContent, allSubjectsContent, lesson) {
    const indexHtml = pathTransformer(path.join(newDirPath, "index.html"));
    const lessonJson = extractLessonJSON(oldDirPath, subjectContent.id, lesson.id)

    const newLessonPath = path.join(newDirPath, subjectContent.id, lesson.id.split('/')[1]);
    const questionHtmlPath = path.join(newLessonPath, "question" + i + ".html")

    const questionPageParams = {
        subjectContent: subjectContent,
        allSubjectsContent: allSubjectsContent,
        currentLesson: lesson,
        newDirPath: newDirPath,
        indexPath: indexHtml,
        lessonJson: lessonJson,
        questionJson: lessonJson.questions[i - 1],
        counter: i,
        latexReplacement: latexReplacement,
        subjectPathCreator: subjectPathCreator,
        pathTransformer: pathTransformer,
        subjectPath: pathTransformer(subjectPathCreator(subjectContent.id, "0", newDirPath)),
        lessonPath: pathTransformer(lessonPathCreator(subjectContent.id, lesson.id, 1, newDirPath)),
        questionContent: latexReplacement(lessonJson.questions[i - 1].question, oldDirPath + lessonJson.id + "/latex/"),
        nextQuestionPath: pathTransformer(questionPathCreator(subjectContent.id, lesson.id, i + 1, newDirPath)),
        lastQuestionPath: pathTransformer(questionPathCreator(subjectContent.id, lesson.id, i - 1, newDirPath)),
    }

    const questionRender = await ejs.renderFile(
        path.join(__dirname, "../templates/questions.ejs"), questionPageParams);
    saveFile(questionHtmlPath, questionRender);
}

function lessonNumberFromId(lessonId) {
    const number = lessonId.substring(lessonId.length - 2, lessonId.length);
    return number
}
