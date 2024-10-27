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

function saveDecks(): boolean {
    const decks: Record<string, string> = {};

    clearErrors();
    for (const el of mainEl.children) {
        const title = (el.querySelector(".title") as HTMLInputElement).value;
        const quotes = (el.querySelector(".quotes") as HTMLTextAreaElement).value;

        if (title.match(/^\s*$/)) {
            reportError("Deck missing a title.");
            return false;
        }

        if (quotes.match(/^\s*$/)) {
            reportError("Deck missing quotes.");
            return false;
        }

        if (decks.hasOwnProperty(title)) {
            reportError(`Duplicate deck name "${title}".`);
            return false;
        }

        decks[title] = quotes;
    }

    localStorage.setItem("quote-trainer-decks", JSON.stringify(decks));

    return true;
}

function createDeck(title: string = "", quotes: string = "") {
    const newEl = document.createElement("div");
    newEl.classList.add("gap");
    newEl.innerHTML = `
        <div class="flex gap">
            <label style="display: contents">
                Title:
                <input type="text" class="grow title">
            </label>
            <button class="delete" tabindex="-1">Delete</button>
        </div>
        <label>
            Quotes, one per line:
            <textarea class="quotes" rows="10"></textarea>
        </label>
    `;
    (newEl.querySelector(".title") as HTMLInputElement).value = title;
    (newEl.querySelector(".quotes") as HTMLTextAreaElement).value = quotes;
    newEl.querySelector(".delete")!!.addEventListener("click", () => {
        if (!confirm("Delete this deck?")) return;
        newEl.remove();
    });
    mainEl.appendChild(newEl);
}

newButtonEl.addEventListener("click", () => {
    createDeck();
});

saveButtonEl.addEventListener("click", () => {
    if (saveDecks()) {
        location.href = "index.html";
    }
});

const decks: Record<string, string> = JSON.parse(localStorage.getItem("quote-trainer-decks") || "{}");

for (const [title, quotes] of Object.entries(decks)) {
    createDeck(title, quotes);
}
