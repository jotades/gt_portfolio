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
| `js/00-lang.js` | picks the language (in the `<head>`): `?lang=it/en` in the URL, then the choice made with the switch; otherwise English |
| `js/00-i18n-it.js` | the English → Italian dictionary |
| `js/00-i18n.js` | translates the page into Italian, including text written by scripts, and handles the IT / EN switch |
| `js/01-router.js` | navigation between pages (hash in the URL); `#omnitrack/3` opens a project at its section 3 |
| `js/02-sim.js` | RehaBalloon, balloon simulator |
| `js/03-pc-proto.js` | PhiCube, prototypes (patient and therapist) |
| `js/04-core-fig.js` | RehaBalloon, 3D cross-section view |
| `js/05-pc-proto.js` | PhiCube, prototypes (patient and therapist). Games and Tests stay locked until a patient is selected (a second click on the patient deselects them); Save checks that the cube has an orientation and at least one accessory |
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
| `js/20-cx.js` | OmniTrack, calibration explorer; its "Error map" tab is the 2D error at each of the 117 measured positions (values from the thesis figure in chapter 5) |
| `js/21-oa.js` | OmniTrack, OmniAnalytics |
| `js/22-od.js` | OmniTrack, operator dashboard. The first time it comes into view it runs a demo by itself (scan, connect, a learning task on one route after another), marked "Demo running · Stop"; it pauses out of view and stops at the first click or key inside it. Not with reduced motion |
| `js/23-work.js` | home: role filters and timeline |
| `js/24-sk.js` | Passions, skateboard and snowboard game |
| `js/25-news.js` | home: the "Latest" news ribbon above the work |
| `js/26-type.js` | home: types out the hero title, letter by letter, on the first view |
| `js/27-tools.js` | the software each project used, as icons with names (`PROJECT` list): under each project title, in the "Work by role" chapters, and in sections with `data-tools="…"`. Icons from Simple Icons (CC0) in `assets/img/tools/` |
| `js/28-for.js` | "Work by role" page (`#for/product`, `#for/eng`, `#for/design`, `#for/industrial`, or a sector such as `#for/s-iot`): a scrolling report, one chapter per project, with what the project was, its problem and why it is there, then its digital prototype and its relevant sections in full. These blocks are moved in from the project pages while the report is open (so the demos keep working) and put back when the reader leaves. `PROJECTS` holds the introductions, `TOP` what opens each chapter (a prototype that sits inside one of the sections shown, such as the WashB and RED 6.3 apps, stays in its section instead), `GROUPS` which projects and sections each role or sector shows and why. `?focus=product` in a link opens it. A link can show only some projects and sections; it then opens with the sentence of the home page and the "Latest" ribbon, without the page title, the filters and the "All work" link: `#for/product/omnitrack+phicube` (the sections set for the role) or `#for/eng/omnitrack.1.3+rehaballoon.3` (the sections given, by their number on the project page) |
| `js/29-squeeze.js` | RehaBalloon, "Teaching it to count": the interactive chart of every recorded squeeze (79 normal, 35 quick, from the project repository), with averages, spread, the trigger, a crosshair, a recording replay and a data table |
| `js/30-arch.js` | OmniTrack, "The system": redraws the architecture diagram as tall as the text beside it, at any window width, with right-angle arrows |
| `js/31-od-layout.js` | OmniTrack dashboard: spreads its cards over three, two or one columns so they end together, at any width |
| `js/32-wb-flow.js` | WashB, "Research": the flow from cleaning teeth through brushing and flossing and their problems to ultrasound, drawn as vectors at the width of the page; pointing at a node highlights its flows. The band widths (`PROBLEMS`) are qualitative, taken from the original diagram |
| `js/33-ot-adapt.js` | OmniTrack, "Future work": smoothing that adapts to movement. A simulated 30 s session (input signals from the IMU and UWB) and a small MLP, trained offline on synthetic data, that predicts the smoothing α at each sample; two tabs, three time windows, fixed and adaptive α compared. A switch under the title swaps text and explorer to "Neural calibration": three options under study (deep regressor before multilateration, end-to-end network, physics-informed network), each as a diagram against today's pipeline; option 2 has the study room, where a wall reflection on one anchor can be added and the tag moved |
| `js/34-wb-survey.js` | WashB, "Research": the questionnaire answered by 86 people (thesis, pages 60–64), one stacked bar per question in three tabs (brushing, flossing, hygienist and pain), with the key figures beside; the flossing tab also has the questions on people who gave up flossing, from the project presentation |
| `js/35-wb-fem.js` | WashB, "Engineering": the two FEM checks of the thesis as cards. Squeezer: its real outline (traced from the model) closing as the lip-force slider grows, the force–displacement curve read from the Abaqus chart, and the original mesh, loads and displacement renders. Case: model with the loaded hinges and the fixtures labelled, stress and displacement renders with a legend, and the stress margin against the allowable. The renders are the full-resolution images extracted from the thesis PDF |
| `js/36-img-zoom.js` | project pages: an image zooms in gently while the pointer is over it, towards the point under the pointer (with a mouse only, not with reduced motion). The zoom is in `css/site.css`; this script only moves its origin |
| `js/37-zoom.js` | project pages: click to zoom. Over the grey background of an interactive section (not over its controls, charts or cards), or over an image or a diagram, the pointer becomes "+"; a click moves the element to the middle of the screen, enlarged, with the page dimmed. The pointer becomes "−": a click, Esc, a click outside or scrolling puts it back in place. The element is moved with a CSS transform, so demos keep working while enlarged. Mouse only; elements that cannot grow by at least 8% (the tallest dashboards) are left alone. The interactive sections are listed in `PANELS`; a section can say which part of it zooms with `data-zoom="selector"` ("Teaching it to count": its whole grey band zooms the interactive figure) |

Parts still to be completed are in `<span class="todo">…</span>` (highlighted in blue on the site). Once there are none left, also remove the "Draft" notice at the bottom of `index.html`.

## The two languages

The site is written in English in `index.html` and opens in English. If the visitor picks IT in the switch at the top (or the address has `?lang=it`), `js/00-i18n.js` replaces each text with the one from `js/00-i18n-it.js`. The choice is saved in the browser; switching language reloads the page.

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
