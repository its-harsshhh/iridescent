// Live visitor count: hands the WebSocket upgrade to the Presence Durable Object.
export async function onRequest({ request, env }) {
  if (!env.PRESENCE) return new Response('Presence unavailable', { status: 503 });
  const stub = env.PRESENCE.get(env.PRESENCE.idFromName('global'));
  return stub.fetch(request);
}
