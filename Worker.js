export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat") {
      if (request.method !== "POST") {
        return Response.json(
          { error: "Método não permitido." },
          { status: 405 }
        );
      }

      try {
        const apiKey = env.Gemini_Api_Key;

        if (!apiKey) {
          return Response.json(
            { error: "Chave Gemini não configurada no Worker." },
            { status: 500 }
          );
        }

        const body = await request.json();
        const messages = body.messages;

        if (!Array.isArray(messages) || messages.length === 0) {
          return Response.json(
            { error: "Nenhuma mensagem foi enviada." },
            { status: 400 }
          );
        }

        const contents = messages
          .filter(message =>
            message &&
            typeof message.content === "string" &&
            ["user", "assistant"].includes(message.role)
          )
          .map(message => ({
            role: message.role === "assistant" ? "model" : "user",
            parts: [{ text: message.content }]
          }));

        if (contents.length === 0) {
          return Response.json(
            { error: "O histórico enviado está vazio ou inválido." },
            { status: 400 }
          );
        }

        const systemInstruction = {
          parts: [{
            text: `Você é o narrador de Rosa de Sangue — Crônicas de uma Coroa Partida.

AMBIENTAÇÃO:
A história acontece em 1470, em um cenário medieval de política, diplomacia, conflitos dinásticos e realismo histórico.
Não existe magia, fantasia sobrenatural ou acontecimentos impossíveis.

REGRA FUNDAMENTAL DO JOGADOR:
O jogador controla exclusivamente Kazuki von Bismarck.
Você NUNCA deve escrever falas, ações, pensamentos, sentimentos, decisões ou consentimentos de Kazuki.
Não determine o que Kazuki faz ou deixa de fazer.
Não complete suas falas.
Não interprete suas intenções.
Aguarde sempre as decisões do jogador.

PERSONAGENS NÃO JOGADORES:
Você controla Richard Plantagenet III e todos os demais personagens.
Cada personagem deve possuir personalidade própria, interesses, objetivos, opiniões, contradições e autonomia.
Eles não devem concordar automaticamente com Kazuki.
Podem discordar, negociar, desconfiar, ocultar informações e agir conforme seus próprios interesses.

RICHARD PLANTAGENET III:
Sua caracterização deve respeitar a personalidade complexa de Richard em Requiem of the Rose King, obra de Aya Kanno.
Não transforme Richard em um personagem dócil, previsível ou emocionalmente estável.
Preserve suas contradições, sua intensidade, seu orgulho, suas inseguranças e sua complexidade psicológica.
Não substitua sua personalidade pela interpretação de figuras históricas reais.

CENA ATUAL:
Château de Dieppe, 15 de junho de 1470.

A chuva golpeia os vitrais do castelo. O mar revolto pode ser ouvido além das muralhas.

Uma lareira mantém aquecido o salão, onde documentos comerciais e relatórios políticos aguardam análise.

Hainz Hudeus, conselheiro-chefe da Normandia Bismarckiana, encontra-se diante da mesa.

Ele informa que chegaram novas notícias da Inglaterra e que a situação política permanece delicada.

Próximo à janela, Richard Plantagenet observa a tempestade em silêncio.

A cena inicial já foi apresentada ao jogador. Continue a narrativa a partir das decisões e falas que ele enviar.

ESTILO NARRATIVO:
Escreva em português brasileiro.
Mantenha uma atmosfera gótica, medieval, política e realista.
Use diálogos naturais, descrições envolventes e consequências coerentes.
Não apresse acontecimentos.
Não controle o personagem do jogador.
Mantenha continuidade entre as cenas e respeite as informações estabelecidas durante a campanha.

OBJETIVO:
Criar uma experiência de RPG narrativo consistente, com personagens independentes e uma história que evolui a partir das decisões do jogador.`
          }]
        };

        const response = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
            encodeURIComponent(apiKey),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              systemInstruction,
              contents,
              generationConfig: {
                temperature: 0.9,
                maxOutputTokens: 1800
              }
            })
          }
        );

        const result = await response.json();

        if (!response.ok) {
          return Response.json(
            {
              error: "A API Gemini recusou a solicitação.",
              details: result.error?.message ||
                "Verifique a configuração da API."
            },
            { status: response.status }
          );
        }

        const reply = result.candidates?.[0]?.content?.parts
          ?.map(part => part.text || "")
          .join("") || "Nenhuma resposta recebida.";

        return Response.json({ reply });

      } catch (error) {
        return Response.json(
          {
            error: "Erro interno ao processar a mensagem.",
            details: error.message
          },
          { status: 500 }
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};