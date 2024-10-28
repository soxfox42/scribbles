const mainEl = document.querySelector("main") as HTMLButtonElement;
const newButtonEl = document.getElementById("new") as HTMLButtonElement;
const saveButtonEl = document.getElementById("save") as HTMLButtonElement;

const errorEl = document.getElementById("error") as HTMLDivElement;

function clearErrors() {
    errorEl.textContent = "";
    errorEl.classList.add("hide");
}

function reportError(error: string) {
    if (errorEl.textContent == "") {
        errorEl.innerText = error;
        errorEl.classList.remove("hide");
    } else {
        errorEl.innerText += `\n${error}`;
    }
}

function saveWords(): boolean {
    const words: Record<string, string> = {};
    const allAlts: string[] = [];

    clearErrors();
    for (const el of mainEl.children) {
        const word = (el.querySelector(".word") as HTMLInputElement).value.trim().toLowerCase();
        const alts = (el.querySelector(".alts") as HTMLTextAreaElement).value;
        const altsList = alts.split("\n").map(alt => alt.trim().toLowerCase()).filter(alt => alt != "");

        if (word.match(/^\s*$/)) {
            reportError("Empty word.");
            return false;
        }

        if (altsList.length == 0) {
            reportError(`Word without misspellings: ${word}.`);
            return false;
        }

        if (words.hasOwnProperty(word)) {
            reportError(`Duplicate word "${word}".`);
            return false;
        }

        for (const alt of altsList) {
            if (word == alt) {
                reportError(`"${word}" is misspelled as itself.`);
                return false;
            }
            if (allAlts.includes(alt)) {
                reportError(`Duplicate misspelling "${alt}".`);
                return false;
            }
            allAlts.push(alt);
        }

        words[word] = altsList.join("\n");
    }

    localStorage.setItem("lern-2-spel-words", JSON.stringify(words));

    return true;
}

function createWord(title: string = "", quotes: string = "") {
    const newEl = document.createElement("div");
    newEl.classList.add("flex", "align-top", "gap");
    newEl.innerHTML = `
        <div class="flex vertical stretch grow">
            <input type="text" class="word" placeholder="Word">
            <button class="delete" tabindex="-1">Delete</button>
        </div>
        <textarea
            class="grow alts" rows="5"
            placeholder="Misspellings, one line each" spellcheck="false"
            style="width: 400px"
        ></textarea>
    `;
    (newEl.querySelector(".word") as HTMLInputElement).value = title;
    (newEl.querySelector(".alts") as HTMLTextAreaElement).value = quotes;
    newEl.querySelector(".delete")!!.addEventListener("click", () => {
        if (!confirm("Delete this word?")) return;
        newEl.remove();
    });
    mainEl.appendChild(newEl);
}

newButtonEl.addEventListener("click", () => {
    createWord();
});

saveButtonEl.addEventListener("click", () => {
    if (saveWords()) {
        location.href = "index.html";
    }
});

const words: Record<string, string> = JSON.parse(localStorage.getItem("lern-2-spel-words") || "{}");
console.log(words);

for (const [word, alts] of Object.entries(words)) {
    createWord(word, alts);
}
