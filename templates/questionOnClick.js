function clickGood() {
    document.getElementById("answer").innerHTML = "Bonne réponse !";
    const explainBlock = document.getElementById("explain");
    if (explainBlock.style.display === "block") {
        explainBlock.style.display = "none";
    };
}
function clickFalse() {
    document.getElementById("answer").innerHTML = "Mauvaise réponse !";
    const explainBlock = document.getElementById("explain");
    if (explainBlock.style.display === "none") {
        explainBlock.style.display = "block";
    };
}