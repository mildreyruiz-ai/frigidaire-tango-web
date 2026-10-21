// Keep proper names (people, nicknames, bands, titles, labels, venues) out of
// automatic page translation, also in text that this script builds on the fly.
var FT_NAMES = ["Lo faccio con un Frigidaire Tango", "Il ritorno del tango congelato", "Rockgarage Compilation Vol. 2", "Rockgarage Compilation Vol. 4", "Risuonano i Frigidaire Tango", "The Original Demotape 1980", "Libreria Palazzo Roberti", "Russian Dolls – Part Two", "The Romantic Life-Guard", "The romantic life-guard", "Live in Barcelona 1985", "Rockgarage Compilation", "The Romantic Lifeguard", "Amnesty International", "Clare Anne Matz Dance", "Do you remember Roxy?", "Life Is A Little Trip", "Life Is a Little Trip", "Non sei raggiungibile", "Capitol di Pordenone", "Electric Eye Records", "L'illusione del volo", "Maurizio Battistella", "Ceccon photosession", "Modern Vintage Wave", "via Jacopo da Ponte", "Antonio Bacciocchi", "Bassano del Grappa", "Carrozzeria Casale", "Fiorenzuola D'Arda", "Gianpaolo Giacobbo", "La Tempesta Dischi", "Margherita Orlandi", "Aldo Tagliapietra", "Art Music Service", "Capitol Pordenone", "Chemical Brothers", "Edizioni Interno4", "Filippo Bordignon", "Francesco Nicolli", "Gli altri Ottanta", "Indie for Bunnies", "Interno4 Edizioni", "Jacopo Rondinelli", "L'ultimo concerto", "Live in Barcelona", "Original Demotape", "Palestra Comunale", "Synthetic Shadows", "Take Over From Me", "Una vita dal vivo", "Art Music Studio", "European Affairs", "FRIGIDAIRE TANGO", "Federico Fiumani", "Frigidaire Tango", "J.M. Le Baptiste", "Materiali Sonori", "Maximum Festival", "Peppo Bianchessi", "Roots Revolution", "Teatro Remondini", "Art Music Group", "Camilla Fascina", "Fernando Viktor", "Go Down Records", "Ibrahim Baseado", "Pick Up Records", "Piergiorgio Gay", "Spittle Records", "Stefano Dal Col", "Stefano Poletti", "That's All Rock", "The Freezer Box", "The Vindicators", "Timeless Future", "Villa Trevisani", "Adrian Borland", "Black Curtains", "Blues Brothers", "Considerations", "Dangerous Echo", "Diego Negrello", "Fabio Trentini", "Franco Turesso", "Giorgio Canali", "JM Le Baptiste", "Kirlian Camera", "Livia Satriano", "Mostafa Barhmi", "Rolling Stones", "Sound & Vision", "Teatro Ariston", "The COCK Album", "The Fleshtones", "Via G. Mazzini", "Xabier Iriondo", "Bill Milhizer", "Button Studio", "Deadline Body", "Greatest Hits", "Javier Torres", "Marco De Vidi", "Modern's club", "My Heart Brut", "Natural mente", "On the Rocks!", "Orecchiocchio", "Russian Dolls", "Young Records", "Ahmed Barhmi", "Albert Elbow", "Alma Records", "Alta Fedeltà", "Amazon Music", "Avion Travel", "Bloody Glory", "Body Section", "Carlo Casale", "Chain D.L.K.", "Diego Galeri", "Diego Piotto", "Driss Barhmi", "Frank Tourak", "Google Fonts", "Ilenia Volpe", "Keith Streng", "Mark Charles", "Mildrey Ruiz", "Music For Us", "Music for Us", "Serendeepity", "Sick Tamburo", "Tagliapietra", "Uber Cavalli", "Alex Redsea", "Apple Music", "Arezzo Wave", "Blue & Pink", "Charlie Out", "Cinema Luna", "Dave Nigger", "Freezer Box", "Google Maps", "La Tempesta", "Le Baptiste", "Luca Frazzi", "Manila Club", "Marco Breda", "Marco Greco", "Mark Brenda", "Metallus.it", "Paul Milanì", "San Giorgio", "Shindy Club", "Steve Elbow", "VICE Italia", "Vanity Fair", "The Vindicators", "Zero Branco", "Alex Strax", "Arena 2000", "Cloudflare", "Dazed Life", "Diskogenia", "Fleshtones", "Frigidaire", "I Creatori", "Insecurity", "New Design", "P.E.A.C.E.", "Psicolabel", "Rockerilla", "Rockgarage", "Rumore 100", "SoundCloud", "Tendencias", "Agenzia X", "Art Music", "Bordignon", "Cadoneghe", "Cold Furs", "Diaframma", "Dreamcity", "FT Studio", "Instagram", "La Gabbia", "Longarone", "Oversouls", "Pordenone", "Radio Rai", "Radiocoop", "Stewie DC", "The First", "The Sound", "The Trash", "Bandcamp", "Die Form", "Diego P8", "Facebook", "Fardrock", "Interno4", "Marghera", "Miss Xox", "New York", "OndaRock", "Politrio", "Soundohm", "The Cock", "Amnesty", "Bassano", "Campese", "Capitol", "Cassola", "Dal Col", "Discogs", "Fiumani", "Gomiero", "Healthy", "L'ombra", "Le Orme", "Litfiba", "MASO EP", "Outkids", "Presage", "Spotify", "Timoria", "Treviso", "Voghera", "YouTube", "Adrian", "Brenda", "C.G.D.", "Casale", "Cazale", "Ceccon", "Deezer", "Feltre", "Franti", "Galeri", "IBS.it", "Le Roi", "My Way", "Naples", "Napoli", "Recall", "Rockit", "Rumore", "Shindy", "Soffia", "Thiene", "Trento", "Carlo", "Fears", "Miura", "RAI 1", "SPRAY", "TRASH", "Trash", "Tsugi", "CCCP", "COCK", "EELP", "MASO", "Nove", "Push", "Roxy", "RAI", "Slego", "Velvet", "Big Club", "Cinema Bersaglieri", "Teatro Pio X", "Palasport", "SPA Bikini Club", "Taxi Club", "Cinema Grotta", "Sporting Club", "Crushers", "Dueville", "Belvedere di Tezze", "Spinea", "Padova", "Torino", "Rimini", "Montebelluna", "Mirano", "Barcelona"];
var FT_NAME_RE = new RegExp('(^|[^\\w])(' + FT_NAMES.map(function (n) {
  return n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}).join('|') + ')(?![\\w])', 'g');
function ftProtectNames(root) {
  var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), nodes = [], n;
  while ((n = w.nextNode())) nodes.push(n);
  nodes.forEach(function (t) {
    if (t.parentNode.closest('[translate="no"]')) return;
    var s = t.nodeValue, m, last = 0, frag = document.createDocumentFragment(), hit = false;
    FT_NAME_RE.lastIndex = 0;
    while ((m = FT_NAME_RE.exec(s))) {
      var start = m.index + m[1].length;
      if (start > last) frag.appendChild(document.createTextNode(s.slice(last, start)));
      var sp = document.createElement('span');
      sp.setAttribute('translate', 'no'); sp.textContent = m[2];
      frag.appendChild(sp); last = start + m[2].length; hit = true;
    }
    if (!hit) return;
    if (last < s.length) frag.appendChild(document.createTextNode(s.slice(last)));
    t.parentNode.replaceChild(frag, t);
  });
}

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
  var SEL = 'h1,h2,h3,h4,p,dt,dd,figcaption,.tag,.eyebrow,.role,.y,.src,.btn,header nav a,blockquote,.meta,.date b,.date span,.press a,.logo,footer div,.rollhead .ct,.rollhead .rsub,.arch-howto,.ytlink,.vid h3,.back,.chl,.more,.tnews .go,.cform label,.cform button,.cnote,.cinfo h3,.legal a,.priv h3,.priv p,.priv li';
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
        var uu = (L && it.url_it) || it.url;
        if (uu) {
          var a = document.createElement('a'); a.href = uu; a.textContent = title;
          if (/^https?:/.test(uu)) { a.target = '_blank'; a.rel = 'noopener'; }
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
    ftProtectNames(root);
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
    dlg.innerHTML = '<button class="lb-x" type="button"></button><button class="lb-p" type="button"></button><button class="lb-n" type="button"></button><figure><img alt=""><figcaption translate="no"><span class="lb-c"></span><span class="lb-k"></span></figcaption></figure>';
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
    cap.textContent = fc ? fc.textContent : ''; ftProtectNames(cap); cnt.textContent = (idx + 1) + ' / ' + list.length;
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

(function(){var f=document.getElementById('cform');if(!f)return;
f.addEventListener('submit',function(e){e.preventDefault();
var v=function(i){return (document.getElementById(i).value||'').trim()};
var sub=v('cf-subject')||'Frigidaire Tango';
var body=v('cf-msg')+'\n\n'+v('cf-name')+'\n'+v('cf-email');
location.href='mailto:Frigidaire%20Tango%20%3Cchichoi60@gmail.com%3E?subject='+encodeURIComponent(sub)+'&body='+encodeURIComponent(body);});})();


/* Photos page: year timeline scroll-spy */
(function () {
  var links = [].slice.call(document.querySelectorAll('.yrs a'));
  if (!links.length) return;
  var secs = [].slice.call(document.querySelectorAll('.rollsec[id^="y"]'));
  var bar = document.querySelector('.bar'), tl = document.querySelector('.yrs'), raf = 0;
  function mark() {
    raf = 0;
    var line = bar.offsetHeight + tl.offsetHeight + 24, cur = secs.length ? secs[0].id.split('-')[0] : null;
    secs.forEach(function (s) { if (s.getBoundingClientRect().top <= line) cur = s.id.split('-')[0]; });
    links.forEach(function (a) { a.setAttribute('aria-current', cur && a.getAttribute('href') === '#' + cur ? 'true' : 'false'); });
    follow();
  }
  /* Year bar overflow: edge arrows (only when more years are hidden) + follow the active year */
  var ol = tl.querySelector('ol'), box = tl.querySelector('.wrap');
  var aL = document.createElement('button'), aR = document.createElement('button');
  function lab(d) { return document.documentElement.lang === 'it' ? (d < 0 ? 'Anni precedenti' : 'Anni successivi') : (d < 0 ? 'Earlier years' : 'Later years'); }
  [[aL, -1, 'l', 'M15 4l-8 8 8 8'], [aR, 1, 'r', 'M9 4l8 8-8 8']].forEach(function (x) {
    var b = x[0]; b.type = 'button'; b.className = 'yrs-arr ' + x[2]; b.setAttribute('aria-label', lab(x[1]));
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + x[3] + '"/></svg>';
    b.addEventListener('click', function () { ol.scrollBy({ left: x[1] * ol.clientWidth * 0.7, behavior: 'smooth' }); });
    box.appendChild(b);
  });
  function arrows() {
    var max = ol.scrollWidth - ol.clientWidth;
    aL.classList.toggle('on', ol.scrollLeft > 4); aR.classList.toggle('on', ol.scrollLeft < max - 4);
    aL.tabIndex = aL.classList.contains('on') ? 0 : -1; aR.tabIndex = aR.classList.contains('on') ? 0 : -1;
  }
  ol.addEventListener('scroll', arrows, { passive: true });
  window.addEventListener('resize', arrows);
  if ('ResizeObserver' in window) new ResizeObserver(arrows).observe(ol);
  var lastCur = null;
  function follow() {
    var a = links.filter(function (l) { return l.getAttribute('aria-current') === 'true'; })[0];
    if (!a || a === lastCur) return; lastCur = a;
    var li = a.parentNode, target = li.offsetLeft - (ol.clientWidth - li.offsetWidth) / 2;
    ol.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
  }
  arrows();
  function req() { if (!raf) raf = requestAnimationFrame(mark); }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  mark();
})();

/* Sticky offset: year timeline sits right under the sticky header */
(function () {
  var bar = document.querySelector('.bar');
  if (!bar || !document.querySelector('.yrs')) return;
  function set() { document.documentElement.style.setProperty('--barh', bar.offsetHeight + 'px'); }
  set(); window.addEventListener('resize', set);
  if ('ResizeObserver' in window) new ResizeObserver(set).observe(bar);
})();
