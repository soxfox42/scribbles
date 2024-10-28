const noWordsEl = document.getElementById("no-words") as HTMLDivElement;
const gameEl = document.getElementById("game") as HTMLDivElement;

const altEl = document.getElementById("alt") as HTMLDivElement;
const wordEl = document.getElementById("word") as HTMLInputElement;
const submitEl = document.getElementById("submit") as HTMLButtonElement;

const rawWords: Record<string, string> = JSON.parse(localStorage.getItem("lern-2-spel-words") || "{}");
const words: Record<string, string[]> = {};

let state: "guess" | "show" = "guess";
let selectedWord: string = "";

for (const key of Object.keys(rawWords)) {
    words[key] = rawWords[key].split("\n");
}

if (Object.keys(words).length != 0) {
    noWordsEl.classList.add("hide");
    gameEl.classList.remove("hide");
    nextRound();
}

function nextRound() {
    const allWords = Object.keys(words);
    const wordIndex = Math.floor(Math.random() * allWords.length);
    selectedWord = allWords[wordIndex];

    const allAlts = words[selectedWord];
    const altIndex = Math.floor(Math.random() * allAlts.length);
    const selectedAlt = allAlts[altIndex];

    altEl.textContent = selectedAlt;
}

function submit() {
    const guess = wordEl.value.trim().toLowerCase();
    if (guess === "") return;

    if (state === "guess") {
        state = "show";
        submitEl.textContent = "Next";
        wordEl.value = selectedWord;
        if (guess === selectedWord) {
            wordEl.classList.add("correct");
        } else {
            wordEl.classList.add("incorrect");
        }
        wordEl.disabled = true;
    } else {
        state = "guess";
        submitEl.textContent = "Check";
        wordEl.value = "";
        wordEl.classList.remove("correct", "incorrect");
        wordEl.disabled = false;
        wordEl.focus();
        nextRound();
    }
}

submitEl.addEventListener("click", submit);
document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        submit();
    }
});
