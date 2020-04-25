const { copyDirectory, createDirectory, saveFile } = require("./utils");
const { latexReplacement } = require("./templaterFunctions");
// Ceci permet de créer des chemins d'accès aux fichiers simplement.
const path = require("path");
// Ceci est un templater : transforme un template ejs en html.
const ejs = require("ejs");
// Ceci est un module qui permet de faire des lectures/écritures dans les fichiers.
const fs = require("fs");

exports.generateIndex = async function (newDirPath) {
    const indexHtml = path.join(newDirPath, "index.html");
    createDirectory(newDirPath);

    const indexRender = await ejs.renderFile(
        path.join(__dirname, "../templates/index.ejs"),
        {
            rootPath: newDirPath,
            indexPath: indexHtml,
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

exports.generateLevelPage = async function (newDirPath, subjectContent, subjectsContents, level) {
    const indexHtml = path.join(newDirPath, "index.html");
    const subjectPath = path.join(newDirPath, subjectContent.id);
    const levelPathHtml = path.join(subjectPath, subjectContent.id + level + ".html");

    const levelPageParams = {
        subjectContent: subjectContent,
        allSubjectsContent: subjectsContents,
        currentLesson: undefined,
        rootPath: newDirPath,
        indexPath: indexHtml,
        currentLevel: level,
    }

    const levelRender = await ejs.renderFile(
        path.join(__dirname, "../templates/subjectPage.ejs"), levelPageParams)

    saveFile(levelPathHtml, levelRender);
}

exports.generateLessonPage = async function (newDirPath, dataPath, subjectContent, subjectsContents, lesson, lessonJson) {
    const indexHtml = path.join(newDirPath, "index.html");

    const subjectPath = path.join(newDirPath, subjectContent.id);
    const newLessonPath = path.join(subjectPath, lesson.id.split('/')[1]);
    const lessonid = lesson.id.substring(lesson.id.length - 2, lesson.id.length);
    const newLessonHtmlPath = path.join(newLessonPath, lessonid + ".html");

    const lessonPageParams = {
        subjectContent: subjectContent,
        allSubjectsContent: subjectsContents,
        currentLesson: lesson,
        rootPath: newDirPath,
        indexPath: indexHtml,
        dataPath: dataPath,
        lessonContent: lessonJson,
        latexReplacement: latexReplacement,
    }
    const lessonRender = await ejs.renderFile(
        path.join(__dirname, "../templates/lessonPage.ejs"), lessonPageParams);

    saveFile(newLessonHtmlPath, lessonRender);
}

exports.createNewDir = function (newDirPath, dataPath, subjectContent, lesson) {
    const subjectPath = path.join(newDirPath, subjectContent.id);
    const newLessonPath = path.join(subjectPath, lesson.id.split('/')[1]);

    const oldLessonPath = path.join(dataPath
        + subjectContent.id + "/",
        lesson.id.substring(lesson.id.length - 2, lesson.id.length),
        "/");

    // On définit les chemin des dossier img et latex pour les copier
    const oldImgPath = path.join(oldLessonPath, "img");
    const newImgPath = path.join(newLessonPath, "/img");
    // const oldLatexPath = path.join(oldLessonPath, "latex");
    // const newLatexPath = path.join(newLessonPath, "/latex");

    createDirectory(newLessonPath)
    copyDirectory(oldImgPath, newImgPath);
    // copyDirectory(oldLatexPath, newLatexPath);
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
    const indexHtml = path.join(newDirPath, "index.html");

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
            dataPath: dataPath,
            lessonContent: lessonJson,
            questionJson: lessonJson.questions[i - 1],
            counter: i,
            latexReplacement: latexReplacement,
        }
    );

    saveFile(questionHtmlPath, questionRender);


}