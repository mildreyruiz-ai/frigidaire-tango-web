// POST /api/view -> stores one anonymous page view in D1 (binding LISTEN_DB). No IP, no cookies, no visitor id.
// Stored: page path, language, country (from Cloudflare), referrer host, mobile/desktop. Bots are ignored.
const R = (s) => new Response(null, { status: s, headers: { 'cache-control': 'no-store' } });
const txt = (v, n) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, n) : '');
const BOT = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|pingdom|monitor|curl|wget|python|axios|httpclient/i;

export async function onRequestPost({ request, env }) {
  if (!env.LISTEN_DB) return R(204); // not configured yet: ignore silently
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return R(403);
  const ua = request.headers.get('user-agent') || '';
  if (!ua || BOT.test(ua)) return R(204);
  let b; try { b = JSON.parse((await request.text()).slice(0, 1000)); } catch (e) { return R(400); }
  let pg = txt(b.pg, 120).split('?')[0].split('#')[0].replace(/\.html$/, '').replace(/\/index$/, '/');
  if (!pg.startsWith('/') || pg.length > 120) return R(400);
  if (pg.length > 1) pg = pg.replace(/\/$/, '');
  if (/^\/(admin|club|api)(\/|$)/.test(pg)) return R(204);
  let ref = txt(b.ref, 80).toLowerCase().replace(/^www\./, '');
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(ref) || ref === new URL(request.url).host.replace(/^www\./, '')) ref = null;
  const w = Number(b.w);
  const dev = Number.isFinite(w) && w > 0 ? (w <= 820 ? 'mobile' : 'desktop') : null;
  const country = request.cf && /^[A-Z]{2}$/.test(request.cf.country || '') ? request.cf.country : null;
  await env.LISTEN_DB.prepare('INSERT INTO views (pg,lang,country,ref,dev) VALUES (?,?,?,?,?)')
    .bind(pg, b.lang === 'en' ? 'en' : 'it', country, ref, dev).run();
  return R(204);
}
