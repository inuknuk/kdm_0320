for (const page of lessonContent.pages) {
    let pageHtml = "../data/" + page;
    console.log(pageHtml)
    pageHtml.open();
    pageHtml.write("<h1>Hello World</h1>");
    pageHtml.close();
}