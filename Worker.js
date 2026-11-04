export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat") {
      const chatModule = await import("./functions/api/chat.js");

      return chatModule.onRequest({
        request,
        env,
        params: {},
        waitUntil: ctx.waitUntil.bind(ctx),
        next: () => new Response("Not found", { status: 404 }),
        data: {}
      });
    }

    return new Response("Rosa de Sangue — Crônicas de uma Coroa Partida", {
      headers: {
        "Content-Type": "text/plain; charset=UTF-8"
      }
    });
  }
};
