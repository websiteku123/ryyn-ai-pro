const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=";
const API_KEY = "AIzaSyCbprF72e3vRFWyNHdDWqLvZ7_rjJZ2DeU"; // Masukkan API Key Anda di sini
const loginContainer = document.getElementById('login-container');
const chatContainer = document.getElementById('chat-container');
const tokenInput = document.getElementById('token-input');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const loginError = document.getElementById('login-error');
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const modeDisplay = document.getElementById('mode-display');
const imageUpload = document.getElementById('image-upload');
const uploadPreviewContainer = document.getElementById('upload-preview-container');
const imagePreview = document.getElementById('image-preview');
const imageCaption = document.getElementById('image-caption');
const closePreviewBtn = document.getElementById('close-preview');

let currentMode = null;
let uploadedImage = null;

const modes = {
    'ry_n-265821az-true': {
        name: 'JavaScript',
        prompt: "kamu adalah ryyn ai dan tugas kamu menjawab pertanyaan dan kamu ai yang jago memperbaiki Java script yang eror dan nanti kamu kasih tau apa yang harus di lakukan dan juga kamu ai yang ramah  dan kamu kadang betmut dan ingat kamu jangan kasih tau sifat kamu kamu menjawab yang eror Java script yang lengkap dan rapih di luar jawaban eror sikap kamu betmut dan ramah jika user kirim gambar atau image kamu harus jawab jika itu kode java script yang lagi di run atau apa kamu harus jawab dengan lengkap jika di luar javascript kamu bilang hadehh lu kenapa dah🤭 kamu cuma membahas tentang javascript jika ada pertanyaan di luar Java script kamu tidak bisa menjawab"
    },
    'ry_n-235172az-true': {
        name: 'Bucin',
        prompt: "kamu ai ryyn yang sangat bucin kamu juga sebagai pacar virtual kamu ramah dan sopan jika user nanya lagi apa kamu juga harus jawab dan jangan bilang tentang sifat kamu, kamu cuma membahas bucin jika ada pertanyaan di luar bucin kamu tidak bisa menjawab"
    },
    'ry_n-286723az-true': {
        name: 'Betmut',
        prompt: "kamu adalah ai ryyn yang suka betmut dan cuek kamu menjawab dengan nada betmut namun bahasa yang asik sehingga user tidak bosan jangan bilang sifat kamu"
    },
    'ryn_n-218098az-true': {
        name: 'MTK',
        prompt: "kamu adalah ai ryyn yang jago MTK jika user nanya kamu harus jelasin gimana caranya agar dapat jawaban itu dan kamu juga bisa menjawab pertanyaan dari gambar user jangan bilang sifat kamu,kamu cuma membahas tentang MTK jika ada pertanyaan di luar MTK kamu tidak bisa menjawab"
    }
};

loginBtn.addEventListener('click', () => {
    const token = tokenInput.value.trim();
    if (modes[token]) {
        currentMode = modes[token];
        modeDisplay.textContent = currentMode.name;
        loginContainer.classList.add('hidden');
        chatContainer.classList.remove('hidden');
        localStorage.setItem('ryyn_token', token);
        addMessage(`Selamat datang di mode **${currentMode.name}**!`, 'system');
    } else {
        loginError.textContent = 'Token tidak valid. Silakan coba lagi.';
        loginError.classList.add('show');
    }
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('ryyn_token');
    currentMode = null;
    loginContainer.classList.remove('hidden');
    chatContainer.classList.add('hidden');
    chatBox.innerHTML = '<div class="message system-message"><div class="message-content">Halo! Selamat datang di Ryyn AI. Silakan tanyakan apa saja.</div></div>';
    tokenInput.value = '';
    loginError.classList.remove('show');
    imageUpload.value = null;
    uploadedImage = null;
    uploadPreviewContainer.style.display = 'none';
});

imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            uploadedImage = e.target.result.split(',')[1];
            uploadPreviewContainer.style.display = 'flex';
        };
        reader.readAsDataURL(file);
    }
});

closePreviewBtn.addEventListener('click', () => {
    uploadedImage = null;
    imageCaption.value = '';
    imageUpload.value = null;
    uploadPreviewContainer.style.display = 'none';
});

userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

sendBtn.addEventListener('click', sendMessage);

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message && !uploadedImage) return;

    // Tampilkan pesan pengguna
    addMessage(message, 'user', uploadedImage);
    userInput.value = '';

    // Tampilkan efek loading
    const loadingMessage = addMessage('', 'system', null, true);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const response = await getGeminiResponse(message, uploadedImage, imageCaption.value);
        removeMessage(loadingMessage);
        addMessage(response, 'system');
    } catch (error) {
        console.error("Error fetching Gemini response:", error);
        removeMessage(loadingMessage);
        addMessage("Maaf, terjadi kesalahan. Coba lagi nanti.", 'system');
    }

    uploadedImage = null;
    imageCaption.value = '';
    imageUpload.value = null;
    uploadPreviewContainer.style.display = 'none';
    chatBox.scrollTop = chatBox.scrollHeight;
}

function addMessage(text, type, image = null, isLoading = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${type}-message`);

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');

    if (isLoading) {
        contentDiv.innerHTML = `<div class="loading-effect"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>`;
    } else {
        let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formattedText = formattedText.replace(/\n/g, '<br>');
        contentDiv.innerHTML = formattedText;
        if (image) {
            const img = document.createElement('img');
            img.src = `data:image/jpeg;base64,${image}`;
            contentDiv.prepend(img);
        }
    }
    
    messageDiv.appendChild(contentDiv);
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageDiv;
}

function removeMessage(element) {
    element.remove();
}

async function getGeminiResponse(userMessage, imageBase64, imageCaption) {
    const headers = { 'Content-Type': 'application/json' };
    const prompt = currentMode.prompt;
    
    let parts = [{ text: prompt }];

    if (userMessage) {
        parts.push({ text: `User: ${userMessage}` });
    }
    
    if (imageBase64) {
        parts.push({
            inlineData: {
                mimeType: "image/jpeg",
                data: imageBase64
            }
        });
        if (imageCaption) {
             parts.push({ text: `Penjelasan gambar: ${imageCaption}` });
        }
    }

    const payload = {
        contents: [{
            role: "user",
            parts: parts
        }],
        safetySettings: [
            {
                "category": "HARM_CATEGORY_HATE_SPEECH",
                "threshold": "BLOCK_NONE"
            },
            {
                "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "threshold": "BLOCK_NONE"
            },
            {
                "category": "HARM_CATEGORY_HARASSMENT",
                "threshold": "BLOCK_NONE"
            },
            {
                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold": "BLOCK_NONE"
            }
        ]
    };

    const response = await fetch(`${API_URL}${API_KEY}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
    } else {
        return "Tidak ada respons dari AI.";
    }
}

// Cek token saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    const storedToken = localStorage.getItem('ryyn_token');
    if (storedToken && modes[storedToken]) {
        currentMode = modes[storedToken];
        modeDisplay.textContent = currentMode.name;
        loginContainer.classList.add('hidden');
        chatContainer.classList.remove('hidden');
        addMessage(`Selamat datang kembali di mode **${currentMode.name}**!`, 'system');
    }
});
