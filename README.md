# Frigidaire Tango — Website concept

Web design concept for **Frigidaire Tango**, the Italian new wave band from Bassano del Grappa active since 1980. The page presents the new album, news, the band's story, discography, photos, videos and press in a single dark, music-first layout.

URL: https://mildreyruiz-ai.github.io/ciudad-real-turismo-datos/web/

> *Concepto de sitio web para Frigidaire Tango (banda new wave de Bassano del Grappa). Estado: borrador de diseño, no es el sitio oficial.*

**Status:** design concept / draft. This is **not** the band's official website.

## What it includes

| Section | Purpose |
|---|---|
| New album | Latest release with streaming links |
| News | Announcements, such as a new book and its launch event |
| Story and timeline | The band's history, from the early years to today |
| Band | Members |
| Records | Discography |
| Photos | Image gallery |
| Videos | YouTube videos, played inside the page |
| Press | Reviews and interviews, linked to the original sources |

## Design

- Dark interface with ice-blue and pink accents, set in Unica One, IBM Plex Sans and IBM Plex Mono.
- Responsive layout with media queries for small screens.
- Image `alt` text and ARIA labels on interactive elements.
- Video embeds that fall back to a "Watch on YouTube" link when the page is opened directly from a local file, because YouTube blocks embeds in that case.

## Tech stack

- HTML5, CSS3 and vanilla JavaScript, no framework and no build step.
- Google Fonts.
- A single `index.html` file.

## Project structure

```
frigidaire-tango-web/
├── index.html
└── README.md
```

## Content and credits

- Design and front-end development: Mildrey Ruiz, as part of her work with Art Music Studio.
- Band history, releases, press and video links point to public sources, and each one is credited to its original site.
- Some photos are loaded from external web addresses, and the rights to them belong to their owners. If this concept goes live, they should be replaced with the band's own approved images.

## Roadmap

- Replace external images with approved, locally hosted ones.
- Add an Italian version of the page.
- Publish on a custom domain once the band approves the design.

## Development notes

Built with an AI-assisted workflow (Claude) for drafting and review. Design decisions, structure, content selection and checks are mine.

## License

© Mildrey Ruiz. All rights reserved. The code is published for reference as a portfolio piece. Band names, music, photographs and press content belong to their respective owners.
