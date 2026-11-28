// Serves /assets/audio/* with HTTP Range support (206 Partial Content).
// Static Pages assets were answered with a full 200 and no Accept-Ranges header,
// so browsers could not seek/scrub inside the audio players.
export async function onRequest({ request, env }) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405 });
  const url = new URL(request.url);
  // Fetch the plain static asset (no Range header, so ASSETS returns the full file)
  const plain = new Request(url.toString(), { method: 'GET', headers: { 'Accept-Encoding': 'identity' } });
  const res = await env.ASSETS.fetch(plain);
  if (!res.ok) return res;
  const type = res.headers.get('Content-Type') || 'audio/mpeg';
  const buf = await res.arrayBuffer();
  const size = buf.byteLength;
  const base = {
    'Content-Type': type,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=86400',
    'Access-Control-Allow-Origin': '*'
  };
  const range = request.headers.get('Range');
  const m = range && /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  if (!m || (m[1] === '' && m[2] === '')) {
    return new Response(request.method === 'HEAD' ? null : buf, { status: 200, headers: { ...base, 'Content-Length': String(size) } });
  }
  let start, end;
  if (m[1] === '') { const n = parseInt(m[2], 10); start = Math.max(0, size - n); end = size - 1; }
  else { start = parseInt(m[1], 10); end = m[2] === '' ? size - 1 : Math.min(parseInt(m[2], 10), size - 1); }
  if (start >= size || start > end) {
    return new Response(null, { status: 416, headers: { ...base, 'Content-Range': 'bytes */' + size } });
  }
  const chunk = buf.slice(start, end + 1);
  return new Response(request.method === 'HEAD' ? null : chunk, {
    status: 206,
    headers: { ...base, 'Content-Range': 'bytes ' + start + '-' + end + '/' + size, 'Content-Length': String(chunk.byteLength) }
  });
}
