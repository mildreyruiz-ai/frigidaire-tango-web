// POST /api/send  (admin only)  { key, subject_it, body_it, subject_en, body_en, test? }
//  - with "test": sends only to that address; otherwise to every subscriber (each in their own language, falling back to Italian).
// GET /api/send?key=ADMIN_KEY -> { total, it, en } (count of subscribers)
import { esc, toHtml, unsubToken, sendBatch, unsubHeaders } from '../_mail.js';
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
async function allSubs(env) { const out = []; let cursor; do { const l = await env.FAV_KV.list({ prefix: 'sub:', cursor }); for (const e of l.keys) { const v = JSON.parse(await env.FAV_KV.get(e.name)); v.id = e.name.slice(4); out.push(v); } cursor = l.list_complete ? null : l.cursor; } while (cursor); return out; }
export async function onRequestGet({ request, env }) {
  if (!env.ADMIN_KEY || new URL(request.url).searchParams.get('key') !== env.ADMIN_KEY) return new Response('Not found', { status: 404 });
  const s = await allSubs(env); return J({ total: s.length, it: s.filter((x) => x.lang !== 'en').length, en: s.filter((x) => x.lang === 'en').length, mail: !!env.RESEND_API_KEY });
}
export async function onRequestPost({ request, env }) {
  let b; try { b = await request.json(); } catch (e) { return J({ ok: false, error: 'bad_json' }, 400); }
  if (!env.ADMIN_KEY || b.key !== env.ADMIN_KEY) return J({ ok: false, error: 'auth' }, 403);
  if (!env.RESEND_API_KEY || !env.FAV_KV) return J({ ok: false, error: 'not_configured' }, 503);
  const it = { s: String(b.subject_it || '').trim(), t: String(b.body_it || '').trim() }, en = { s: String(b.subject_en || '').trim(), t: String(b.body_en || '').trim() };
  if (!it.s || !it.t) return J({ ok: false, error: 'italian_required' }, 400);
  const origin = new URL(request.url).origin;
  const build = async (sub) => {
    const L = sub.lang === 'en' && en.s && en.t ? en : it, lang = L === en ? 'en' : 'it';
    const url = origin + '/api/unsubscribe?i=' + sub.id + '&t=' + (await unsubToken(env, sub.id));
    const foot = lang === 'en' ? '\n\nUnsubscribe: ' + url : '\n\nAnnulla l’iscrizione: ' + url;
    return { to: sub.email, subject: L.s, html: toHtml(L.t, lang, url), text: L.t + foot, headers: unsubHeaders(url) };
  };
  if (b.test) {
    const email = String(b.test).trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return J({ ok: false, error: 'email' }, 400);
    const r = await sendBatch(env, [await build({ email, lang: b.test_lang === 'en' ? 'en' : 'it', id: 'test' })]);
    return J({ ok: r.sent === 1, sent: r.sent, failed: r.failed, test: true });
  }
  const subs = await allSubs(env);
  const msgs = []; for (const s of subs) msgs.push(await build(s));
  const r = await sendBatch(env, msgs);
  if (r.sent > 0 && b.archive !== false) { // publish in the public archive (/newsletter)
    const date = new Date().toISOString();
    await env.FAV_KV.put('nl:' + date, JSON.stringify({ date, subject_it: it.s, body_it: it.t, subject_en: en.s, body_en: en.t }));
  }
  return J({ ok: r.failed === 0, sent: r.sent, failed: r.failed, total: subs.length, archived: r.sent > 0 && b.archive !== false });
}
