// GET /api/listen-report?type=biweekly|monthly|custom[&from=YYYY-MM-DD&to=YYYY-MM-DD][&send=1][&format=json]
// Auth: ADMIN_KEY (header x-admin-key or ?key=). Needs bindings: LISTEN_DB (D1); for e-mail: RESEND_API_KEY + REPORT_EMAIL.
import { esc, fromAddr } from '../_mail.js';
const J = (o, s = 200) => new Response(JSON.stringify(o, null, 1), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const ymd = (d) => d.toISOString().slice(0, 10);
const mmss = (s) => (s == null ? '–' : Math.floor(s / 60) + ':' + String(Math.round(s % 60)).padStart(2, '0'));

function range(type, q) {
  const n = new Date(), y = n.getUTCFullYear(), m = n.getUTCMonth(), d = n.getUTCDate();
  const U = (yy, mm, dd) => new Date(Date.UTC(yy, mm, dd));
  if (type === 'monthly') return [U(y, m - 1, 1), U(y, m, 1), 'Mensile'];
  if (type === 'custom') return [new Date(q.get('from') + 'T00:00:00Z'), new Date(q.get('to') + 'T00:00:00Z'), 'Periodo'];
  return d >= 16 ? [U(y, m, 1), U(y, m, 16), 'Quindicinale'] : [U(y, m - 1, 16), U(y, m, 1), 'Quindicinale'];
}

async function data(db, from, to) {
  const a = ymd(from) + ' 00:00:00', b = ymd(to) + ' 00:00:00';
  const rows = (await db.prepare(`
    SELECT k.key, k.album, k.pos, k.title, k.dur,
      COALESCE(s.site,0) site, COALESCE(s.widget,0) widget, COALESCE(s.link,0) link,
      s.secs, s.avgsecs, COALESCE(s.done,0) done
    FROM (SELECT key, album_title album, pos, title, dur FROM tracks
          UNION SELECT p.key, 'Altro (' || COALESCE(MAX(p.pg),'?') || ')', 99, COALESCE(MAX(p.title), p.key), NULL
                FROM plays p WHERE p.key NOT IN (SELECT key FROM tracks) GROUP BY p.key) k
    LEFT JOIN (SELECT key, SUM(src='site') site, SUM(src='widget') widget, SUM(src='link') link,
                      SUM(CASE WHEN src='site' THEN secs END) secs, AVG(CASE WHEN src='site' THEN secs END) avgsecs,
                      SUM(CASE WHEN src='site' THEN done END) done
               FROM plays WHERE ts >= ? AND ts < ? GROUP BY key) s ON s.key = k.key
    ORDER BY k.album, k.pos`).bind(a, b).all()).results;
  const tot = (await db.prepare(`SELECT COUNT(*) n, SUM(src='site') site, SUM(src='widget') widget, SUM(src='link') link, SUM(CASE WHEN src='site' THEN secs END) secs FROM plays WHERE ts >= ? AND ts < ?`).bind(a, b).first());
  const countries = (await db.prepare(`SELECT COALESCE(country,'??') c, COUNT(*) n FROM plays WHERE ts >= ? AND ts < ? GROUP BY c ORDER BY n DESC LIMIT 15`).bind(a, b).all()).results;
  return { rows, tot, countries };
}

function html(label, from, to, cur, prev) {
  const plays = (r) => r.site + r.widget + r.link;
  const albums = {};
  cur.rows.forEach((r) => (albums[r.album] = albums[r.album] || []).push(r));
  const th = 'style="text-align:left;padding:6px 8px;border-bottom:1px solid #ccc;font-size:12px;color:#666"';
  const td = 'style="padding:6px 8px;border-bottom:1px solid #eee;font-size:14px"';
  const num = (v) => '<td ' + td.slice(0, -1) + ';text-align:right">' + v + '</td>';
  const top = cur.rows.filter((r) => plays(r) > 0).sort((x, y) => plays(y) - plays(x)).slice(0, 10);
  const delta = (c, p) => (p ? (c >= p ? '+' : '') + Math.round(((c - p) / p) * 100) + '% vs. periodo precedente' : 'primo periodo con dati');
  const c = cur.tot, p = prev.tot, cn = c.n || 0, pn = p.n || 0;
  let h = '<div style="font:15px/1.5 Arial,Helvetica,sans-serif;max-width:720px;margin:0 auto;color:#111"><h2 style="margin:0 0 4px">Frigidaire Tango · Report ascolti ' + esc(label.toLowerCase()) + '</h2><p style="margin:0 0 16px;color:#666">' + ymd(from) + ' → ' + ymd(new Date(to - 86400000)) + ' (UTC)</p>';
  h += '<p><b>' + cn + '</b> ascolti totali (' + delta(cn, pn) + '): <b>' + (c.site || 0) + '</b> dal player del sito, <b>' + (c.widget || 0) + '</b> dal player Deezer, <b>' + (c.link || 0) + '</b> click verso Deezer/YouTube/Spotify. Tempo ascoltato nel player del sito: <b>' + mmss(c.secs || 0) + '</b> (m:ss).</p>';
  if (top.length) {
    h += '<h3 style="margin:22px 0 6px">Top 10 brani</h3><table style="border-collapse:collapse;width:100%"><tr><th ' + th + '>Brano</th><th ' + th + '>Disco</th><th ' + th + '>Ascolti</th></tr>';
    top.forEach((r) => (h += '<tr><td ' + td + '>' + esc(r.title) + '</td><td ' + td + '>' + esc(r.album) + '</td>' + num(plays(r)) + '</tr>'));
    h += '</table>';
  } else h += '<p>Nessun ascolto registrato in questo periodo.</p>';
  if (cur.countries.length) h += '<h3 style="margin:22px 0 6px">Paesi</h3><p style="margin:0">' + cur.countries.map((x) => esc(x.c) + ' <b>' + x.n + '</b>').join(' · ') + '</p>';
  h += '<h3 style="margin:26px 0 6px">Dettaglio per disco</h3><p style="margin:0 0 10px;color:#666;font-size:13px">Sito = player del sito (con tempo ascoltato e completamenti) · Deezer = player Deezer incorporato (solo conteggio) · Link = click verso piattaforme esterne.</p>';
  Object.keys(albums).forEach((al) => {
    const rs = albums[al], tp = rs.reduce((n, r) => n + plays(r), 0);
    h += '<h4 style="margin:18px 0 4px">' + esc(al) + ' <span style="font-weight:400;color:#666">· ' + tp + ' ascolti</span></h4><table style="border-collapse:collapse;width:100%"><tr><th ' + th + '>#</th><th ' + th + '>Brano</th><th ' + th + '>Sito</th><th ' + th + '>Deezer</th><th ' + th + '>Link</th><th ' + th + '>Media ascoltata</th><th ' + th + '>Completi</th></tr>';
    rs.forEach((r) => (h += '<tr><td ' + td + '>' + (r.pos === 99 ? '' : r.pos) + '</td><td ' + td + '>' + esc(r.title) + '</td>' + num(r.site) + num(r.widget) + num(r.link) + num(r.site ? mmss(r.avgsecs) + (r.dur ? ' / ' + mmss(r.dur) : '') : '–') + num(r.site ? r.done + '/' + r.site : '–') + '</tr>'));
    h += '</table>';
  });
  return h + '<p style="margin-top:24px;color:#888;font-size:12px">Dati anonimi (nessun IP, nessun cookie). Un ascolto dal player del sito conta dopo almeno 3 secondi; "completo" = finito o ascoltato almeno al 90%.</p></div>';
}

export async function onRequestGet({ request, env }) {
  const u = new URL(request.url), q = u.searchParams;
  const k = request.headers.get('x-admin-key') || q.get('key');
  if (!env.ADMIN_KEY || k !== env.ADMIN_KEY || !env.LISTEN_DB) return new Response('Not found', { status: 404 });
  const type = q.get('type') || 'biweekly';
  const [from, to, label] = range(type, q);
  if (isNaN(from) || isNaN(to)) return J({ ok: false, error: 'bad_dates' }, 400);
  const span = to - from, pf = new Date(from - span);
  const [cur, prev] = [await data(env.LISTEN_DB, from, to), await data(env.LISTEN_DB, pf, from)];
  const body = html(label, from, to, cur, prev);
  if (q.get('send') === '1') {
    if (!env.RESEND_API_KEY || !env.REPORT_EMAIL) return J({ ok: false, error: 'email_not_configured' }, 503);
    const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { authorization: 'Bearer ' + env.RESEND_API_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({ from: fromAddr(env), to: [env.REPORT_EMAIL], subject: 'Frigidaire Tango · report ascolti ' + label.toLowerCase() + ' ' + ymd(from) + ' → ' + ymd(new Date(to - 86400000)), html: body }) });
    return J({ ok: r.ok, status: r.status, plays: cur.tot.n });
  }
  if (q.get('format') === 'json') return J({ from: ymd(from), to: ymd(to), totals: cur.tot, countries: cur.countries, previous: prev.tot, tracks: cur.rows });
  return new Response('<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>Report ascolti</title><body style="margin:20px">' + body, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}
