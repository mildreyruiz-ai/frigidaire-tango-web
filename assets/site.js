// YouTube refuses to play embedded videos on a page opened straight from the
// computer (file://), so in that case open the video on YouTube instead.
// Once the page is on a real web address, videos play inside the page.
var isLocal = location.protocol === 'file:';
document.querySelectorAll('.yt').forEach(function (b) {
  var id = b.dataset.id;
  var watch = 'https://www.youtube.com/watch?v=' + id;
  var link = document.createElement('a');
  link.href = watch; link.target = '_blank'; link.rel = 'noopener';
  link.className = 'ytlink'; link.textContent = document.documentElement.lang === 'it' ? 'Guarda su YouTube ↗' : 'Watch on YouTube ↗';
  b.parentNode.appendChild(link);
  b.addEventListener('click', function () {
    if (isLocal) { window.open(watch, '_blank', 'noopener'); return; }
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1';
    f.title = b.getAttribute('aria-label');
    f.allow = 'autoplay; encrypted-media; picture-in-picture';
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    f.allowFullscreen = true;
    b.replaceChildren(f);
  });
});

(function () {
  var I = window.FT_I18N;
  var data = (window.FT_NEWS||[]).slice();
  var root = document.getElementById('archive-root');
  var SEL = 'h1,h2,h3,h4,p,dt,dd,figcaption,.tag,.eyebrow,.role,.y,.src,.btn,header nav a,blockquote,.meta,.date b,.date span,.press a,.logo,footer div,.rollhead .ct,.rollhead .rsub,.arch-howto,.ytlink,.vid h3,.back,.chl,.more,.tnews .go';
  var MONTHS = { en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
                 it: ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'] };
  var UI = { en: { none: 'Month not specified', one: ' item', many: ' items', def: 'News', noscript: 'The archive needs JavaScript to be displayed.' },
             it: { none: 'Mese non specificato', one: ' notizia', many: ' notizie', def: 'News' } };
  var lang = 'en';
  function norm(s) { return s.replace(/\s+/g, ' ').trim(); }
  function parts(d) { var p = String(d).split('-'); return { y: p[0], m: p[1] ? parseInt(p[1], 10) : 0, d: p[2] ? parseInt(p[2], 10) : 0 }; }
  function key(it) { var p = parts(it.date); return p.y + String(p.m).padStart(2, '0') + String(p.d).padStart(2, '0'); }
  data.sort(function (a, b) { return key(a) < key(b) ? 1 : key(a) > key(b) ? -1 : 0; });

  function renderArchive() {
    if (!root) return;
    var holder = document.getElementById('archive-embeds');
    root.querySelectorAll('.arch-embed').forEach(function (x) { holder.appendChild(x); });
    var openYears = {};
    root.querySelectorAll('details').forEach(function (d) { openYears[d.dataset.y] = d.open; });
    var first = !root.children.length;
    root.textContent = '';
    var years = [];
    data.forEach(function (it) {
      var y = parts(it.date).y;
      var g = years.filter(function (x) { return x.y === y; })[0];
      if (!g) { g = { y: y, items: [] }; years.push(g); }
      g.items.push(it);
    });
    var L = lang === 'it';
    years.forEach(function (g, i) {
      var det = document.createElement('details');
      det.className = 'arch-year'; det.dataset.y = g.y;
      det.open = first ? i === 0 : !!openYears[g.y];
      var sum = document.createElement('summary');
      sum.appendChild(document.createTextNode(g.y));
      var n = document.createElement('span');
      n.className = 'n';
      n.textContent = g.items.length + (g.items.length === 1 ? UI[lang].one : UI[lang].many);
      sum.appendChild(n);
      var pv = document.createElement('span'); pv.className = 'pv';
      pv.textContent = g.items.map(function (it) { return (L && it.title_it) ? it.title_it : it.title; }).join('  ·  ');
      sum.appendChild(pv); det.appendChild(sum);
      var lastM = null, ul = null;
      g.items.forEach(function (it) {
        var p = parts(it.date);
        if (p.m !== lastM || !ul) {
          lastM = p.m;
          var h = document.createElement('div');
          h.className = 'arch-month';
          h.textContent = p.m ? MONTHS[lang][p.m - 1] : UI[lang].none;
          det.appendChild(h);
          ul = document.createElement('ul'); ul.className = 'arch-list'; det.appendChild(ul);
        }
        var li = document.createElement('li'); li.className = 'arch-item';
        var day = document.createElement('div');
        day.className = 'arch-day' + (p.d ? '' : ' nd');
        day.textContent = p.d ? p.d : '—';
        var body = document.createElement('div');
        var h4 = document.createElement('h4');
        var kind = document.createElement('span'); kind.className = 'arch-kind';
        kind.textContent = (L && it.kind_it) || it.kind || UI[lang].def;
        h4.appendChild(kind);
        var title = (L && it.title_it) || it.title;
        if (it.url) {
          var a = document.createElement('a'); a.href = it.url; a.textContent = title;
          if (/^https?:/.test(it.url)) { a.target = '_blank'; a.rel = 'noopener'; }
          h4.appendChild(a);
        } else { h4.appendChild(document.createTextNode(title)); }
        body.appendChild(h4);
        var text = (L && it.text_it) || it.text;
        if (text) { var pp = document.createElement('p'); pp.textContent = text; body.appendChild(pp); }
        li.appendChild(day); li.appendChild(body); ul.appendChild(li);
        if (it.embed) { var emb = holder.querySelector('[data-embed="' + it.embed + '"]'); if (emb) li.appendChild(emb); }
      });
      root.appendChild(det);
    });
  }

  var enTitle = document.title, metaD = document.querySelector('meta[name=description]'), enDesc = metaD ? metaD.content : '';
  function setLang(l) {
    lang = l;
    document.documentElement.lang = l;
    document.querySelectorAll(SEL).forEach(function (el) {
      if (el.closest('#archive-root') && !el.closest('.arch-embed')) return;
      if (el.querySelector('p,h1,h2,h3,h4,div,figure,li')) return;
      if (el.dataset.en === undefined) {
        var k = norm(el.innerHTML);
        if (!Object.prototype.hasOwnProperty.call(I.html, k)) return;
        el.dataset.en = el.innerHTML;
      }
      el.innerHTML = l === 'it' ? I.html[norm(el.dataset.en)] : el.dataset.en;
    });
    document.querySelectorAll('[alt]').forEach(function (el) {
      if (el.dataset.enAlt === undefined) { if (!I.alt[el.alt]) return; el.dataset.enAlt = el.alt; }
      el.alt = l === 'it' ? I.alt[el.dataset.enAlt] : el.dataset.enAlt;
    });
    document.querySelectorAll('[aria-label],iframe[title]').forEach(function (el) {
      var attr = el.hasAttribute('aria-label') ? 'aria-label' : 'title';
      if (el.dataset.enAria === undefined) el.dataset.enAria = el.getAttribute(attr);
      var en = el.dataset.enAria, it = I.aria[en];
      if (!it && /^Play /.test(en)) it = 'Riproduci ' + en.slice(5);
      if (el.classList.contains('lang')) return;
      el.setAttribute(attr, l === 'it' && it ? it : en);
    });
    if (metaD) metaD.content = l === 'it' ? (metaD.dataset.it || I.desc) : enDesc;
    var ti = document.querySelector('title'); if (ti && ti.dataset.it) ti.textContent = l === 'it' ? ti.dataset.it : enTitle;
    document.querySelectorAll('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.lang === l ? 'true' : 'false'); });
    renderArchive();
    try { localStorage.setItem('ft-lang', l); } catch (e) {}
  }
  lang = document.documentElement.lang === 'it' ? 'it' : 'en';
  renderArchive();
})();

(function () {
  var rolls = document.querySelectorAll('.roll');
  if (!rolls.length || !window.HTMLDialogElement) return;
  var dlg, img, cap, cnt, cur = null, idx = 0, list = [];
  function T(en, it) { return document.documentElement.lang === 'it' ? it : en; }
  function build() {
    dlg = document.createElement('dialog'); dlg.className = 'lb';
    dlg.innerHTML = '<button class="lb-x" type="button"></button><button class="lb-p" type="button"></button><button class="lb-n" type="button"></button><figure><img alt=""><figcaption><span class="lb-c"></span><span class="lb-k"></span></figcaption></figure>';
    document.body.appendChild(dlg);
    img = dlg.querySelector('img'); cap = dlg.querySelector('.lb-c'); cnt = dlg.querySelector('.lb-k');
    dlg.querySelector('.lb-x').onclick = function () { dlg.close(); };
    dlg.querySelector('.lb-p').onclick = function () { go(-1); };
    dlg.querySelector('.lb-n').onclick = function () { go(1); };
    dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.tagName === 'FIGURE') dlg.close(); });
    dlg.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); } else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); } });
    var x0 = null;
    dlg.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    dlg.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); });
    dlg.addEventListener('close', function () { if (cur) { var a = list[idx]; if (a) a.focus({ preventScroll: true }); } cur = null; });
  }
  function labels() {
    dlg.querySelector('.lb-x').setAttribute('aria-label', T('Close', 'Chiudi'));
    dlg.querySelector('.lb-p').setAttribute('aria-label', T('Previous photo', 'Foto precedente'));
    dlg.querySelector('.lb-n').setAttribute('aria-label', T('Next photo', 'Foto successiva'));
    dlg.querySelector('.lb-x').textContent = '×'; dlg.querySelector('.lb-p').textContent = '‹'; dlg.querySelector('.lb-n').textContent = '›';
  }
  function show() {
    var a = list[idx], im = a.querySelector('img'), fc = a.parentNode.querySelector('figcaption');
    img.src = a.getAttribute('href'); img.alt = im ? im.alt : '';
    cap.textContent = fc ? fc.textContent : ''; cnt.textContent = (idx + 1) + ' / ' + list.length;
    [1, -1].forEach(function (d) { var n = list[(idx + d + list.length) % list.length]; var p = new Image(); p.src = n.getAttribute('href'); });
    a.scrollIntoView({ block: 'nearest', inline: 'center' });
  }
  function go(d) { idx = (idx + d + list.length) % list.length; show(); }
  rolls.forEach(function (r) {
    r.addEventListener('click', function (e) {
      var a = e.target.closest('a.fr'); if (!a) return;
      e.preventDefault();
      if (!dlg) build(); labels();
      cur = r; list = Array.prototype.slice.call(r.querySelectorAll('a.fr')); idx = list.indexOf(a);
      show(); dlg.showModal();
    });
  });
})();

