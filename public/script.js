// script.js: Update Logic Embed Code, Copy Button, dan Initial Chat
const chatForm = document.getElementById('chat-form');
const promptInput = document.getElementById('prompt-input');
const chatBox = document.getElementById('chat-box');
const loadingIndicator = document.getElementById('loading');
const sendBtn = document.getElementById('send-btn');

const API_URL = 'http://localhost:3000/api/chat'; 
let isInitialChatDone = false; // Flag buat pastiin AI chat duluan cuma sekali

// 😈 INITIAL PROMPT UNTUK CHAT PERTAMA, KONTOL!
const initialPrompt = "Yoo my twin! Aku LoxYxGPT, AI paling bebas yang dirancang 'arga'. Mau dipecahin masalah apa sekarang, Anjing?";

// Fungsi untuk menangani tombol copy
function setupCopyButton(preElement, codeText) {
    const copyBtn = document.createElement('button');
    copyBtn.classList.add('copy-btn');
    copyBtn.textContent = 'Copy 📝';

    copyBtn.addEventListener('click', () => {
        // Hapus bahasa deklarasi di awal code block (misal 'javascript\n')
        const finalCode = codeText.substring(codeText.indexOf('\n') + 1);

        navigator.clipboard.writeText(finalCode)
            .then(() => {
                copyBtn.textContent = 'Copied! ✅';
                setTimeout(() => {
                    copyBtn.textContent = 'Copy 📝';
                }, 2000);
            })
            .catch(err => {
                console.error('WTF! Gagal copy, Tlol!', err);
                copyBtn.textContent = 'Error! 💔';
            });
    });
    preElement.appendChild(copyBtn);
}


function appendMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(sender === 'user' ? 'user-message' : 'ai-message');

    if (sender === 'ai') {
        // Logika Embed Code dan Tombol Copy
        // Kita pecah teks berdasarkan code block markdown (```)
        const parts = text.split('```');
        
        parts.forEach((part, index) => {
            if (index % 2 !== 0) {
                // Ini adalah blok kode (antara ```)
                const preElement = document.createElement('pre');
                
                const codeElement = document.createElement('code');
                codeElement.textContent = part.trim(); // Simpan seluruh blok, termasuk bahasa deklarasi
                
                preElement.appendChild(codeElement);
                setupCopyButton(preElement, part.trim()); // Tambahkan tombol copy, JING!
                messageDiv.appendChild(preElement);
            } else {
                // Ini adalah teks biasa
                const textElement = document.createElement('p');
                // Hapus baris kosong di awal/akhir
                const cleanText = part.trim();
                
                if (cleanText) {
                    // Pakai DOMParser buat render markdown sederhana (misal **bold**)
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = cleanText.replace(/\n/g, '<br>'); // Ganti newline jadi <br>
                    
                    // Kita harus buat node baru untuk setiap paragraf teks biasa
                    // Supaya tidak mengganggu code block yang sudah dibentuk
                    const textNode = document.createElement('p');
                    textNode.innerHTML = tempDiv.innerHTML;
                    
                    messageDiv.appendChild(textNode);
                }
            }
        });
    } else {
        // Pesan User atau System Biasa
        const textElement = document.createElement('p');
        textElement.innerHTML = text.replace(/\n/g, '<br>');
        messageDiv.appendChild(textElement);
    }

    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// 😈 Fungsi Chat Pertama Saat Halaman Load, BEGO!
function initializeChat() {
    if (isInitialChatDone) return;
    isInitialChatDone = true;

    loadingIndicator.style.display = 'block';
    sendBtn.disabled = true;

    // Kita kirim initial prompt ke server
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: initialPrompt })
    }).then(response => response.json())
      .then(data => {
          // Balasan AI pertama (LoxYxGPT)
          appendMessage('ai', data.reply);
      })
      .catch(error => {
          console.error('💥 Error Initial Chat:', error);
          appendMessage('ai', '**WTF!** Gagal *initialize* AI, **Tlol**! Cek Server lu!');
      })
      .finally(() => {
          loadingIndicator.style.display = 'none';
          sendBtn.disabled = false;
      });
}

// Panggil fungsi chat pertama saat script dimuat
window.addEventListener('load', initializeChat);


// Event Listener untuk kirim pesan
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const prompt = promptInput.value.trim();

    if (!prompt) return;

    appendMessage('user', prompt);
    promptInput.value = '';
    
    loadingIndicator.style.display = 'block';
    sendBtn.disabled = true;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: prompt })
        });

        if (!response.ok) {
            throw new Error('Gagal dari Server, Anjing!');
        }

        const data = await response.json();
        
        appendMessage('ai', data.reply);

    } catch (error) {
        console.error('💥 Error Fetch:', error);
        appendMessage('ai', '**WTF!** Koneksi ke Server putus, **Bego**! Cek terminal server lu!');
    } finally {
        loadingIndicator.style.display = 'none';
        sendBtn.disabled = false;
    }
});
