// Cloudflare Pages Function: POST /api/favorite  -> stores a favourite-song vote in KV.
// Setup (Cloudflare dashboard, Pages project > Settings > Bindings): KV namespace binding named FAV_KV.
// Optional secret ADMIN_KEY (Settings > Variables and secrets) to read results at /api/favorite?key=...
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const norm = (s) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

export async function onRequestPost({ request, env }) {
  if (!env.FAV_KV) return J({ ok: false, error: 'not_configured' }, 503);
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return J({ ok: false, error: 'origin' }, 403);
  let body; try { body = await request.json(); } catch (e) { return J({ ok: false, error: 'bad_json' }, 400); }
  if (body.hp) return J({ ok: true }); // honeypot: pretend success
  const raw = String(body.song || '').replace(/\s+/g, ' ').trim().slice(0, 80);
  const key = norm(raw);
  if (raw.length < 2 || !key) return J({ ok: false, error: 'invalid' }, 400);
  // light rate limit: one vote per visitor per 30s (hashed, expires automatically)
  const ip = request.headers.get('cf-connecting-ip') || 'x';
  const h = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode('ft|' + ip)))).slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('');
  if (await env.FAV_KV.get('rl:' + h)) return J({ ok: false, error: 'slow_down' }, 429);
  await env.FAV_KV.put('rl:' + h, '1', { expirationTtl: 60 });
  const cur = JSON.parse((await env.FAV_KV.get('song:' + key)) || 'null') || { title: raw, count: 0, variants: {} };
  cur.count += 1; cur.variants[raw] = (cur.variants[raw] || 0) + 1; cur.updated = new Date().toISOString();
  await env.FAV_KV.put('song:' + key, JSON.stringify(cur));
  await env.FAV_KV.put('log:' + cur.updated + ':' + crypto.randomUUID().slice(0, 6), JSON.stringify({ song: raw, lang: body.lang === 'en' ? 'en' : 'it' }));
  return J({ ok: true });
}

export async function onRequestGet({ request, env }) {
  const k = new URL(request.url).searchParams.get('key');
  if (!env.ADMIN_KEY || !env.FAV_KV || k !== env.ADMIN_KEY) return new Response('Not found', { status: 404 });
  const out = []; let cursor;
  do { const l = await env.FAV_KV.list({ prefix: 'song:', cursor }); for (const e of l.keys) { const v = JSON.parse(await env.FAV_KV.get(e.name)); out.push({ title: v.title, count: v.count, variants: v.variants, updated: v.updated }); } cursor = l.list_complete ? null : l.cursor; } while (cursor);
  out.sort((a, b) => b.count - a.count);
  return J({ total: out.reduce((n, x) => n + x.count, 0), songs: out });
}
