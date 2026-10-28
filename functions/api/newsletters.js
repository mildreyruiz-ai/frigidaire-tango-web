// GET /api/newsletters            -> list of published newsletters (newest first): [{id, date, subject_it, subject_en}]
// GET /api/newsletters?id=ID      -> one issue with its text. Public (archive page); only issues sent with "publish in archive" are stored.
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=60' } });
export async function onRequestGet({ request, env }) {
  if (!env.FAV_KV) return J({ items: [] });
  const id = new URL(request.url).searchParams.get('id');
  if (id) {
    if (!/^[0-9TZ:\-.]+$/.test(id)) return J({ error: 'bad_id' }, 400);
    const v = await env.FAV_KV.get('nl:' + id);
    return v ? J(Object.assign({ id }, JSON.parse(v))) : J({ error: 'not_found' }, 404);
  }
  const items = []; let cursor;
  do { const l = await env.FAV_KV.list({ prefix: 'nl:', cursor }); for (const e of l.keys) { const v = JSON.parse(await env.FAV_KV.get(e.name)); items.push({ id: e.name.slice(3), date: v.date, subject_it: v.subject_it, subject_en: v.subject_en || '' }); } cursor = l.list_complete ? null : l.cursor; } while (cursor);
  items.sort((a, b) => (a.date < b.date ? 1 : -1));
  return J({ items });
}
