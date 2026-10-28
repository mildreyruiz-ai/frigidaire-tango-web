// Cloudflare Pages Function: POST /api/subscribe -> stores a newsletter subscriber in KV and unlocks /club/ with a cookie.
// Uses the same KV binding as favorite.js (FAV_KV). Optional secrets: CLUB_SECRET (signs the access cookie), ADMIN_KEY (export list).
// Export: /api/subscribe?key=ADMIN_KEY            -> JSON   |   /api/subscribe?key=ADMIN_KEY&format=csv -> CSV
const J = (o, s = 200, h = {}) => new Response(JSON.stringify(o), { status: s, headers: Object.assign({ 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }, h) });
const hex = (buf) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
export async function clubToken(env) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.CLUB_SECRET || env.ADMIN_KEY || 'ft-club-default'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('ft-club-v1'))).slice(0, 40);
}
import { toHtml, unsubToken, sendBatch, unsubHeaders } from '../_mail.js';
export async function onRequestPost({ request, env, waitUntil }) {
  if (!env.FAV_KV) return J({ ok: false, error: 'not_configured' }, 503);
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return J({ ok: false, error: 'origin' }, 403);
  let b; try { b = await request.json(); } catch (e) { return J({ ok: false, error: 'bad_json' }, 400); }
  if (b.hp) return J({ ok: true });
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
  if (!prev) {
    await env.FAV_KV.put('sub:' + id, JSON.stringify({ email, lang, since: new Date().toISOString(), consent: 'newsletter' }));
    if (env.RESEND_API_KEY) { // welcome e-mail (best effort)
      const o = new URL(request.url).origin, un = o + '/api/unsubscribe?i=' + id + '&t=' + (await unsubToken(env, id));
      const en = lang === 'en';
      const t = en ? 'Thank you for subscribing to the Frigidaire Tango website!\n\nVery soon you will start receiving our newsletter with the latest news about the band: new content, records and concerts.\n\nUntil then, stay tuned: ' + o + '/en/\n\nFrigidaire Tango'
        : 'Grazie per esserti iscritto al sito dei Frigidaire Tango!\n\nA breve inizierai a ricevere la nostra newsletter con le ultime novità sulla band: nuovi contenuti, dischi e concerti.\n\nNel frattempo, resta sintonizzato: ' + o + '/\n\nFrigidaire Tango';
      const job = sendBatch(env, [{ to: email, subject: en ? 'Thank you for subscribing to Frigidaire Tango' : 'Grazie per l’iscrizione a Frigidaire Tango', html: toHtml(t, lang, un), text: t + '\n\n' + un, headers: unsubHeaders(un) }]).catch(() => {});
      if (waitUntil) waitUntil(job); else await job;
    }
  }
  const already = !!prev, tok = await clubToken(env), yr = 31536000;
  const h = new Headers({ 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  // ft_club (access to /club/) is NOT set for now: the unreleased material is not available yet. Re-enable here when /club/ opens.
  h.append('set-cookie', 'ft_member=1; Path=/; Max-Age=' + yr + '; Secure; SameSite=Lax');
  return new Response(JSON.stringify(already ? { ok: true, already: true } : { ok: true }), { status: 200, headers: h });
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
