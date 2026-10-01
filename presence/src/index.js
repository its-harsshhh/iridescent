// One global room. Each open tab holds a hibernatable WebSocket; the count is
// simply how many sockets are attached, broadcast whenever someone joins or leaves.
export class Presence {
  constructor(ctx) {
    this.ctx = ctx;
  }

  async fetch(request) {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return Response.json({ online: this.ctx.getWebSockets().length });
    }
    const [client, server] = Object.values(new WebSocketPair());
    this.ctx.acceptWebSocket(server);
    this.broadcast();
    return new Response(null, { status: 101, webSocket: client });
  }

  broadcast(leaving) {
    const sockets = this.ctx.getWebSockets().filter(ws => ws !== leaving);
    const msg = JSON.stringify({ online: sockets.length });
    for (const ws of sockets) {
      try { ws.send(msg); } catch (e) { /* socket already gone */ }
    }
  }

  webSocketMessage(ws, message) {
    if (message === 'ping') ws.send('pong');
  }

  webSocketClose(ws, code) {
    try { ws.close(code, 'bye'); } catch (e) {}
    this.broadcast(ws);
  }

  webSocketError(ws) {
    this.broadcast(ws);
  }
}

export default {
  fetch() {
    return new Response('Not found', { status: 404 });
  },
};
