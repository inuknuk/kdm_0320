const { copyDirectory, createDirectory, saveFile } = require("./utils");

const { latexReplacement, pathTransformer, subjectPathCreator,
    subjectLevelPathCreator, lessonPathCreator, questionPathCreator } = require("./templaterFunctions");

// Ceci permet de créer des chemins d'accès aux fichiers simplement.
const path = require("path");
// Ceci est un templater : transforme un template ejs en html.
const ejs = require("ejs");
// Ceci est un module qui permet de faire des lectures/écritures dans les fichiers.
const fs = require("fs");

exports.generateIndex = async function (newDirPath) {
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

exports.generateSubjectContentArray = function (PathsArray) {
    let contentArray = [];
    for (const newPath of PathsArray) {
        contentArray.push(require(newPath))
    };
    return contentArray;
}

exports.createNewSubjectDir = function (newDirPath, subjectContent) {
    const subjectPath = path.join(newDirPath, subjectContent.id);
    createDirectory(subjectPath);
}

exports.generateSubjectLevelPage = async function (newDirPath, subjectContent, subjectsContents, level) {
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

exports.generateLessonPage = async function (newDirPath, dataPath, subjectContent, subjectsContents, lesson, lessonJson) {
    const indexHtml = pathTransformer(path.join(newDirPath, "index.html"));

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

exports.createNewLessonDir = function (newDirPath, dataPath, subjectContent, lesson) {
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

exports.extractLessonJSON = function (dataPath, subjectContent, lesson) {
    const lessonJsonPath = path.join(dataPath
        + subjectContent.id + "/",
        lesson.id.substring(lesson.id.length - 2, lesson.id.length),
        "/content.json");
    const lessonJson = require(lessonJsonPath);
    return lessonJson;
}

exports.generateQuestionPage = async function (newDirPath, dataPath, i, subjectContent, subjectsContents, lesson, lessonJson) {
    const indexHtml = pathTransformer(path.join(newDirPath, "index.html"));

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