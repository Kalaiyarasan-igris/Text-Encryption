const PASSPHRASE = "SECURE_AES_256_KEY";

/* ===== AES KEY ===== */
async function getKey() {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw", enc.encode(PASSPHRASE), "PBKDF2", false, ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: enc.encode("matrix_salt"),
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}

/* ===== ENCRYPT TEXT ===== */
async function encryptText() {
    const input = document.getElementById("encryptInput").value;
    if (!input) return alert("Enter text to encrypt!");

    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await getKey();

    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        enc.encode(input)
    );

    const combined = new Uint8Array([...iv, ...new Uint8Array(encrypted)]);
    const output = btoa(String.fromCharCode(...combined));

    document.getElementById("encryptOutput").value = output;

    // Optional: auto-copy
    navigator.clipboard.writeText(output);

    document.getElementById("encryptStatus").textContent = "Encrypted text copied ✔";
    setTimeout(() => document.getElementById("encryptStatus").textContent = "", 2000);
}

/* ===== DECRYPT TEXT ===== */
async function decryptText() {
    const input = document.getElementById("decryptInput").value;
    if (!input) return alert("Enter encrypted text!");

    try {
        const data = Uint8Array.from(atob(input), c => c.charCodeAt(0));
        const iv = data.slice(0, 12);
        const encrypted = data.slice(12);

        const key = await getKey();
        const decrypted = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            encrypted
        );

        const result = new TextDecoder().decode(decrypted);
        document.getElementById("decryptOutput").value = result;

        // Optional: auto-copy
        navigator.clipboard.writeText(result);

        document.getElementById("decryptStatus").textContent = "Decrypted text copied ✔";
        setTimeout(() => document.getElementById("decryptStatus").textContent = "", 2000);

    } catch {
        alert("Invalid encrypted text!");
    }
}

/* ===== COPY BUTTON FUNCTION ===== */
function copyText(elementId) {
    const text = document.getElementById(elementId).value;
    if (!text) return alert("Nothing to copy!");
    navigator.clipboard.writeText(text).then(() => alert("Copied ✔"));
}
const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const letters = "01アカサタナハマヤラワABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const fontSize = 16;
const columns = canvas.width / fontSize;
const drops = Array(Math.floor(columns)).fill(1);

function drawMatrix() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#0059ff";
    ctx.font = fontSize + "px monospace";

    for (let i = 0; i < drops.length; i++) {
        const text = letters.charAt(Math.floor(Math.random() * letters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

setInterval(drawMatrix, 35);
