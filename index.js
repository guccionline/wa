require("dotenv").config();
const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const axios = require("axios");
const qrcode = require("qrcode-terminal");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session");

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];

        if (!msg.message || msg.key.fromMe) return;

        const sender = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

        console.log("Pesan masuk:", text);

        try {
            // 🔥 request ke DeepSeek AI
            const ai = await axios.post(
                "https://api.deepseek.com/chat/completions",
                {
                    model: "deepseek-chat",
                    messages: [
                        {
                            role: "system",
                            content: "Kamu adalah asisten WhatsApp yang santai, ramah, dan singkat."
                        },
                        {
                            role: "user",
                            content: text
                        }
                    ]
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            const reply = ai.data.choices[0].message.content;

            // kirim balasan ke WhatsApp
            await sock.sendMessage(sender, { text: reply });

        } catch (err) {
            console.log("Error:", err.message);
            await sock.sendMessage(sender, { text: "Maaf, AI sedang error 😅" });
        }
    });
}

startBot();