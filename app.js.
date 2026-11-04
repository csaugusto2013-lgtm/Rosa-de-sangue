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
  input.focus();
});

async function sendMessage() {
  const message = input.value.trim();

  if (!message || sendButton.disabled) return;

  dialogue.textContent +=
    (dialogue.textContent ? "\n\n" : "") + "Kazuki: " + message;

  input.value = "";
  sendButton.disabled = true;
  sendButton.textContent = "Aguardando...";

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          ...history,
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error("O servidor retornou uma resposta inválida.");
    }

    if (!response.ok) {
      throw new Error(
        data.details || data.error || "Falha na comunicação com a API."
      );
    }

    const answer = data.reply;

    if (typeof answer !== "string" || !answer.trim()) {
      throw new Error("A API não retornou uma resposta válida.");
    }

    history.push(
      {
        role: "user",
        content: message
      },
      {
        role: "assistant",
        content: answer
      }
    );

    dialogue.textContent += "\n\n" + answer;

  } catch (error) {
    dialogue.textContent +=
      "\n\n[Mensagem não enviada ao narrador: " +
      error.message +
      "]";

  } finally {
    sendButton.disabled = false;
    sendButton.textContent = "Enviar";
    input.focus();
  }
}

sendButton.addEventListener("click", sendMessage);

input.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js")
      .catch(error => console.error("Falha ao registrar o Service Worker:", error));
  });
}