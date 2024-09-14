const debugMode = localStorage.getItem("quote-trainer-debug") === "true";

const startButtonEl = document.getElementById("start") as HTMLButtonElement;
const deckSelectEl = document.getElementById("deck") as HTMLSelectElement;
const hideSelectEl = document.getElementById("hide") as HTMLSelectElement;

const quoteEl = document.getElementById("quote") as HTMLDivElement;
const nextButtonEl = document.getElementById("next") as HTMLButtonElement;

const decks: Record<string, string> = JSON.parse(localStorage.getItem("quote-trainer-decks") || "{}");

for (const title of Object.keys(decks)) {
    const option = document.createElement("option");
    option.value = title;
    option.textContent = title;
    deckSelectEl.appendChild(option);
}

for (let i = 0; i <= 50; i += 10) {
    const option = document.createElement("option");
    option.value = i.toString();
    option.textContent = i == 0 ? "Hide 1 word" : `Hide ${i}% of words`;
    hideSelectEl.appendChild(option);
}

if (debugMode) {
    const option = document.createElement("option");
    option.value = "100";
    option.textContent = "Hide all words";
    hideSelectEl.appendChild(option);
}

interface Text {
    text: string;
    raw: boolean;
}

function words(quote: string): Text[] {
    const result: Text[] = [];
    const re = /\w[\w'-]*\w|\w/g;
    let lastIndex = 0;
    while (true) {
        const match = re.exec(quote);
        if (!match) break;
        if (match.index > lastIndex) {
            result.push({ text: quote.slice(lastIndex, match.index), raw: true });
        }
        result.push({ text: match[0], raw: false });
        lastIndex = re.lastIndex;
    }
    if (lastIndex < quote.length) {
        result.push({ text: quote.slice(lastIndex), raw: true });
    }
    return result;
}

const minorWords = ["a", "an", "and", "or", "the"];
function filterMinorWords(quote: Text[]) {
    for (const text of quote) {
        if (text.raw) continue;
        if (minorWords.includes(text.text.toLowerCase())) {
            text.raw = true;
        }
    }
}

function shuffle(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function randomlyHideWords(quote: Text[]) {
    const percentage = parseInt(hideSelectEl.value);
    const wordIndices = quote.map((text, index) => ({ text, index })).filter(({ text }) => !text.raw).map(({ index }) => index);
    shuffle(wordIndices);
    const keepCount = Math.min(wordIndices.length - 1, Math.floor(wordIndices.length * (1 - percentage / 100)));
    for (const i of wordIndices.slice(0, keepCount)) {
        quote[i].raw = true;
    }
}

let quotes: string[];
let fields: { el: HTMLInputElement, correct: string }[];
let showingResult = true;

function showQuote(quote: string) {
    fields = [];

    const split = words(quote);
    filterMinorWords(split);
    randomlyHideWords(split);

    quoteEl.textContent = "";

    let i = 0;
    for (const { text, raw } of split) {
        if (raw) {
            const el = document.createTextNode(text);
            quoteEl.appendChild(el);
        } else {
            const el = document.createElement("input");
            el.type = "text";
            el.size = text.length;

            if (hideSelectEl.value === "100") {
                el.placeholder = text;
            }

            el.classList.add("word");

            const iLocal = i;
            el.addEventListener("keypress", event => {
                if (event.key === " ") {
                    event.preventDefault();
                    fields[(iLocal + 1) % fields.length].el.focus();
                }
            });

            quoteEl.appendChild(el);
            fields.push({ el, correct: text });
            i++;
        }
    }
}

function advance() {
    if (showingResult) {
        const quote = quotes.shift();
        if (quote === undefined) {
            quoteEl.classList.add("hide");
            nextButtonEl.classList.add("hide");
            return;
        }
        showQuote(quote);
    } else {
        for (const { el, correct } of fields) {
            if (el.value === "") {
                return;
            }
            el.disabled = true;
            if (el.value !== correct) {
                el.classList.add("incorrect");
            } else {
                el.classList.add("correct");
            }
            el.value = correct;
        }
    }
    showingResult = !showingResult;
}

document.addEventListener("keypress", event => {
    if (event.key === "Enter") {
        advance();
    }
});

startButtonEl.addEventListener("click", () => {
    if (deckSelectEl.value === "") return;

    quoteEl.classList.remove("hide");
    nextButtonEl.classList.remove("hide");

    quotes = decks[deckSelectEl.value].split("\n");
    showingResult = true;
    shuffle(quotes);
    advance();
});

nextButtonEl.addEventListener("click", () => {
    advance();
});