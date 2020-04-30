// Ceci est un module qui permet de faire des lectures/écritures dans les fichiers.
const fs = require("fs");

exports.latexReplacement = function (content, latexFolderPath) {

    while (content.includes("$")) {
        let dollarIndices = [];
        for (var i = 0; i < content.length; i++) {
            if (content[i] == "$") {
                dollarIndices.push(i);
            }
        }

        // Indices of first dollar and of the 4th one
        const numberBeginning = dollarIndices[0]
        dollarIndices.shift()
        dollarIndices.shift()
        dollarIndices.shift()
        const numberEnd = dollarIndices[0]

        // Content to replace and new content                       
        const latexContentToReplace = content.substring(numberBeginning + 2, numberEnd - 1)
        const b64LatexContent = Buffer.from(latexContentToReplace, 'binary').toString('base64');
        const latexHtml = latexFolderPath + b64LatexContent + ".htm"


        if (fs.existsSync(latexHtml) && !b64LatexContent.includes("/")) {
            latexContentNew = fs.readFileSync(latexHtml);
            // Replacement
            content = content.replace(
                content.substring(numberBeginning, numberEnd + 1),
                latexContentNew)
        } else {
            console.log("missing file", latexHtml)
            content = content.replace(
                content.substring(numberBeginning, numberEnd + 1),
                ".....")
        }

    }
    return content
}

exports.pathTransformer = function (originalPath) {
    accessPath = originalPath.split(' ').join('%20');
    return accessPath
}

exports.subjectPathCreator = function (subjectId, level, newDirPath) {
    const pathSubject =
        newDirPath
        + "/"
        + subjectId
        + "/"
        + subjectId
        + level
        + ".html";

    return pathSubject
}

exports.subjectLevelPathCreator = function (subjectId, newDirPath) {
    let path0 = newDirPath
        + "/"
        + subjectId
        + "/"
        + subjectId
        + "0.html";
    path0 = path0.split(' ').join('%20');

    let path3 = newDirPath
        + "/"
        + subjectId
        + "/"
        + subjectId
        + "3.html";
    path3 = path3.split(' ').join('%20');

    let path4 = newDirPath
        + "/"
        + subjectId
        + "/"
        + subjectId
        + "4.html";
    path4 = path4.split(' ').join('%20');

    let path5 = newDirPath
        + "/"
        + subjectId
        + "/"
        + subjectId
        + "5.html";
    path5 = path5.split(' ').join('%20');

    return [path0, path3, path4, path5]
}

exports.questionPathCreator = function (subjectId, lessonId, questionNumber, newDirPath) {
    const newPath = newDirPath
        + "/"
        + subjectId
        + "/"
        + lessonNumberFromId(lessonId)
        + "/question"
        + questionNumber
        + ".html";
    return newPath
}

exports.lessonPathCreator = function (subjectId, lessonId, pageNumber, newDirPath) {
    const newPath = newDirPath
        + "/"
        + subjectId
        + "/"
        + lessonId.split('/')[1]
        + "/"
        + lessonNumberFromId(lessonId)
        + "_"
        + pageNumber
        + ".html";
    return newPath
}

function lessonNumberFromId(lessonId) {
    const number = lessonId.substring(lessonId.length - 2, lessonId.length);
    return number
}