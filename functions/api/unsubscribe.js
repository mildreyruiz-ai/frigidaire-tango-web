// GET /api/unsubscribe?i=ID&t=TOKEN (link in every e-mail). POST = one-click unsubscribe (List-Unsubscribe-Post).
import { unsubToken, esc } from '../_mail.js';
async function run({ request, env }) {
  const u = new URL(request.url), id = u.searchParams.get('i') || '', t = u.searchParams.get('t') || '';
  const ok = /^[a-f0-9]{24}$/.test(id) && env.FAV_KV && t === (await unsubToken(env, id));
  if (ok) await env.FAV_KV.delete('sub:' + id);
  const en = (request.headers.get('accept-language') || '').toLowerCase().startsWith('en');
  const msg = !ok ? (en ? 'This link is not valid. Write to info@frigidairetango.com and we will remove you.' : 'Link non valido. Scrivi a info@frigidairetango.com e ti cancelliamo noi.') : (en ? 'You have been unsubscribed. We are sorry to see you go.' : 'Iscrizione annullata. Ci dispiace vederti andare.');
  const html = '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Frigidaire Tango</title><body style="margin:0;background:#000;color:#e8eef4;font:18px/1.6 Arial,sans-serif;display:grid;place-items:center;min-height:100vh;text-align:center;padding:24px"><div><p style="font:400 30px Impact,sans-serif;letter-spacing:.04em">Frigidaire <span style="color:#e4352b">Tango</span></p><p>' + esc(msg) + '</p><p><a style="color:#8cc4ea" href="/">frigidairetango.com</a></p></div>';
  return new Response(html, { status: ok ? 200 : 400, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}
export const onRequestGet = run, onRequestPost = run;
