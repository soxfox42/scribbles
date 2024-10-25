declare global {
    const QRious: any;
}

const contentEl = document.getElementById("content") as HTMLInputElement;
const qrCode = new QRious({
    element: document.getElementById("qr-code"),
    size: 300,
    backgroundAlpha: 0,
    value: contentEl.value || "soxfox.me",
});

contentEl.addEventListener("input", () => {
    qrCode.value = contentEl.value;
});