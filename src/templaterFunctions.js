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