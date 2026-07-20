# Soft Neo-Brutalism — Landing Page Design System

The visual language for the marketing landing page (`web/app/page.tsx` and
`web/components/site/sections/root/**`). Warm off-white canvas, near-black ink
outlines, hard offset "sticker" shadows, a single warm ember accent, and
press-down interactions. Type is sans throughout (Geist) — bold, tightly
tracked headings carry the neo-brutalist weight; the "soft" is the warm canvas
and rounded corners.

Tokens and utility classes live in `web/app/globals.css`. The editorial /
dashboard token sets in the same file are separate and unaffected.

## Tokens

Defined in the second `@theme` block in `globals.css`.

| Token | Value | Use |
| --- | --- | --- |
| `--color-nb-ink` | `#1c1b18` | Borders + body text (warm near-black) |
| `--color-nb-ink-soft` | `#514e46` | Captions, sublines, meta |
| `--color-nb-cream` | `#f7f7f4` | Page canvas |
| `--color-nb-paper` | `#ffffff` | Card + screenshot-frame surface |
| `--color-nb-accent` | `#dd4f1e` | Ember — CTA fill, emphasis mark, key numerals (matches the product's dashboard ember) |
| `--color-nb-accent-deep` | `#b83a12` | Deeper ember — CTA hover, dense accent text |
| `--color-nb-accent-soft` | `#f7ddce` | Ember wash — tints, open FAQ toggle |
| `--color-nb-mint` / `-soft` / `-ink` | green | Signal chip: available / included |
| `--color-nb-sky` / `-soft` / `-ink` | blue | Signal chip: competitor / offer |
| `--color-nb-lilac` / `-soft` / `-ink` | purple | Signal chip: repeated question / content |
| `--color-nb-peach` / `-soft` / `-ink` | rust | Signal chip: buyer pain / reply |

Rules:
- **One accent.** Ember is the only saturated color — CTA fill, the emphasis
  underline, and key numerals. Everything else is ink, ink-soft, or a muted
  signal pastel.
- **Text is ink or ink-soft** on canvas/paper. On a `-soft` signal chip, text
  is that signal's `-ink` shade (never a pale pastel on pastel).
- **Borders are `1.5px solid` ink**, reserved for structural elements —
  cards (`.nb-panel`), CTAs, inputs, and media frames (footer separators `3px`).
  Small labels, kickers, and status chips are **borderless** to stay quiet.
- **Type is sans everywhere** (`Geist`, wired to `--font-sans`). Headings are
  `font-[700]`/`font-[800]` with tight negative tracking (`-0.02` to `-0.03em`).
  No serif on the landing.

## Utility classes

All in `globals.css`.

- `.nb-panel` — the signature card: `2px` ink border, `18px` radius, paper fill,
  `5px 5px 0` hard ink shadow.
- `.nb-panel-sm` — same, `14px` radius, `4px 4px 0` shadow. For denser cards.
- `.nb-outline` — bordered block, no shadow. For media insets.
- `.nb-tag` — borderless section kicker: uppercase 11px `font-[700]`, `0.12em`
  tracking, ink. Lead with an ember dot or an ember-colored number span.
- `.nb-cta` — primary button: ember fill, white `font-[700]` text, ink border,
  `3px 3px 0` shadow, `11px` radius. Hover deepens the fill to `accent-deep`.
- `.nb-cta-ghost` — secondary button: paper fill, ink text, same frame.
- `.nb-press` — interaction. Attach to any bordered element carrying a hard
  shadow. Hover lifts `−1px/−1px` and grows the shadow; active punches to
  `+1px/+1px` and collapses the shadow.
- `.nb-mark` — emphasis underline: a **lightened, semi-transparent** ember band
  (`color-mix` ~42%) swept across the lower `0.26em` of an inline phrase — a
  highlighter swipe, not a solid fill (text stays ink, so it reads cleanly).
  Used inside H1/H2 (e.g. *actually say*, *worth acting on*) — never a full
  block behind the text.

## Composition patterns

- **Cards** = `.nb-panel .nb-press`. A header strip can carry a `border-b` ink
  divider. Inner signal chips are **borderless** `rounded-[6px]` pills — a
  `-soft` fill with the matching `-ink` text, uppercase 10.5px `font-[700]`.
- **Section bands** — `Section` takes a `tint` prop
  (`mint | sky | lilac | peach | yellow | cream`) that paints the section
  edge-to-edge with a `border-t-2` ink top rule, while the inner column stays
  `max-w-[1200px]`. Alternate a tinted band against plain cream for rhythm
  (e.g. How-it-works = mint, final CTA = yellow-soft).
- **Screenshots / media** — a **single** frame only: one `.nb-panel` with a
  paper fill and tight `p-[10–12px]` padding, image directly inside a
  `rounded-[9px] overflow-hidden` box with **no** inner border. The product
  screenshots already carry their own light frame, so a second bordered box
  reads as clutter — never nest frames. No watercolor wash behind screenshots:
  the product frame already reads as the artifact, so a mat is redundant.
- **Illustrated cards** (`04-what-you-get`) — the inline SVG art sits directly
  on the paper card with **no** tinted fill or border behind it; color coding
  lives in the art itself and the move chip, not a panel wash.
- **Tab strips** (docs / guides sub-nav, `guides-tabs.tsx`) — sit directly under
  the header and read as a continuation of it, so they **echo the header
  chrome**: the same soft `border-b` ink/12 hairline, `bg-nb-cream/90` +
  `backdrop-blur-sm` — never a heavy `border-b-2` ink rule (a full-strength
  black bar under the header's whisper-thin divider reads as two mismatched
  lines). The active tab is bold ink with a short **ember** underline
  (`h-[2px]`, `rounded-full`, `bottom-[-1px]` so it laps the hairline); inactive
  tabs are `ink-soft`. The ember underline is the only strong mark in the strip.
- **Eyebrows** — `.nb-tag` kicker. Numbered sections put the number in an ember
  (`text-[var(--color-nb-accent)]`) span before the label.

## Where it's applied

- Canvas: `web/app/page.tsx` — `<main>` is `bg-nb-cream text-nb-ink`.
- Shared chrome: `header.tsx` (cream, soft `border-b` ink/12 hairline divider,
  `bg-nb-cream/90` + `backdrop-blur-sm`, ink nav links),
  `footer.tsx` (`border-t-[3px]` ink), `auth-actions.tsx` `GetStartedButton`
  (`.nb-cta`). These render site-wide.
- Section wrapper + all root sections: `components/site/sections/root/*` and
  `components/site/sections/faq.tsx`.
- Form + conversion surfaces: `url-input-form.tsx`, `checkout-button.tsx`,
  `08-pricing.tsx`.

## Extending to other pages

Reuse the tokens and utility classes as-is. Swap a page's canvas to
`bg-nb-cream text-nb-ink`, convert cards to `.nb-panel .nb-press`, eyebrows to
`.nb-tag`, and primary buttons to `.nb-cta`. Headings are bold sans; ink for all
text; ember is the only accent. Signal pastels stay meaning-coded chips.
