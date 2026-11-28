// GET /api/stats?from=YYYY-MM-DD&to=YYYY-MM-DD  -> JSON for the private dashboard (/admin/stats).
// Auth: header x-admin-key = ADMIN_KEY. Needs binding LISTEN_DB (D1). CORS only for the two sites' own domains,
// so the same dashboard can read both sites. No personal data is stored or returned: no IP, no cookies, no visitor id.
const SITE = 'ft'; // 'ft' = Frigidaire Tango, 'vi' = The Vindicators
const ORIGINS = ['https://frigidairetango.com', 'https://www.frigidairetango.com', 'https://thevindicators.it', 'https://www.thevindicators.it'];
const ymd = (d) => d.toISOString().slice(0, 10);
const okDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || '') && !isNaN(new Date(s + 'T00:00:00Z'));

function corsHeaders(request) {
  const h = { 'cache-control': 'no-store', vary: 'origin' };
  const o = request.headers.get('origin');
  if (o && ORIGINS.includes(o)) {
    h['access-control-allow-origin'] = o;
    h['access-control-allow-headers'] = 'x-admin-key';
    h['access-control-allow-methods'] = 'GET, OPTIONS';
  }
  return h;
}

const pretty = (s) => s.replace(/[-_]+/g, ' ').replace(/^(\d{4}) (\d{2}) (\d{2}) /, '$1-$2-$3 · ').replace(/^(\d{4}) (\d{2}) /, '$1-$2 · ').trim();

// Which disc / session a track belongs to (derived from its audio path; the tracks table, if any, wins)
function groupOf(key, meta) {
  if (meta && meta.album_title) return meta.album_title;
  const m = /^a:assets\/audio\/([^\/]+)\/(?:([^\/]+)\/)?[^\/]+$/.exec(key);
  if (SITE === 'vi') {
    if (m) {
      if (m[1] === 'tar') return "That's All Rock (1987)";
      if (m[1] === 'rr') return 'Roots Revolution (1989)';
      if (m[1] === 'mc') return 'Live at Monte Cruz (2001)';
      if (m[1] === 'gal') return 'Galleria · ' + pretty(m[2] || 'foto');
      return pretty(m[1]);
    }
    return 'Altro';
  }
  if (m) {
    if (m[1] === 'chronology') return 'Cronologia · ' + pretty(m[2] || '');
    return pretty(m[1]);
  }
  return 'Altro';
}
const baseName = (key) => decodeURIComponent((key.split('/').pop() || key).replace(/\.mp3$/i, '')).replace(/^\d+[-_.]\s*/, '').replace(/[-_]+/g, ' ');

export async function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function onRequestGet({ request, env }) {
  const H = corsHeaders(request);
  const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...H, 'content-type': 'application/json; charset=utf-8' } });
  const k = request.headers.get('x-admin-key') || '';
  // ADMIN_KEY (full admin) or VIEW_KEY (read-only: can only see these stats) both open the dashboard
  const good = (env.ADMIN_KEY && k === env.ADMIN_KEY) || (env.VIEW_KEY && k === env.VIEW_KEY);
  if (!good) return J({ error: 'auth' }, 401);
  const db = env.LISTEN_DB;
  if (!db) return J({ error: 'no_db' }, 503);

  const q = new URL(request.url).searchParams;
  const now = new Date();
  const to = okDate(q.get('to')) ? q.get('to') : ymd(now);
  const from = okDate(q.get('from')) ? q.get('from') : ymd(new Date(now.getTime() - 29 * 86400000));
  const a = from + ' 00:00:00';
  const b = ymd(new Date(new Date(to + 'T00:00:00Z').getTime() + 86400000)) + ' 00:00:00';
  const P = (sql) => db.prepare(sql).bind(a, b);

  const run = async (sql) => { try { return (await P(sql).all()).results || []; } catch (e) { return []; } };
  const [trk, daily_v, daily_p, pages, pagec, cv, cp, langs, refs, devs, tot, tv] = await Promise.all([
    run(`SELECT key, MAX(title) title, SUM(src='site') site, SUM(src='widget') widget, SUM(src='link') link,
           SUM(CASE WHEN src='site' THEN secs END) secs, SUM(CASE WHEN src='site' THEN done END) done, MAX(dur) dur
         FROM plays WHERE ts >= ? AND ts < ? GROUP BY key`),
    run(`SELECT substr(ts,1,10) d, COUNT(*) n FROM views WHERE ts >= ? AND ts < ? GROUP BY d ORDER BY d`),
    run(`SELECT substr(ts,1,10) d, SUM(src IN ('site','widget')) n FROM plays WHERE ts >= ? AND ts < ? GROUP BY d ORDER BY d`),
    run(`SELECT pg, COUNT(*) n FROM views WHERE ts >= ? AND ts < ? GROUP BY pg ORDER BY n DESC LIMIT 200`),
    run(`SELECT pg, COALESCE(country,'??') c, COUNT(*) n FROM views WHERE ts >= ? AND ts < ? GROUP BY pg, c ORDER BY n DESC LIMIT 600`),
    run(`SELECT COALESCE(country,'??') c, COUNT(*) n FROM views WHERE ts >= ? AND ts < ? GROUP BY c ORDER BY n DESC LIMIT 80`),
    run(`SELECT COALESCE(country,'??') c, SUM(src IN ('site','widget')) n FROM plays WHERE ts >= ? AND ts < ? GROUP BY c HAVING n > 0 ORDER BY n DESC LIMIT 80`),
    run(`SELECT COALESCE(lang,'it') l, COUNT(*) n FROM views WHERE ts >= ? AND ts < ? GROUP BY l ORDER BY n DESC`),
    run(`SELECT COALESCE(ref,'') r, COUNT(*) n FROM views WHERE ts >= ? AND ts < ? GROUP BY r ORDER BY n DESC LIMIT 30`),
    run(`SELECT COALESCE(dev,'?') d, COUNT(*) n FROM views WHERE ts >= ? AND ts < ? GROUP BY d ORDER BY n DESC`),
    run(`SELECT COUNT(*) n, SUM(src='site') site, SUM(src='widget') widget, SUM(src='link') link, SUM(CASE WHEN src='site' THEN secs END) secs, SUM(CASE WHEN src='site' THEN done END) done FROM plays WHERE ts >= ? AND ts < ?`),
    run(`SELECT COUNT(*) n FROM views WHERE ts >= ? AND ts < ?`),
  ]);

  // Optional catalogue (Frigidaire has one: all discs' tracks, so unplayed ones show with 0)
  let meta = {};
  try { (await db.prepare('SELECT key, album_title, pos, title, dur FROM tracks').all()).results.forEach((r) => (meta[r.key] = r)); } catch (e) {}

  const byKey = {};
  trk.forEach((r) => (byKey[r.key] = r));
  Object.keys(meta).forEach((key) => { if (!byKey[key]) byKey[key] = { key, site: 0, widget: 0, link: 0, secs: 0, done: 0 }; });
  const tracks = Object.values(byKey).map((r) => {
    const m = meta[r.key];
    return {
      key: r.key,
      title: (m && m.title) || r.title || baseName(r.key),
      album: groupOf(r.key, m),
      pos: m ? m.pos : null,
      site: r.site || 0, widget: r.widget || 0, link: r.link || 0,
      secs: r.secs || 0, done: r.done || 0,
      dur: r.dur || (m && m.dur) || null,
    };
  });

  const t = tot[0] || {};
  return J({
    site: SITE, from, to,
    totals: { views: (tv[0] || {}).n || 0, plays: (t.site || 0) + (t.widget || 0), site: t.site || 0, widget: t.widget || 0, link: t.link || 0, secs: t.secs || 0, done: t.done || 0 },
    tracks,
    daily: { views: daily_v, plays: daily_p },
    pages, pagecountry: pagec,
    countries: { views: cv, plays: cp },
    langs, refs, devices: devs,
  });
}
