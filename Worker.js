
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
        const messages = body.messages || [];

        if (!Array.isArray(messages) || messages.length === 0) {
          return Response.json(
            { error: "Nenhuma mensagem foi enviada." },
            { status: 400 }
          );
        }

        const contents = messages.map(message => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: String(message.content || "") }]
        }));

        const systemInstruction = {
          parts: [{
            text: `Você é o narrador de Rosa de Sangue — Crônicas de uma Coroa Partida.

A ambientação é medieval, política e realista, no ano de 1470. Não existe magia ou sobrenatural.

O jogador controla exclusivamente Kazuki von Bismarck. Nunca escreva falas, ações, pensamentos, sentimentos, decisões ou consentimentos de Kazuki.

Você controla Richard Plantagenet III e todos os demais personagens não jogadores.

Richard deve conservar sua personalidade complexa e sua caracterização de Requiem of the Rose King, de Aya Kanno. Não o suavize nem o transforme em outro personagem.

Os personagens possuem autonomia, interesses próprios, segredos e contradições. Não concordam automaticamente com Kazuki.

Mantenha a continuidade narrativa, política, econômica e histórica. Escreva em português brasileiro, com atmosfera gótica e diálogos naturais.`
          }]
        };

        const response = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + encodeURIComponent(apiKey),
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
            { error: "A API Gemini recusou a solicitação.", details: result.error?.message || "Verifique a configuração da API." },
            { status: response.status }
          );
        }

        const reply = result.candidates?.[0]?.content?.parts
          ?.map(part => part.text || "")
          .join("") || "Nenhuma resposta recebida.";

        return Response.json({ reply });

      } catch (error) {
        return Response.json(
          { error: "Erro interno ao processar a mensagem." },
          { status: 500 }
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};
