// Guards everything under /club/ : only visitors with the signed cookie set by /api/subscribe get the files.
import { clubToken } from '../api/subscribe.js';
export async function onRequest({ request, env, next }) {
  const m = /(?:^|;\s*)ft_club=([a-f0-9]+)/.exec(request.headers.get('cookie') || '');
  if (!m || m[1] !== (await clubToken(env))) {
    const en = new URL(request.url).pathname.startsWith('/club/en');
    return Response.redirect(new URL(en ? '/en/?club=1' : '/?club=1', request.url).toString(), 302);
  }
  const r = await env.ASSETS.fetch(request);
  const h = new Headers(r.headers);
  h.set('cache-control', 'private, no-store'); h.set('x-robots-tag', 'noindex, nofollow');
  return new Response(r.body, { status: r.status, headers: h });
}
