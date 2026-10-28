// Cloudflare Pages Function: POST /api/subscribe -> stores a newsletter subscriber in KV and unlocks /club/ with a cookie.
// Uses the same KV binding as favorite.js (FAV_KV). Optional secrets: CLUB_SECRET (signs the access cookie), ADMIN_KEY (export list).
// Export: /api/subscribe?key=ADMIN_KEY            -> JSON   |   /api/subscribe?key=ADMIN_KEY&format=csv -> CSV
const J = (o, s = 200, h = {}) => new Response(JSON.stringify(o), { status: s, headers: Object.assign({ 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }, h) });
const hex = (buf) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
export async function clubToken(env) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.CLUB_SECRET || env.ADMIN_KEY || 'ft-club-default'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('ft-club-v1'))).slice(0, 40);
}
export async function onRequestPost({ request, env }) {
  if (!env.FAV_KV) return J({ ok: false, error: 'not_configured' }, 503);
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return J({ ok: false, error: 'origin' }, 403);
  let b; try { b = await request.json(); } catch (e) { return J({ ok: false, error: 'bad_json' }, 400); }
  if (b.hp) return J({ ok: true, url: '/club/' });
  const email = String(b.email || '').trim().toLowerCase().slice(0, 120);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return J({ ok: false, error: 'email' }, 400);
  if (b.consent !== true) return J({ ok: false, error: 'consent' }, 400);
  const lang = b.lang === 'en' ? 'en' : 'it';
  const ip = request.headers.get('cf-connecting-ip') || 'x';
  const rl = 'rl:sub:' + hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode('ft|' + ip))).slice(0, 16);
  if (await env.FAV_KV.get(rl)) return J({ ok: false, error: 'slow_down' }, 429);
  await env.FAV_KV.put(rl, '1', { expirationTtl: 60 });
  const id = hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(email))).slice(0, 24);
  const prev = JSON.parse((await env.FAV_KV.get('sub:' + id)) || 'null');
  if (!prev) await env.FAV_KV.put('sub:' + id, JSON.stringify({ email, lang, since: new Date().toISOString(), consent: 'newsletter+club' }));
  const tok = await clubToken(env), yr = 31536000;
  const h = new Headers({ 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  h.append('set-cookie', 'ft_club=' + tok + '; Path=/; Max-Age=' + yr + '; Secure; HttpOnly; SameSite=Lax');
  h.append('set-cookie', 'ft_member=1; Path=/; Max-Age=' + yr + '; Secure; SameSite=Lax');
  return new Response(JSON.stringify({ ok: true, url: lang === 'en' ? '/club/en/' : '/club/' }), { status: 200, headers: h });
}
export async function onRequestGet({ request, env }) {
  const u = new URL(request.url), k = u.searchParams.get('key');
  if (!env.ADMIN_KEY || !env.FAV_KV || k !== env.ADMIN_KEY) return new Response('Not found', { status: 404 });
  const out = []; let cursor;
  do { const l = await env.FAV_KV.list({ prefix: 'sub:', cursor }); for (const e of l.keys) out.push(JSON.parse(await env.FAV_KV.get(e.name))); cursor = l.list_complete ? null : l.cursor; } while (cursor);
  out.sort((a, b) => (a.since < b.since ? -1 : 1));
  if (u.searchParams.get('format') === 'csv') return new Response('email,lang,since\n' + out.map((s) => [s.email, s.lang, s.since].join(',')).join('\n'), { headers: { 'content-type': 'text/csv; charset=utf-8', 'cache-control': 'no-store' } });
  return J({ total: out.length, subscribers: out });
}
