# Frigidaire Tango — Official website

Bilingual (Italian / English) website for **Frigidaire Tango**, the new wave band from Bassano del Grappa active since 1977. It is a music-first, dark-themed site that brings together the band's history, a discography with one page per record, a date-by-date archive of photos, audio and video, press, news and a newsletter.

Live site: **https://frigidairetango.com** (Italian) · **https://frigidairetango.com/en/** (English)

> *Sitio web bilingüe (italiano/inglés) de Frigidaire Tango, banda new wave de Bassano del Grappa. Diseñado, desarrollado y puesto en producción por Mildrey Ruiz. Abajo hay un resumen en español.*

---

## At a glance

| | |
|---|---|
| Pages | 61 HTML pages: 31 in Italian and 30 in English, translated one to one |
| Content | 16 record pages, 118 recordings in the dated archive, hundreds of photos, embedded video, press and news |
| Stack | HTML5, CSS3 and vanilla JavaScript, no framework and no build step |
| Hosting | Cloudflare Pages, deployed automatically from GitHub on every push |
| Backend | Cloudflare Pages Functions (serverless) and Cloudflare KV storage |
| Email | Resend, with a verified sending domain |
| Languages | Italian (root) and English (`/en/`), linked with `hreflang` |

## Features

### Content and navigation
- **Band, story and timeline:** the band's history from the 1977 beginnings to the present, with members and former members.
- **Discography:** one page per record (16 in total) with cover, credits and listening links or players.
- **Gallery (audio, video and photos by date):** the archive is organised by concert or recording session. Each date shows its photos and posters and, below them, a "same day: listen and watch" block with the recordings from that very night. 44 dated entries with audio and 118 tracks, playable in the page without leaving it.
- **Videos:** YouTube clips played inside the page.
- **Press:** reviews and interviews, always linked to the original sources.
- **News:** one data file (`assets/news-data.js`) feeds both the home page cards and a year/month/day archive on the News page, in Italian and English. The latest announcement (for example the tribute concert *Una notte per il Bandito*) is published first, with its poster, an event fact sheet and `MusicEvent` structured data. A sticky sub-menu stays visible all the way down the News page, with a flashing **Top 7** badge and a link to the archive.
- **Monthly Top 7:** see the next section.
- **Favourite-song vote:** visitors can vote for a favourite song. Votes are stored in Cloudflare KV and feed the ranking.

### Monthly Top 7 of the most played songs (semi-automated)
A chart of the band's most played tracks is published every month and kept as a permanent page, so the archive grows with the band.

- **One page per month**, in both languages (`news-top7-ottobre.html`, `en/news-top7-october.html`, and so on). Each page opens with a large "ad" style announcement of the all-time number one track (*Recall*, from *Music for us*): animated headline, cover art, a "No. 1" burst, a play button and the listening figures. Below it comes the month's Top 7 with an in-page player for every track (Deezer widget) and a YouTube link where one exists, plus the favourite-song vote.
- **Own visual identity:** a starburst **TOP 7** badge that flashes between the band's red and yellow, used on the sticky News sub-menu, on the home page card and in the page headings. The month is plain text, so it simply changes from one month to the next. Motion is switched off for visitors who prefer reduced motion.
- **Where it shows up:** sticky sub-menu on News, home page card and `#top7` section, entry in the news archive, `sitemap.xml` with `hreflang`.
- **Method:** a combined index. Each track's Spotify plays and Deezer popularity rank are scaled to the leading track (100) and averaged. Deezer exposes a popularity rank, not plays, and its public API (`api.deezer.com/track/<id>`) can be read by a script; Spotify's public pages, even for a signed-in listener, do not show per-track play counts, so those figures come from a manual snapshot. When Spotify counts cannot be verified, the page says so and the ranking is based on Deezer only, with no invented numbers.
- **Automation:** a scheduled task runs at the end of each month (the first one on 29 November 2026). It re-checks the data online, builds the new month's page by cloning the previous one, moves the sticky link, home card and news entry to it, leaves the previous month as an archive page, and tells the owner what to publish. Publishing stays a human step: the task prepares the files and the site owner commits and pushes with GitHub Desktop, which triggers the Cloudflare deploy. Nothing goes live without that push.

### Newsletter and subscriber system
Built from scratch on serverless functions, with no third-party newsletter platform:

- **Entry screen on the home page:** a full-screen first screen with the band's hero photo and the subscription form. Visitors can subscribe, or continue to the site with a second button, the close button or the Esc key.
- **Floating card on inner pages:** a small closable card for the rest of the site.
- **Remembers the choice:** a cookie keeps the screen from coming back for 30 days after closing it and for one year after subscribing.
- **Duplicate check:** if the email is already on the list, the visitor sees "this user is already subscribed" and no second welcome email is sent. Emails are normalised to lower case so capitals never create duplicates.
- **Automatic welcome email:** sent through the Resend API in the language of the version of the site the visitor was using.
- **Admin page** (`/admin/`, private and not indexed): protected by a key, it shows the subscriber list, sends a test email, and sends a newsletter to everyone. Each subscriber receives the Italian or the English text according to their language.
- **Public archive** (`/newsletter`, `/en/newsletter`): every published issue, so new visitors can read past newsletters.
- **One-click unsubscribe:** every email carries a signed unsubscribe link and the standard `List-Unsubscribe` headers.
- **Privacy by design:** explicit consent checkbox, a honeypot field against bots, rate limiting per IP, and privacy pages in both languages that explain what is stored and for how long.
- **Members area ready** (`/club/`): a page guarded by a signed cookie, prepared for unreleased material reserved for subscribers.

### SEO and visibility
- Clean URLs without `.html` and a `sitemap.xml` with `hreflang` alternates for every page.
- `hreflang` links between the Italian and English versions of each page.
- Structured data (JSON-LD): `MusicGroup`, `MusicAlbum`, `MusicRecording`, `BreadcrumbList`, `WebSite` and an FAQ block on the home page.
- `llms.txt` with a machine-readable summary of the site for AI assistants and search engines (generative engine optimisation, GEO).
- Descriptive `alt` text on images, one `h1` per page and canonical URLs.

### Performance
- No framework and no build step: static HTML, one CSS file and one JS file.
- Photos with small thumbnails and lazy loading; full-size images load only on click.
- Cache rules in `_headers`: photos cached for 30 days, code always revalidated, private pages never cached.

### Design and accessibility
- Dark interface with ice-blue and red accents, set in Unica One, IBM Plex Sans and IBM Plex Mono.
- Responsive from phone to desktop.
- ARIA labels, keyboard support, visible focus states, and `prefers-reduced-motion` respected.
- The entry screen is an overlay on the home page and not a separate URL, so search engines still index the home page content. While it is open, the content behind it is made inert so keyboard users cannot tab into it.

## Architecture

```
Browser ──► Cloudflare Pages (static HTML / CSS / JS, global CDN)
              │
              └─► Pages Functions (serverless)
                    ├─ /api/subscribe     add subscriber, duplicate check, welcome email
                    ├─ /api/unsubscribe   signed link, removes the subscriber
                    ├─ /api/send          admin: test and bulk newsletter, archive
                    ├─ /api/newsletters   public list of published issues
                    ├─ /api/favorite      favourite-song votes
                    └─ /club/*            cookie-guarded members area
              │
              ├─► Cloudflare KV   subscribers, newsletters, votes, rate limits
              └─► Resend API      email delivery from a verified domain
```

Secrets (`RESEND_API_KEY`, `ADMIN_KEY`, optional `CLUB_SECRET`) live in Cloudflare environment variables and never in the repository.

## Project structure

```
frigidaire-tango-web/
├── *.html            Italian pages (home, band, story, records, discs, press, news, monthly Top 7, newsletter…)
├── en/               English version of every page
├── assets/           style.css, site.js, news-data.js (news archive), photos, audio, images (img/top7: cover crops for the chart)
├── functions/        Cloudflare Pages Functions (api/ and club/) and the mail helper
├── admin/            private newsletter admin page
├── club/             members area (guarded)
├── _headers          cache and security headers
├── sitemap.xml       with hreflang alternates
├── llms.txt          summary for AI crawlers
└── README.md
```

## Marketing and growth approach

- **Owned audience:** the newsletter gives the band a direct channel to its fans that does not depend on social media algorithms. It is sent only when there is something substantial to say, with no fixed schedule.
- **A reason to subscribe:** subscribers get exclusive access to unreleased material, presented as the band's Christmas gift, a concrete incentive instead of a generic "subscribe".
- **Content that earns visits:** the date-by-date archive gives fans, journalists and collectors something they will not find elsewhere, and each dated entry is a page worth searching for and sharing.
- **Search and AI visibility:** bilingual pages, structured data and `llms.txt` make the band easier to find and to cite in Italian and in English.
- **Measurable:** the favourite-song vote and the subscriber list give the band real data about its audience.

## Content and credits

- Design, front-end and back-end development, content structure and deployment: **Mildrey Ruiz**, as part of her work with Art Music.
- Band history, releases, press and video links point to public sources, and each one is credited to its original site.
- Photos, posters and recordings from the archive come from the band and its members.

## Development notes

Built with an AI-assisted workflow (Claude) for drafting, review and testing. Design decisions, structure, content selection, copy approval and publishing are mine.

## License

© Mildrey Ruiz. All rights reserved. The code is published for reference as a portfolio piece. Band names, music, photographs and press content belong to their respective owners.

---

## Resumen en español

Sitio web oficial y bilingüe (italiano e inglés) de Frigidaire Tango, publicado en frigidairetango.com. Lo diseñé, desarrollé y puse en producción yo.

**Qué incluye:** historia y línea de tiempo de la banda, una página por cada disco (16), una galería de audio, vídeo y fotos organizada por fecha de concierto (44 fechas con audio y 118 temas), vídeos, prensa, noticias y voto de la canción favorita.

**Top 7 mensual semiautomatizado:** cada mes se publica una página con el ranking de las canciones más escuchadas (índice combinado de Spotify y Deezer), abierta por un anuncio grande del tema nº 1 de todos los tiempos (*Recall*), con sello "TOP 7" parpadeante, submenú fijo en Noticias y tarjeta en la home. Una tarea programada prepara cada mes la página nueva (la primera, el 29 de noviembre de 2026) y deja la anterior como archivo; la publicación sigue siendo manual (commit y push). Deezer se puede consultar por API; las páginas públicas de Spotify no muestran reproducciones por tema, por lo que esas cifras son una foto manual y, si no se pueden verificar, la página lo indica.

**Newsletter propia, sin plataformas externas:** pantalla de entrada a pantalla completa con la foto de la banda, aviso flotante en el resto del sitio, detección de correos ya suscritos, email de bienvenida automático en el idioma del visitante, panel privado para enviar newsletters (prueba y envío masivo), archivo público de newsletters, baja con un clic y privacidad cuidada (consentimiento, antispam y política en dos idiomas). Además hay un área para miembros preparada para el contenido inédito.

**Técnica:** HTML, CSS y JavaScript sin framework; Cloudflare Pages con despliegue automático desde GitHub; funciones serverless y almacenamiento KV; envío de correo con Resend y dominio verificado.

**SEO y marketing:** URLs limpias, sitemap con hreflang, datos estructurados, `llms.txt` para buscadores con IA y una estrategia de audiencia propia basada en la newsletter y en el archivo histórico como contenido exclusivo.
