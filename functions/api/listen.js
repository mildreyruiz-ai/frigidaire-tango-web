// POST /api/listen -> stores one anonymous listening event in D1 (binding LISTEN_DB). No IP, no cookies, no visitor id.
const R = (s) => new Response(null, { status: s, headers: { 'cache-control': 'no-store' } });
const int = (v, max) => { v = Math.round(Number(v)); return Number.isFinite(v) && v >= 0 && v <= max ? v : null; };
const txt = (v, n) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, n) : '');

export async function onRequestPost({ request, env }) {
  if (!env.LISTEN_DB) return R(204); // not configured yet: ignore silently
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return R(403);
  let b; try { b = JSON.parse((await request.text()).slice(0, 2000)); } catch (e) { return R(400); }
  const key = txt(b.key, 200);
  if (!/^[ady]:[\w.\/%~ -]{1,190}$/.test(key)) return R(400);
  const src = ['site', 'widget', 'link'].includes(b.src) ? b.src : null;
  if (!src) return R(400);
  const secs = src === 'site' ? int(b.secs, 7200) : null;
  const dur = src === 'site' ? int(b.dur, 7200) : null;
  const maxpos = src === 'site' ? int(b.maxpos, 7200) : null;
  const done = src === 'site' ? (b.done || (dur && secs >= dur * 0.9) ? 1 : 0) : null;
  await env.LISTEN_DB.prepare('INSERT INTO plays (key,src,pf,secs,maxpos,dur,done,title,pg,lang,country) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
    .bind(key, src, txt(b.pf, 20) || null, secs, maxpos, dur, done, txt(b.title, 100) || null, txt(b.pg, 120) || null, b.lang === 'en' ? 'en' : 'it', (request.cf && /^[A-Z]{2}$/.test(request.cf.country || '') ? request.cf.country : null)).run();
  return R(204);
}
