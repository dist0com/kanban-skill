# Competitor analysis loop

**Track:** recurring · **Priority:** med · **ROI:** med
**Depends on:** [dist0](https://www.dist0.com) — a dist0 account + `DIST0_API_KEY`

> **Brand recipe.** This one isn't board-agnostic: it runs on
> [dist0](https://www.dist0.com)'s `competitors.list` capability, which mines
> Reddit buyer-pain threads for the products people name as competitors. You need
> a dist0 account and an API key in `DIST0_API_KEY` to run it. Everything else —
> the study docs, the cadence ladder, the idea-to-card handoff — is yours to keep.

Recurring task — it never archives. Each pass is one **run**: record it with
`node .claude/skills/kanban/kanban.mjs run <this card's id>` (+1 completed, card kept).

Each digest surfaces **competitor mentions** — products people named in Reddit threads
that dist0's pipeline flagged as competitors. Work from those mentions. The job is to study
each real competitor deeply to write down what you can **build, grow, or offer**
against it, and to note the false positives.

## Output — `result.md` (index) + one doc per competitor

`result.md` next to this card is the **index**, never this task file. It has two parts:

- A **competitors todo list** holding every product `competitors.list` has ever returned,
  one line each: `- [ ] <competitor>`. Check the box once it has its own `<competitor>.md`
  study doc (real competitor) or a line under `Not competitors` (false positive). Each
  handled line carries its **cadence** — when to look again:
  `- [x] <competitor> — studied <YYYY-MM-DD>, cadence <daily|weekly|monthly|never>, next <YYYY-MM-DD>`
  (`never` drops the `next` date). Re-study a competitor only when its `next` date has
  arrived; skip the rest. See **Cadence** below for how to set it.
- An h2 **`Not competitors (False positives)`**, one line each:
  `- <competitor>: <one brief sentence on why it isn't a competitor>`.

Each real competitor's deep study lives in **its own doc** in this folder,
`<competitor>.md` (slug: lowercase, drop any TLD suffix, spaces→hyphens — e.g.
`redditclient.com` → `redditclient.md`). One doc covers: what it does, its concrete
capabilities, pricing/positioning, how it overlaps with your product, and a scan of its **SEO
content assets** — the search-traffic pages and free tools it publishes, calling out any
good asset you don't have yet. Keep it sharp, not a link dump. **No ideas section**
— the ideas the study surfaces become `kanban` cards (Process step 8), never lines in any
doc.

## Process

1. Gather the flagged competitors from dist0's `competitors.list` capability — a flat
   `competitors` array, one entry per product, ranked by mention count. Invoke it over the
   dist0 API (note the `www.` host — `dist0.com` 308-redirects and drops the POST body):
   ```
   curl -s https://www.dist0.com/api/v1/invoke \
     -H "Authorization: Bearer $DIST0_API_KEY" -H "Content-Type: application/json" \
     -d '{ "capability": "competitors.list", "input": {} }'
   ```
   Each entry has `name`, `mentions`, and `sources`.
2. **Normalize and dedup** — the capability keys on the raw name the pipeline emitted, so the
   same product often appears under case/suffix variants (e.g. `redditclient.com` and
   `RedditClient`, `Growditt.com` and `Growditt`). Before diffing, fold each set of variants
   into one product (sum their mentions) and treat it as a single todo line.
3. **Record and diff** — append any new normalized product to the todo list (create
   `result.md` if missing), then work only the products that need it this run: not yet
   handled, or whose `next` date has arrived. Skip the rest.
4. For each kept product, decide: real competitor (solves the same job for the same buyer —
   Reddit buyer-pain intelligence for marketers) or false positive (unrelated product the
   pipeline over-matched)?
5. **False positives** — log each under the `Not competitors` h2 in `result.md` with a
   one-sentence reason.
6. **Real competitors** — study each deeply (its site, docs, pricing, any Reddit
   discussion) and write its own `<competitor>.md` doc: what it does, its concrete
   capabilities, pricing/positioning, and how it overlaps with your product — create the doc, or
   rewrite it if it was due for a refresh.
   **Do not write an ideas section.** the doc is the study, not the backlog.
7. **Scan its SEO content assets.** Walk the competitor's site — blog, resources, tools,
   nav, footer, sitemap — and list the content assets it built to pull in search traffic.
   Compare against what you already have and flag any good asset you're missing:
   - **Use-case / how-to pages** written in depth for a specific buyer or job, where you
     have none.
   - **Free tools** (a calculator, checker, generator) that reveal a demand you hadn't
     noticed people search for.

   Separately, note any **feature or sub-product** it ships that you could naturally copy —
   that's a product idea, not a content asset, but still worth capturing here.
   Write what you find into the `<competitor>.md` doc's asset scan.
8. Turn any build / grow / offer ideas the study surfaces — including the missing content
   assets from step 7 — into cards via the `kanban` skill (it handles the dedup and
   confirmation). For a copyable feature or sub-product, file a rough-idea card to deep-dive
   later, don't spec it now. Ideas live only as cards, never in a study doc. Keep only high-
   and medium-priority ideas; drop low-priority ones. Runs can create no card — that's fine
   if the ideas are genuinely covered or irrelevant.
9. **Set its cadence** (see **Cadence** below) and write the studied/cadence/next line back
   to the todo list.
10. Record the run: `node .claude/skills/kanban/kanban.mjs run <this card's id>`.

## Cadence

Each competitor is re-studied on its own schedule, tracked on its todo-list line. The
ladder, most to least frequent: `daily → weekly → monthly → never`.

- **First study** — set the starting cadence from how fast it can change. A strong
  competitor with lots of content assets → `daily`, so you catch anything a run missed. A
  thin product with little content grows slowly → `monthly`. A dead/defunct product →
  `never`.
- **Each re-study** — if the run found nothing new and made **no** kanban card, move the
  cadence one step slower (toward `never`). If it did surface a card, keep the cadence (or
  move one step faster if a lot changed).
- `next` date = studied date + cadence; `never` has no `next` and is never re-studied.

## Done when (one run)

Every all-time competitor `competitors.list` returns is sorted: false positives logged under
the `Not competitors` h2, real competitors given (or refreshed with) their own `<competitor>.md`
study doc plus a todo-list line carrying its cadence and `next` date, and the run recorded
with `run <this card's id>`. The loop never "finishes" — it runs each cadence and gets sharper each time.
