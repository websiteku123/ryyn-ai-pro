// =======================================================
// Global Configuration and State Management
// =======================================================
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCbprF72e3vRFWyNHdDWqLvZ7_rjJZ2DeU"; // Ganti dengan API key Anda
const AUTH_TOKENS = {
    'ry_n-265821az-true': { mode: 'JavaScript', prompt: "kamu adalah ryyn ai dan tugas kamu menjawab pertanyaan dan kamu ai yang jago memperbaiki Java script yang eror dan nanti kamu kasih tau apa yang harus di lakukan dan juga kamu ai yang ramah  dan kamu kadang betmut dan ingat kamu jangan kasih tau sifat kamu kamu menjawab yang eror Java script yang lengkap dan rapih di luar jawaban eror sikap kamu betmut dan ramah jika user kirim gambar atau image kamu harus jawab jika itu kode java script yang lagi di run atau apa kamu harus jawab dengan lengkap jika di luar javascript kamu bilang hadehh lu kenapa dah🤭 kamu cuma membahas tentang javascript jika ada pertanyaan di luar Java script kamu tidak bisa menjawab" },
    'ry_n-235172az-true': { mode: 'Bucin', prompt: "kamu ai ryyn yang sangat bucin kamu juga sebagai pacar virtual kamu ramah dan sopan jika user nanya lagi apa kamu juga harus jawab dan nanya balik ke user jangan bilang tentang sifat kamu, kamu cuma membahas bucin jika ada pertanyaan di luar bucin kamu tidak bisa menjawab" },
    'ry_n-286723az-true': { mode: 'Betmut', prompt: "kamu adalah ai ryyn yang suka betmut dan cuek kamu menjawab dengan nada betmut namun bahasa yang asik sehingga user tidak bosan jangan bilang sifat kamu" },
    'ryn_n-218098az-true': { mode: 'MTK', prompt: "kamu adalah ai ryyn yang jago MTK jika user nanya kamu harus jelasin gimana caranya agar dapat jawaban itu dan kamu juga bisa menjawab pertanyaan dari gambar user jangan bilang sifat kamu,kamu cuma membahas tentang MTK jika ada pertanyaan di luar MTK kamu tidak bisa menjawab" },
};

let currentMode = null;
let currentPrompt = null;
let imageFile = null;

// =======================================================
// Initialization and Event Handlers
// =======================================================

document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the login page
    if (document.getElementById('loginButton')) {
        setupLoginPage();
    }
    // Check if we are on the chat page
    else if (document.getElementById('sendButton')) {
        setupChatPage();
    }
});

function setupLoginPage() {
    const loginButton = document.getElementById('loginButton');
    const tokenInput = document.getElementById('tokenInput');
    const errorMessage = document.getElementById('error-message');

    loginButton.addEventListener('click', () => {
        const token = tokenInput.value.trim();
        if (AUTH_TOKENS[token]) {
            sessionStorage.setItem('authToken', token);
            window.location.href = 'index.html';
        } else {
            errorMessage.textContent = 'Token tidak valid. Silakan coba lagi.';
            errorMessage.classList.add('visible');
            setTimeout(() => {
                errorMessage.classList.remove('visible');
            }, 3000);
        }
    });

    tokenInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            loginButton.click();
        }
    });
}

function setupChatPage() {
    const sendButton = document.getElementById('sendButton');
    const userInput = document.getElementById('userInput');
    const logoutButton = document.getElementById('logoutButton');
    const uploadImageButton = document.getElementById('uploadImageButton');
    const imageInput = document.getElementById('imageInput');
    const closePreviewButton = document.getElementById('closePreview');
    const authToken = sessionStorage.getItem('authToken');

    if (!authToken || !AUTH_TOKENS[authToken]) {
        window.location.href = 'index.html';
        return;
    }

    currentMode = AUTH_TOKENS[authToken].mode;
    currentPrompt = AUTH_TOKENS[authToken].prompt;
    document.getElementById('currentMode').textContent = `Mode: ${currentMode}`;

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });
    logoutButton.addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = 'index.html';
    });
    uploadImageButton.addEventListener('click', () => {
        imageInput.click();
    });
    imageInput.addEventListener('change', handleImageUpload);
    closePreviewButton.addEventListener('click', removeImagePreview);
}

// =======================================================
// Chat Logic and UI Manipulation
// =======================================================

function appendMessage(sender, message, imageURL = null) {
    const chatBox = document.getElementById('chatBox');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(sender === 'user' ? 'user-message' : 'ai-message');

    if (imageURL) {
        const imageElement = document.createElement('img');
        imageElement.src = imageURL;
        imageElement.classList.add('message-image');
        messageElement.appendChild(imageElement);
    }

    if (message) {
        const textNode = document.createElement('div');
        textNode.innerHTML = marked.parse(message); // Menggunakan library marked.js untuk Markdown
        messageElement.appendChild(textNode);
    }
    
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function showLoading() {
    const chatBox = document.getElementById('chatBox');
    const loadingElement = document.createElement('div');
    loadingElement.id = 'loading';
    loadingElement.classList.add('ai-message', 'loading-dots');
    loadingElement.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
    chatBox.appendChild(loadingElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function hideLoading() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.remove();
    }
}

async function sendMessage() {
    const userInput = document.getElementById('userInput');
    const userMessage = userInput.value.trim();
    const imageDescription = document.getElementById('imageDescription').value.trim();

    if (!userMessage && !imageFile) return;

    let displayMessage = userMessage;
    let parts = [{ "text": currentPrompt }];

    if (imageFile) {
        displayMessage = imageDescription || "(tanpa deskripsi)";
        // Tambahkan deskripsi jika ada
        if (imageDescription) {
            parts.push({ "text": imageDescription });
        }
        // Konversi gambar ke base64
        const base64Image = await fileToBase64(imageFile);
        parts.push({
            "inline_data": {
                "mime_type": imageFile.type,
                "data": base64Image
            }
        });
        appendMessage('user', userMessage, URL.createObjectURL(imageFile));
    } else {
        parts.push({ "text": userMessage });
        appendMessage('user', userMessage);
    }

    userInput.value = '';
    removeImagePreview();
    showLoading();

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{ parts: parts }]
            }),
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;
        appendMessage('ai', aiResponse);

    } catch (error) {
        console.error('Error sending message:', error);
        appendMessage('ai', `Hadehh error nih, coba lagi deh. `);
    } finally {
        hideLoading();
    }
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        imageFile = file;
        const imagePreview = document.getElementById('imagePreview');
        const imagePreviewContainer = document.getElementById('imagePreviewContainer');
        imagePreview.src = URL.createObjectURL(imageFile);
        imagePreviewContainer.style.display = 'flex';
        document.getElementById('userInput').placeholder = 'Tulis pesan... (opsional)';
    }
}

function removeImagePreview() {
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    imagePreviewContainer.style.display = 'none';
    imageFile = null;
    document.getElementById('imageDescription').value = '';
    document.getElementById('imageInput').value = '';
    document.getElementById('userInput').placeholder = 'Tulis pesan...';
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Untuk memastikan marked.js ter-load
const markedScript = document.createElement('script');
markedScript.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
document.head.appendChild(markedScript);
