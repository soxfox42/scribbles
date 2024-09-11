"use strict";
const errorEl = document.getElementById("error");
const runningEl = document.getElementById("running");
const currentTimerEl = document.getElementById("current");
const progressEl = document.getElementById("progress");
const remainingTimersEl = document.getElementById("remaining");
const cancelButtonEl = document.getElementById("cancel");
const stackEl = document.getElementById("stack");
const runButtonEl = document.getElementById("run");
const saveButtonEl = document.getElementById("save");
const savedStacksEl = document.getElementById("saved");
// Errors
function clearErrors() {
    errorEl.textContent = "";
    errorEl.classList.add("hide");
}
function reportError(error) {
    if (errorEl.textContent == "") {
        errorEl.innerText = error;
        errorEl.classList.remove("hide");
    }
    else {
        errorEl.innerText += `\n${error}`;
    }
}
// Time Format
const timeRe = /^(?:(\d+):)?(\d+):(\d+)$/;
function parseTime(time) {
    const match = time.match(timeRe);
    if (!match) {
        reportError(`Invalid time ${time}.`);
        return null;
    }
    const hours = parseInt(match[1], 10) || 0;
    const minutes = parseInt(match[2], 10);
    const seconds = parseInt(match[3], 10);
    return hours * 3600 + minutes * 60 + seconds;
}
function parseList(times) {
    const timeList = times.split("\n").filter(line => line != "");
    const result = [];
    for (const time of timeList) {
        const parsed = parseTime(time);
        if (parsed === null)
            return null;
        result.push(parsed);
    }
    return result;
}
function displayTime(time) {
    const seconds = time % 60;
    time = Math.floor(time / 60);
    const minutes = time % 60;
    const hours = Math.floor(time / 60);
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    else {
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
}
// Stack Running
let started;
let runningTimers;
let timerTickInterval = null;
function ring() {
    const audio = new Audio("ring.mp3");
    audio.play();
}
function cancelTimers() {
    runningEl.classList.add("hide");
    if (timerTickInterval !== null) {
        clearInterval(timerTickInterval);
        timerTickInterval = null;
    }
}
function timerTick() {
    console.log("tick");
    let elapsed = Math.ceil((Date.now() - started) / 1000);
    if (elapsed > runningTimers[0]) {
        runningTimers.shift();
        started = Date.now();
        elapsed = 0;
        ring();
        if (runningTimers.length === 0) {
            cancelTimers();
            return;
        }
    }
    currentTimerEl.textContent = displayTime(runningTimers[0] - elapsed);
    progressEl.value = 1 - (elapsed / runningTimers[0]);
    remainingTimersEl.innerText = runningTimers.slice(1).map(displayTime).join("\n");
}
cancelButtonEl.addEventListener("click", () => {
    cancelTimers();
});
runButtonEl.addEventListener("click", () => {
    clearErrors();
    const parsed = parseList(stackEl.value);
    if (parsed === null)
        return;
    started = Date.now();
    runningTimers = parsed;
    runningEl.classList.remove("hide");
    if (timerTickInterval !== null) {
        clearInterval(timerTickInterval);
    }
    timerTickInterval = setInterval(timerTick, 100);
    timerTick();
});
// Stack Saving
const saved = JSON.parse(localStorage.getItem("timer-stack-saved") || "[]");
saveButtonEl.addEventListener("click", () => {
    clearErrors();
    if (saved.includes(stackEl.value)) {
        reportError("Duplicate stack.");
        return;
    }
    if (parseList(stackEl.value) === null)
        return;
    saved.push(stackEl.value);
    updateSaved();
});
function updateSaved() {
    localStorage.setItem("timer-stack-saved", JSON.stringify(saved));
    savedStacksEl.innerHTML = "";
    saved.forEach((stack, i) => {
        const savedStackEl = document.createElement("div");
        savedStackEl.classList.add("outline", "pointer");
        savedStackEl.innerText = stack;
        savedStackEl.addEventListener("click", () => {
            stackEl.value = stack;
        });
        const stackDeleteEl = document.createElement("div");
        stackDeleteEl.classList.add("delete");
        stackDeleteEl.textContent = "Delete";
        stackDeleteEl.addEventListener("click", event => {
            event.stopPropagation();
            saved.splice(i, 1);
            updateSaved();
        });
        savedStackEl.appendChild(stackDeleteEl);
        savedStacksEl.appendChild(savedStackEl);
    });
}
updateSaved();
