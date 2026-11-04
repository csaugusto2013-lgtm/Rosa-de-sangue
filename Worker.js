export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat") {
      try {
        const chatModule = await import("./functions/api/chat.js");

        return await chatModule.onRequest({
          request,
          env,
          params: {},
          data: {},
          functionPath: url.pathname,
          waitUntil: ctx.waitUntil.bind(ctx),
          next: () => env.ASSETS.fetch(request)
        });
      } catch (error) {
        return Response.json({
          error: "Erro ao processar a mensagem.",
          details: error.message
        }, { status: 500 });
      }
    }

    return env.ASSETS.fetch(request);
  }
};
