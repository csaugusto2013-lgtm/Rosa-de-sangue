const startButton = document.getElementById("start-game");
const sendButton = document.getElementById("send-message");
const campaign = document.getElementById("campaign");
const game = document.getElementById("game");
const scene = document.getElementById("scene");
const dialogue = document.getElementById("dialogue");
const input = document.getElementById("player-input");

let history = [];

const openingScene = `Château de Dieppe
15 de junho de 1470

A chuva golpeia os vitrais do castelo. O mar revolto pode ser ouvido além das muralhas.

Uma lareira mantém aquecido o salão, onde documentos comerciais e relatórios políticos aguardam análise.

Hainz Hudeus, conselheiro-chefe da Normandia Bismarckiana, encontra-se diante da mesa.

— Alteza, chegaram novas notícias da Inglaterra. A situação política permanece delicada.

Próximo à janela, Richard Plantagenet observa a tempestade em silêncio.

A noite está apenas começando.`;

startButton.addEventListener("click", () => {
  campaign.hidden = true;
  game.hidden = false;
  scene.textContent = openingScene;
  dialogue.textContent = "";
});

sendButton.addEventListener("click", async () => {
  const message = input.value.trim();

  if (!message) return;

  dialogue.textContent += "\n\nKazuki: " + message;
  history.push({ role: "user", content: message });

  input.value = "";
  sendButton.disabled = true;
  sendButton.textContent = "Aguardando...";

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history })
    });

    if (!response.ok) {
      throw new Error("Falha na comunicação com a API.");
    }

    const data = await response.json();
    const answer = data.reply || "Nenhuma resposta recebida.";

    dialogue.textContent += "\n\n" + answer;
    history.push({ role: "assistant", content: answer });

  } catch (error) {
    dialogue.textContent +=
      "\n\n[Conexão com a inteligência artificial ainda não configurada.]";
  }

  sendButton.disabled = false;
  sendButton.textContent = "Enviar";
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
