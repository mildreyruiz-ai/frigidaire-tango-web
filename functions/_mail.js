// Shared helpers for newsletter e-mail (Resend API). Not a route (underscore prefix is ignored by Pages routing only if no export onRequest*).
const hex = (buf) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export async function unsubToken(env, id) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.CLUB_SECRET || env.ADMIN_KEY || 'ft-club-default'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('unsub|' + id))).slice(0, 32);
}
export const fromAddr = (env) => env.FROM_EMAIL || 'Frigidaire Tango <info@frigidairetango.com>';
// plain text -> simple HTML (paragraphs, line breaks, auto-linked URLs)
export function toHtml(text, lang, unsubUrl) {
  const body = String(text).split(/\n{2,}/).map((p) => '<p style="margin:0 0 16px">' + esc(p).replace(/\n/g, '<br>').replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color:#e4352b">$1</a>') + '</p>').join('');
  const foot = lang === 'en'
    ? 'You receive this because you subscribed on frigidairetango.com. <a href="' + unsubUrl + '" style="color:#888">Unsubscribe</a>'
    : 'Ricevi questa email perché ti sei iscritto su frigidairetango.com. <a href="' + unsubUrl + '" style="color:#888">Annulla l’iscrizione</a>';
  return '<!doctype html><html><body style="margin:0;background:#000"><div style="max-width:560px;margin:0 auto;padding:28px 22px;background:#000;color:#e8eef4;font:16px/1.6 Arial,Helvetica,sans-serif"><p style="margin:0 0 22px;font:400 26px Impact,Arial Narrow,sans-serif;letter-spacing:.04em;color:#e8eef4">Frigidaire <span style="color:#e4352b">Tango</span></p>' + body + '<hr style="border:0;border-top:1px solid #243242;margin:26px 0 14px"><p style="margin:0;font-size:12px;color:#888">' + foot + '</p></div></body></html>';
}
export async function sendBatch(env, msgs) { // msgs: [{to, subject, html, text, headers}] ; Resend batch max 100
  let sent = 0, failed = 0;
  for (let i = 0; i < msgs.length; i += 100) {
    const chunk = msgs.slice(i, i + 100).map((m) => ({ from: fromAddr(env), to: [m.to], subject: m.subject, html: m.html, text: m.text, headers: m.headers }));
    const r = await fetch('https://api.resend.com/emails/batch', { method: 'POST', headers: { authorization: 'Bearer ' + env.RESEND_API_KEY, 'content-type': 'application/json' }, body: JSON.stringify(chunk) });
    if (r.ok) sent += chunk.length; else failed += chunk.length;
  }
  return { sent, failed };
}
export function unsubHeaders(url) { return { 'List-Unsubscribe': '<' + url + '>', 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }; }
