# Giovanni Tauro – Portfolio

A static site with no framework: HTML, one stylesheet, and one JavaScript file per interactive component.

## Opening it in VS Code

1. **File → Open Folder…** and pick this folder.
2. Install the recommended **Live Server** extension (VS Code suggests it automatically; it is listed in `.vscode/extensions.json`).
3. Right-click `index.html` → **Open with Live Server**: the site opens in the browser and reloads on every save.

Alternatively, from a terminal: `python3 -m http.server`, then open <http://localhost:8000>.

## Where things are

| Path | Contents |
|---|---|
| `index.html` | Every page. Each project is a `<main data-view="name">`; the home page is `data-view="home"`. |
| `css/site.css` | All styles. Base colors and sizes are the variables in `:root` at the top. |
| `assets/img/` | Images. Those with readable names come from the PDF portfolio; the `embedded-…` ones were previously inlined in the page. |
| `build.py` | Rebuilds the single-file version in `dist/`. |

Scripts, in the order the page loads them:

| File | What it does |
|---|---|
| `js/00-lang.js` | picks the language (in the `<head>`): `?lang=it/en` in the URL, then the choice made with the switch, then the browser language |
| `js/00-i18n-it.js` | the English → Italian dictionary |
| `js/00-i18n.js` | translates the page into Italian, including text written by scripts, and handles the IT / EN switch |
| `js/01-router.js` | navigation between pages (hash in the URL) |
| `js/02-sim.js` | RehaBalloon, balloon simulator |
| `js/03-pc-proto.js` | PhiCube, prototypes (patient and therapist) |
| `js/04-core-fig.js` | RehaBalloon, 3D cross-section view |
| `js/05-pc-proto.js` | PhiCube, prototypes (patient and therapist) |
| `js/06-ard-sim.js` | Arduino lesson, simulator |
| `js/07-bk-view.js` | Blender lesson, baking viewer |
| `js/08-blend-zip.js` | Blender lesson, .blend file download |
| `js/09-bal-sim.js` | Balancing device, simulator |
| `js/10-sw-sim.js` | Rip@rto, force-feedback steering wheel |
| `js/11-fl-sim.js` | Unity experiments, fluid |
| `js/12-pr-demo.js` | Unity experiments, C# properties |
| `js/13-publications.js` | publication filters and search |
| `js/14-cal.js` | Rip@rto, calibration chart |
| `js/15-rb.js` | Rip@rto, block-based road builder |
| `js/16-wb-app.js` | WashB, app prototype |
| `js/17-rd-app.js` | RED 6.3, sharing app |
| `js/18-section-index.js` | section index on project pages |
| `js/19-ot-sim.js` | OmniTrack, "hot-cold" simulator |
| `js/20-cx.js` | OmniTrack, calibration explorer |
| `js/21-oa.js` | OmniTrack, OmniAnalytics |
| `js/22-od.js` | OmniTrack, operator dashboard |
| `js/23-work.js` | home: role filters and timeline |
| `js/24-sk.js` | Passions, skateboard and snowboard game |
| `js/25-news.js` | home: the "Latest" news ribbon above the work |
| `js/26-type.js` | home: types out the hero title, letter by letter, on the first view |

Parts still to be completed are in `<span class="todo">…</span>` (highlighted in blue on the site). Once there are none left, also remove the "Draft" notice at the bottom of `index.html`.

## The two languages

The site is written in English in `index.html`. If the browser is set to Italian (or the visitor picks IT in the switch at the top), `js/00-i18n.js` replaces each text with the one from `js/00-i18n-it.js`. The choice is saved in the browser; switching language reloads the page.

- **Dictionary keys** are the English text exactly as it appears in `index.html` (whitespace collapsed to single spaces). For paragraphs, headings and buttons the key is their whole inner HTML, tags included: the Italian value must have the same tags.
- **If you change an English text**, change its dictionary key too, otherwise that text stays in English in the Italian version.
- **`{#}`** in a key matches any number: it is used for text that scripts write with changing values.
- An element with `translate="no"` (or the `notranslate` class) is not translated.
- To view a specific language: `index.html?lang=it` or `index.html?lang=en`.

## Publishing

- **GitHub Pages:** upload *the contents* of this folder (`index.html`, `css/`, `js/`, `assets/`) to the `jotades.github.io` repository. It works as is, with no build step. The empty `.nojekyll` file tells GitHub to serve the files as they are, without running Jekyll first: keep it.
- **Single file** (claude.ai link, Netlify Drop, email): `python3 build.py` creates `dist/giovanni-tauro-portfolio.html`, with styles, scripts and images inlined.

## Notes

- The 3D demos load three.js from cdnjs, and the Archivo font comes from Google Fonts: an internet connection is required.
- Some data stays inside the scripts (WashB arch meshes, thesis data for OmniTrack, the dice .blend file): it is large but should not be edited by hand.
- The game and the filters only store preferences and high scores in the browser's `localStorage`.
