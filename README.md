# Fioredano Construction — lead-capture site

A single-page lead-generation site for **Fioredano Construction LLC** (Seaside
Heights, NJ), positioned around **bathroom remodeling** with kitchens and
whole-home renovation as secondary services.

Plain HTML, CSS and JavaScript. No build step, no framework, no dependencies —
it can be dropped on any static host as-is.

---

## Before this goes live

Two things need a real value. Everything else works out of the box.

### 1. Point the form somewhere

`assets/js/site.js` opens with a `CONFIG` block:

```js
var CONFIG = {
  endpoint: '',                                   // <- set this
  fallbackEmail: 'fioredanoconstructionllc@gmail.com',
  phoneDisplay: '(848) 448-2294',
  redirect: 'thank-you.html'
};
```

With `endpoint` empty the form still works — it validates, then opens the
visitor's email client with every field pre-filled. That is a real fallback, but
it loses leads on phones with no mail app configured, so set a proper endpoint.

Any service that accepts a JSON `POST` works. The quickest options:

| Service | Setup | Free tier |
| --- | --- | --- |
| [Formspree](https://formspree.io) | Create a form, paste the `https://formspree.io/f/xxxxxxxx` URL | 50 submissions/month |
| [Web3Forms](https://web3forms.com) | Enter an email, paste `https://api.web3forms.com/submit`, add `access_key` to the payload | 250/month |
| Netlify Forms | Host on Netlify, add `netlify` to the `<form>` tag | 100/month |

On success the visitor is sent to `thank-you.html`. Set `redirect: ''` to keep
them on the form with an inline confirmation instead.

`fallbackEmail` is the address printed on the company shirt, so it is the real
one rather than a guess.

### 2. Swap in real photos

The gallery currently uses licensed CC0 stock (see `PHOTO-CREDITS.md`). It is
honest filler, not Fioredano's work, and replacing it is the highest-value change
available — homeowners hire the crew whose actual tile they can see.

No code changes needed. Drop replacements into `assets/img/` using the same
filenames and dimensions:

| File | Size | Shows |
| --- | --- | --- |
| `hero.jpg` | 900 × 1125 (4:5) | The single best finished bathroom |
| `bath-shower.jpg` | 1000 × 750 | Tiled walk-in shower — the lead gallery tile |
| `bath-suite.jpg` | 880 × 1100 | Master suite, portrait |
| `bath-emerald.jpg` | 880 × 1100 | A characterful tile job, portrait |
| `bath-dark.jpg` | 1000 × 667 | Double vanity |
| `bath-glass.jpg` | 1000 × 667 | Glass shower enclosure |
| `bath-marble.jpg` | 1000 × 667 | Full master bath |
| `bath-minimal.jpg` | 1000 × 667 | Tub / large-format tile |
| `kitchen-island.jpg` | 1000 × 667 | Kitchen |
| `kitchen-galley.jpg` | 1000 × 667 | Kitchen |
| `process-work.jpg` | 800 × 1000 | The crew mid-job, portrait |

Delete the matching `.webp` file when you replace a `.jpg`, or the browser keeps
serving the old WebP from the `<picture>` element. Then update each `alt`
attribute in `index.html` to describe the actual room.

Phone photos work fine. Shoot with the lights on, stand in the doorway, and hold
the phone level — a straight vertical line matters more than a good camera.

### 3. Nothing — the logo is done

The mark was redrawn as true vector from the company shirt: a 45-degree gable
whose left rafter doubles as the hammer's handle, with the head at the peak and
a quartered round window beneath. Every angle is exact rather than traced, so it
stays crisp at any size. It matches the shirt art at 0.93 IoU, the remaining
difference being JPEG blur on the photo, not shape error.

| File | Use |
| --- | --- |
| `assets/img/logo-mark.svg` | The mark alone. Fills with `currentColor`, so it takes the theme's brand colour. |
| `assets/img/logo-lockup.svg` | Mark plus logotype, stacked as on the shirt. Logotype is outlined to paths — no font needed. Use for print, social and email signatures. |
| `assets/img/logo.svg` | App icon and favicon: the mark reversed out of the brand's black rounded square. |

The logotype is **Montserrat Black** — identified by measuring every letter on
the shirt against twelve candidate faces, matching to 1.28px mean error at a 36px
cap height. The shirt sets it at **-0.037em** tracking, which is what the header
uses. The site loads Montserrat 900 (16 KB) for the logotype only; headlines stay
in Archivo.

---

## Layout

```
index.html            The whole site — hero, services, gallery, process,
                      reviews, service area, estimate form, footer
thank-you.html        Post-submission confirmation
assets/css/site.css   All styles, tokenised, light + dark
assets/js/site.js     Form validation, submission, mobile nav
assets/fonts/         Self-hosted Archivo + IBM Plex + Montserrat (latin subsets)
assets/img/           Photography and the three logo assets
build/inline.py       Bundles everything into one shareable HTML file
PHOTO-CREDITS.md      Image provenance and licences
```

### Brand and design tokens

The brand is **#72aedd on near-black**, taken straight off the company shirt.

Light blue on a light page fails contrast badly (#72aedd on white is 2.4:1), so
the palette follows normal practice and carries two logo colours: the true brand
blue on dark grounds, and a deeper `#1a6597` on light ones. Both read as the same
blue; only one is legible on paper-coloured backgrounds.

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| `--brand` | `#72aedd` | `#72aedd` | The logo blue. Never changes. |
| `--brand-mark` | `#1a6597` | `#72aedd` | Logo colour for the current ground |
| `--accent` | `#1a6597` | `#72aedd` | Buttons, links, eyebrows |
| `--accent-hi` | `#72aedd` | `#8fc0e6` | Large type and graphics only |
| `--panel` | `#14181c` | `#11161a` | The shirt's black, behind the estimate form |
| `--panel-brand` | `#72aedd` | `#72aedd` | Brand blue on that black — the shirt exactly |
| `--bg` | `#f4f6f8` | `#0d1216` | Page ground |
| `--text` | `#11171c` | `#e9eef3` | Body copy |

Everything visual comes from these custom properties at the top of `site.css`, so
a rebrand is a handful of hex values rather than a search-and-replace.

Dark mode redefines the same tokens in two places — a `prefers-color-scheme`
block and a `[data-theme="dark"]` block — so it works whether the visitor's OS is
dark or a theme was set explicitly. `--panel` stays a *background* role in both
themes; it deepens rather than inverting, so the brand blue keeps its contrast.

---

## Running it

No build step. Open `index.html`, or serve the folder:

```sh
npx http-server -p 8080 .
```

Serving over HTTP rather than `file://` matters: the self-hosted fonts are
blocked by CORS on `file://` and the page silently falls back to system faces.

### Deploying

Upload the whole folder. Any static host works — Netlify, Vercel, Cloudflare
Pages, GitHub Pages, or plain shared hosting over FTP.

Note that `fioredanoconstruction.com` currently resolves to a parked Namecheap
page, so the domain needs pointing at the host before launch.

### Single-file build

```sh
python3 build/inline.py     # -> dist/fioredano-artifact.html
```

Inlines the CSS, JS, fonts and photos as data URIs to produce one portable file
(~1.9 MB) for previews and sharing. The real site keeps its separate assets.

---

## Content notes

The copy is built on verifiable facts, not invention:

- **Reviews** are real, quoted verbatim from the 10 verified reviews on
  [Networx](https://www.networx.com/c.fioredano-construction-llc), with the
  reviewer's first name and town as published.
- **Service area** is the 30-town list from that same profile, plus Toms River,
  Brick Township, Bayville and Beachwood, which appear in the reviews.
- **Claims** — family-owned, free in-home estimate, beat-or-match pricing — are
  the business highlights Fioredano publishes on Networx.
- **"Est. 2021"** derives from the "5 years in business" figure on that profile
  as of 2026. Worth confirming with Andrew before launch.

Two gaps worth closing, both about credibility rather than code:

1. **No bathroom-specific reviews exist yet.** Every published review is for
   painting, concrete, ceilings or a kitchen. A site that leads on bathrooms
   should carry bathroom reviews — worth asking recent bathroom customers.
2. **No licence or insurance number is shown.** New Jersey requires home
   improvement contractors to register with the Division of Consumer Affairs, and
   the NJ HIC number is a strong trust signal. Add it to the footer once you have
   it.

## Mobile

The phone layout is the primary one, not a shrunk desktop:

- The hero puts the headline, sub-copy and both CTAs above the fold — the photo
  sits below them, so a visitor never scrolls past an image to find the offer.
- The gallery and the reviews each become a snap-scrolling swipe rail. Stacked
  vertically they cost about seven screens; as rails they cost one each.
- A fixed bottom bar keeps **Call now** and **Free estimate** reachable from
  anywhere on the page.
- Every control clears a 44px tap target, and the 34-town index stays in two
  columns down to 330px.

Full page height at 390px is roughly 9,100px — down from 14,400px before these
changes.

## Accessibility

Semantic landmarks, a skip link, labelled form fields with inline validation,
visible focus rings, `prefers-reduced-motion` honoured, and text contrast that
clears WCAG AA in both themes.
