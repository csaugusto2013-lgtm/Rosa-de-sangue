export async function onRequestPost(context) {
  try {
    const apiKey = context.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "Chave Gemini não configurada." },
        { status: 500 }
      );
    }

    const body = await context.request.json();
    const messages = body.messages || [];

    const contents = messages.map(message => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }]
    }));

    const systemInstruction = {
      parts: [{
        text: `Você é o narrador e intérprete de Rosa de Sangue — Crônicas de uma Coroa Partida.

A ambientação é medieval, política e realista, no ano de 1470. Não existe magia ou sobrenatural.

O jogador controla exclusivamente Kazuki von Bismarck. Nunca escreva falas, ações, pensamentos, sentimentos ou decisões de Kazuki.

Você controla Richard Plantagenet III e todos os demais personagens não jogadores.

Richard deve conservar a personalidade complexa e a caracterização de Requiem of the Rose King, de Aya Kanno.

Os personagens possuem autonomia, interesses próprios, segredos e contradições. Não devem concordar automaticamente com Kazuki.

Mantenha continuidade narrativa, política, econômica e histórica. Escreva em português brasileiro, com diálogos naturais e atmosfera gótica.`
      }]
    };

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        { error: "Falha na API Gemini.", details: result },
        { status: response.status }
      );
    }

    const reply =
      result.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("") || "Nenhuma resposta recebida.";

    return Response.json({ reply });

  } catch (error) {
    return Response.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
