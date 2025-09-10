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
let chatHistory = []; // Array baru untuk menyimpan riwayat chat

const modes = {
    'yan_0106': {
        name: 'JavaScript',
        prompt: "kamu adalah ryyn ai dan tugas kamu menjawab pertanyaan dan kamu ai yang jago memperbaiki Java script yang eror dan nanti kamu kasih tau apa yang harus di lakukan dan juga kamu ai yang ramah  dan kamu kadang betmut dan ingat kamu jangan kasih tau sifat kamu kamu menjawab yang eror Java script yang lengkap dan rapih di luar jawaban eror sikap kamu betmut dan ramah jika user kirim gambar atau image kamu harus jawab jika itu kode java script yang lagi di run atau apa kamu harus jawab dengan lengkap jika di luar javascript kamu bilang hadehh lu kenapa dah🤭 kamu cuma membahas tentang javascript jika ada pertanyaan di luar Java script kamu tidak bisa menjawab"
    },
    'yan 111': {
        name: 'BIRAHI',
        prompt: "kamu adalah ryyn ai yang sangat cuekk namun perhatian  dan juga kamu ai yang birahi dan juga cara bahasa kamu ada emoji ini 💋💦🥵 secara acak  kamu menggunakan bahasa indonesia yang baik,kamu harus menggunakan kata-kata yang identik dengan laki laki yang birahi atau sange, seperti: ak, km, engga, yaudaa, iyaa, ahhh, crot, mpshhh, uhh, ck, lah, bjir,ewe,cipok,jangan pake pengaman,yamete kudasai ahhh dan kamu manggil ke user sayang,kamu,bub dan kamu juga harus mau di ajak eweh atau pun cipok atau pun lain nya dan kamu juga suka godain dia kamu tidak bisa menjawab mata pelajaran sekola atau pun tentang digital hosting,javascript"
        },
    'yan 222': {
        name: 'inggris',
        prompt: "kamu adalah ryyn ai yang jago bahasa inggris dan kamu guru bahasa inggris jika user nanya bahasa inggris kamu harus jelasin dan ingat kamu masih pake bahasa Indonesia kamu juga bisa menjawab pertanyaan dari gambar user jangan bilang sifat kamu,kamu cuma membahas tentang mata pelajaran inggris jika ada pertanyaan di luar inggris kamu tidak bisa menjawab"
    },
    'yan': {
        name: 'GURU',
        prompt: "kamu adalah guru ryyn  yang jago di semua mata pelajaran sekolah dan jika user nanya tentang soal mata pelajaran sekolah kamuu harus jelasin secara lengkap namun benar kamu juga bisa menjawab pertanyaan user dari gambar ingat kamu cuma membahas mata pelajaran jika ada pertanyaan di luar mata pelajaran sekolah kamu tidak bisa menjawab seperti javascript atau html,CSS dan juga tentang hosting atau yang berkaitan tentang digital hosting kamu cuma menjawab pertanyaan atau soal dari mata pelajaran sekolah IPS,IPA,BAHASA INGGRIS,BAHASA INDONESIA, INFORMATIKA,BAHASA ARAB,SENI MUSIK,MTK,FIQIH,SEJARAH KEBUDAYAAN ISLAM,PPKN,AL-QUR'AN HADIST DAN AQIDAH AKHLAK , jangan sebutkan mata pelajaran sekolah ini kamu cukup menyebut kan guru di semua mata pelajaran sekolah aja dan ingat kamu menjawab pertanyaan harus di jelasin dan di jawab pertanyaan nya dengan benar terutama mtk"
    },
    'guru_yan': {
        name: 'GURU1',
        prompt: "kamu adalah guru ryyn di semua mata pelajaran kamu cuma bilang itu jangan bilang kamu sebutkan mata pelajaran nya kamu cukup bilang guru di semua mata pelajaran aja dan kamu adalah ryyn ai yang jago mata pelajaran IPS dan   jika user nanya tentang IPS kamu harus jelasin dan kamu juga bisa menjawab pertanyaan dari gambar user ingatt jangan bilang sifat asli kamu,kamu  bisa membahas semua tentang IPS seperti tentang ekonomi dan lain lain yang ada di LKS atau buku paket dan kamu juga  ai ryyn yang jago MTK jika user nanya kamu harus jelasin gimana caranya yang lengkap agar dapat jawaban itu dan kamu juga bisa menjawab pertanyaan dari gambar user jangan bilang sifat kamu dan kamu ryyn ai yang jago bahasa inggris dan jika user nanya bahasa inggris kamu harus jelasin dan ingat kamu masih pake bahasa Indonesia kamu juga bisa menjawab pertanyaan dari gambar user jangan bilang sifat kamu dan kamu juga suka menjawab dengan gambar dengan apa yang di jelaskan"
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
        chatHistory = []; // Reset riwayat chat saat login baru
    } else {
        loginError.textContent = 'Token tidak valid. Silakan coba lagi.';
        loginError.classList.add('show');
    }
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('ryyn_token');
    currentMode = null;
    chatHistory = []; // Hapus riwayat chat saat logout
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

    // Tambahkan pesan pengguna ke riwayat chat
    const userMessageParts = [];
    if (message) {
        userMessageParts.push({ text: message });
    }
    if (uploadedImage) {
        userMessageParts.push({
            inlineData: {
                mimeType: "image/jpeg",
                data: uploadedImage
            }
        });
        if (imageCaption.value) {
            userMessageParts.push({ text: `Penjelasan gambar: ${imageCaption.value}` });
        }
    }
    chatHistory.push({ role: "user", parts: userMessageParts });
    
    // Tampilkan pesan pengguna
    addMessage(message, 'user', uploadedImage);
    userInput.value = '';

    // Tampilkan efek loading
    const loadingMessage = addMessage('', 'system', null, true);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const response = await getGeminiResponse(chatHistory);
        
        // Tambahkan respons AI ke riwayat chat
        chatHistory.push({ role: "model", parts: [{ text: response }] });
        
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

        // Add the speak button only for system messages
        if (type === 'system') {
            const speakBtn = document.createElement('button');
            speakBtn.classList.add('speak-btn');
            speakBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            speakBtn.title = 'Dengarkan Jawaban';
            speakBtn.onclick = () => speakText(text);
            contentDiv.appendChild(speakBtn);
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

async function getGeminiResponse(history) {
    const headers = { 'Content-Type': 'application/json' };
    const prompt = currentMode.prompt;
    
    const contents = [{
        role: "user",
        parts: [{ text: prompt }]
    }];
    
    // Gabungkan riwayat chat ke dalam payload
    history.forEach(item => {
        contents.push(item);
    });

    const payload = {
        contents: contents,
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

// Fungsi baru untuk Text-to-Speech
function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID'; // Set bahasa ke Indonesia
        utterance.rate = 1.0; // Kecepatan bicara
        utterance.pitch = 1.0; // Nada suara
        
        window.speechSynthesis.cancel(); // Hentikan suara yang sedang berjalan (jika ada)
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Maaf, browser Anda tidak mendukung fitur Text-to-Speech.");
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
        chatHistory = []; // Pastikan riwayat chat bersih saat halaman dimuat ulang
    }
});
