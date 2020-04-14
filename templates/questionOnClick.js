function clickGood() {
    document.getElementById("answer").innerHTML = "Bonne réponse !";
    document.getElementById("answer").classList.remove('w3-text-red');
    const explainBlock = document.getElementById("explain");
    if (explainBlock.style.display === "block") {
        explainBlock.style.display = "none";
    };
}
function clickFalse() {
    document.getElementById("answer").innerHTML = "Mauvaise réponse !";
    document.getElementById("answer").classList.add('w3-text-red');
    const explainBlock = document.getElementById("explain");
    if (explainBlock.style.display === "none") {
        explainBlock.style.display = "block";
    };
}