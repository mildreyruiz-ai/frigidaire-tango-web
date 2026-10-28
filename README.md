# Frigidaire Tango — Official website

Bilingual (Italian / English) website for **Frigidaire Tango**, the new wave band from Bassano del Grappa active since 1977. It is a music-first, dark-themed site that brings together the band's history, a discography with one page per record, a date-by-date archive of photos, audio and video, press, news and a newsletter.

Live site: **https://frigidairetango.com** (Italian) · **https://frigidairetango.com/en/** (English)

> *Sitio web bilingüe (italiano/inglés) de Frigidaire Tango, banda new wave de Bassano del Grappa. Diseñado, desarrollado y puesto en producción por Mildrey Ruiz. Abajo hay un resumen en español.*

---

## At a glance

| | |
|---|---|
| Pages | 59 HTML pages: 30 in Italian and 29 in English, translated one to one |
| Content | 16 record pages, 114 archive audio tracks, hundreds of photos, embedded video, press and news |
| Stack | HTML5, CSS3 and vanilla JavaScript, no framework and no build step |
| Hosting | Cloudflare Pages, deployed automatically from GitHub on every push |
| Backend | Cloudflare Pages Functions (serverless) and Cloudflare KV storage |
| Email | Resend, with a verified sending domain |
| Languages | Italian (root) and English (`/en/`), linked with `hreflang` |

## Features

### Content and navigation
- **Band, story and timeline:** the band's history from the 1977 beginnings to the present, with members and former members.
- **Discography:** one page per record (16 in total) with cover, credits and listening links or players.
- **Gallery (audio, video and photos by date):** the archive is organised by concert or recording session. Each date shows its photos and posters and, below them, a "same day: listen and watch" block with the recordings from that very night. 29 dated entries and 114 tracks, playable in the page without leaving it.
- **Videos:** YouTube clips played inside the page.
- **Press:** reviews and interviews, always linked to the original sources.
- **News:** announcements such as a book presentation and live dates, plus a "most listened" ranking of songs.
- **Favourite-song vote:** visitors can vote for a favourite song. Votes are stored in Cloudflare KV and feed the ranking.

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
├── *.html            Italian pages (home, band, story, records, discs, press, news, newsletter…)
├── en/               English version of every page
├── assets/           style.css, site.js, photos, audio, images
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

**Qué incluye:** historia y línea de tiempo de la banda, una página por cada disco (16), una galería de audio, vídeo y fotos organizada por fecha de concierto (29 fechas y 114 temas), vídeos, prensa, noticias con ranking de canciones y voto de la canción favorita.

**Newsletter propia, sin plataformas externas:** pantalla de entrada a pantalla completa con la foto de la banda, aviso flotante en el resto del sitio, detección de correos ya suscritos, email de bienvenida automático en el idioma del visitante, panel privado para enviar newsletters (prueba y envío masivo), archivo público de newsletters, baja con un clic y privacidad cuidada (consentimiento, antispam y política en dos idiomas). Además hay un área para miembros preparada para el contenido inédito.

**Técnica:** HTML, CSS y JavaScript sin framework; Cloudflare Pages con despliegue automático desde GitHub; funciones serverless y almacenamiento KV; envío de correo con Resend y dominio verificado.

**SEO y marketing:** URLs limpias, sitemap con hreflang, datos estructurados, `llms.txt` para buscadores con IA y una estrategia de audiencia propia basada en la newsletter y en el archivo histórico como contenido exclusivo.
