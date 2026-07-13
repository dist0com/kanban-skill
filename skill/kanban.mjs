#!/usr/bin/env node
// Kanban board bookkeeping. The ONLY sanctioned writer of docs/kanban/next-id.
//
// Handles the id-touching moves so the board stays consistent:
//   create  — allocate task id(s), record them as "created" for today
//   archive — remove a finished task's file/folder + its README entry, record "completed"
//   reject  — same removal, record "rejected"
//   run     — record one run of a recurring task (+1 completed); keep the card
//
// It also keeps docs/kanban/metrics.csv (one row per day: completed, created, rejected).
//
// Usage:
//   node kanban.mjs create [--count N]   allocate N ids (default 1), print them, count as created
//   node kanban.mjs archive <id>         finish task <id> (file/folder + README + metric)
//   node kanban.mjs reject  <id>         reject task <id> (file/folder + README + metric)
//   node kanban.mjs run     <id>         record one run of recurring task <id> (+1 completed, card kept)
//   node kanban.mjs peek                 print the current next-id (no bump)
//   node kanban.mjs metrics              print the metrics CSV

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..', '..', '..')
const KANBAN = path.join(REPO_ROOT, 'docs', 'kanban')
const TODO = path.join(KANBAN, 'todo')
const NEXT_ID = path.join(KANBAN, 'next-id')
const README = path.join(TODO, 'README.md')
const METRICS = path.join(KANBAN, 'metrics.csv')

function die(msg) {
  console.error(`kanban: ${msg}`)
  process.exit(1)
}

function readNextId() {
  if (!fs.existsSync(NEXT_ID)) die(`missing ${rel(NEXT_ID)}`)
  const value = fs.readFileSync(NEXT_ID, 'utf8').trim()
  if (!/^\d+$/.test(value)) die(`${rel(NEXT_ID)} is not a plain number: "${value}"`)
  return Number(value)
}

function writeNextId(value) {
  fs.writeFileSync(NEXT_ID, `${value}\n`)
}

const SELF = fileURLToPath(import.meta.url)
const rel = (p) => path.relative(REPO_ROOT, p) || p

// ---- metrics ---------------------------------------------------------------

const COLUMNS = ['completed', 'created', 'rejected']

function today() {
  return new Date().toISOString().slice(0, 10)
}

function bumpMetric(kind, amount = 1) {
  const day = today()
  let rows = []
  if (fs.existsSync(METRICS)) {
    rows = fs
      .readFileSync(METRICS, 'utf8')
      .trim()
      .split('\n')
      .slice(1) // drop header
      .filter(Boolean)
      .map((line) => {
        const [date, ...counts] = line.split(',')
        const row = { date }
        COLUMNS.forEach((c, i) => (row[c] = Number(counts[i] || 0)))
        return row
      })
  }
  let row = rows.find((r) => r.date === day)
  if (!row) {
    row = { date: day, completed: 0, created: 0, rejected: 0 }
    rows.push(row)
  }
  row[kind] += amount
  const out = ['date,' + COLUMNS.join(',')]
  for (const r of rows) out.push([r.date, ...COLUMNS.map((c) => r[c])].join(','))
  fs.writeFileSync(METRICS, out.join('\n') + '\n')
}

// ---- locate a task by id ---------------------------------------------------

function walkMd(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkMd(full, acc)
    else if (entry.name.endsWith('.md')) acc.push(full)
  }
  return acc
}

const idPrefix = (name) => {
  const m = name.match(/^(\d+)-/)
  return m ? Number(m[1]) : null
}

// Returns { kind: 'group'|'file', target, rel } or null.
//   group  — an id-prefixed folder holding a root.md tracking card; target is the folder.
//   file   — a single card (standalone or a group's subtask); target is the file.
function locate(id) {
  for (const entry of fs.readdirSync(TODO, { withFileTypes: true })) {
    if (
      entry.isDirectory() &&
      idPrefix(entry.name) === id &&
      fs.existsSync(path.join(TODO, entry.name, 'root.md'))
    ) {
      return { kind: 'group', target: path.join(TODO, entry.name), rel: entry.name }
    }
  }
  const hit = walkMd(TODO).find((f) => idPrefix(path.basename(f)) === id)
  if (hit) return { kind: 'file', target: hit, rel: path.relative(TODO, hit) }
  return null
}

// ---- strip README entries --------------------------------------------------

const isTableRow = (line) => /^\s*\|/.test(line)
const isBulletStart = (line) => /^\s*[-*] /.test(line)
const bulletIndent = (line) => line.match(/^(\s*)/)[1].length

// Removes every README entry that LINKS the task's own path. Cross-mentions of the id
// as bare `#id` text in other cards' prose carry no link, so they are left untouched.
// A single-line bullet or table row drops on its own; a multi-line group bullet drops
// with its wrapped continuation lines.
function stripReadmeRefs(target) {
  if (!fs.existsSync(README)) return []
  const needle = target.kind === 'group' ? `](${target.rel}/` : `](${target.rel})`
  const lines = fs.readFileSync(README, 'utf8').split('\n')
  const out = []
  const removed = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.includes(needle) && (isTableRow(line) || isBulletStart(line))) {
      removed.push(line.trim())
      if (isBulletStart(line)) {
        const indent = bulletIndent(line)
        i++
        // consume wrapped continuation lines (indented deeper, not a new bullet)
        while (
          i < lines.length &&
          lines[i].trim() !== '' &&
          !isBulletStart(lines[i]) &&
          !/^\s*#/.test(lines[i]) &&
          !isTableRow(lines[i]) &&
          bulletIndent(lines[i]) > indent
        ) {
          i++
        }
      } else {
        i++ // table row
      }
      continue
    }
    out.push(line)
    i++
  }
  if (removed.length) fs.writeFileSync(README, out.join('\n'))
  return removed
}

// ---- commands --------------------------------------------------------------

function cmdCreate(args) {
  const count = args.includes('--count') ? Number(args[args.indexOf('--count') + 1]) : 1
  if (!Number.isInteger(count) || count < 1) die('--count must be a positive integer')
  const start = readNextId()
  const ids = Array.from({ length: count }, (_, k) => start + k)
  writeNextId(start + count)
  bumpMetric('created', count)
  console.log(ids.join('\n'))
}

function cmdRemove(id, metric) {
  if (!Number.isInteger(id)) die('need a numeric task id')
  const found = locate(id)
  if (!found) die(`no task with id ${id} under ${rel(TODO)}`)
  const removedRefs = stripReadmeRefs(found)
  if (found.kind === 'group') fs.rmSync(found.target, { recursive: true, force: true })
  else fs.rmSync(found.target)
  bumpMetric(metric)
  const what = found.kind === 'group' ? `folder ${found.rel}/` : `file ${found.rel}`
  console.log(`${metric === 'completed' ? 'archived' : 'rejected'} #${id}: removed ${what}`)
  if (removedRefs.length) console.log(`  dropped ${removedRefs.length} README entry(ies)`)
  else console.log('  no README entry (subtask or untracked)')
}

// A recurring task never archives — each run bumps "completed" but the card stays,
// so its ## Process can be refined toward less human effort on the next run. Recurring
// cards live in the `recurring/` folder, parallel to the track folders; the guard keys
// off that so a one-shot task can't be run.
function isRecurringCard(found) {
  return found.rel.split(path.sep)[0] === 'recurring'
}

function cmdRun(id) {
  if (!Number.isInteger(id)) die('need a numeric task id')
  const found = locate(id)
  if (!found) die(`no task with id ${id} under ${rel(TODO)}`)
  if (!isRecurringCard(found)) {
    die(`#${id} is not recurring (${found.rel} is not under recurring/). Use \`archive\` for one-shot tasks.`)
  }
  bumpMetric('completed')
  console.log(`ran #${id}: +1 completed (card kept — recurring)`)
  console.log('  next: fold this run into the card\'s ## Process; log unrepeatable asks in its open-questions file')
}

function main() {
  const [cmd, ...rest] = process.argv.slice(2)
  switch (cmd) {
    case 'create':
      return cmdCreate(rest)
    case 'archive':
      return cmdRemove(Number(rest[0]), 'completed')
    case 'reject':
      return cmdRemove(Number(rest[0]), 'rejected')
    case 'run':
      return cmdRun(Number(rest[0]))
    case 'peek':
      return console.log(readNextId())
    case 'metrics':
      return console.log(fs.existsSync(METRICS) ? fs.readFileSync(METRICS, 'utf8').trim() : '(no metrics yet)')
    case 'help':
    case '-h':
    case '--help':
    case undefined:
      return console.log(HELP)
    default: {
      const guess = nearestCommand(cmd)
      const hint = guess ? ` Did you mean \`${guess}\`?` : ''
      console.error(`kanban: unknown command "${cmd}".${hint}\n`)
      console.error(HELP)
      process.exit(1)
    }
  }
}

const COMMANDS = ['create', 'archive', 'reject', 'run', 'peek', 'metrics', 'help']

const HELP = `kanban — the only sanctioned writer of docs/kanban/next-id.

Usage: node ${rel(SELF)} <command> [args]

  create [--count N]   allocate N task ids (default 1), advance next-id, print them
  archive <id>         finish task <id>: remove its file/folder + README entry, count completed
  reject  <id>         reject task <id>: same removal, count rejected
  run     <id>         record one run of recurring task <id>: +1 completed, card kept (no archive)
  peek                 print the current next-id (no bump)
  metrics              print docs/kanban/metrics.csv
  help                 show this

Never edit next-id or metrics.csv by hand — let the script write them.`

// Levenshtein-based suggestion so a mistyped command auto-corrects to the closest match.
function editDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 0; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
  return dp[a.length][b.length]
}

function nearestCommand(input) {
  let best = null
  let bestDist = Infinity
  for (const c of COMMANDS) {
    const d = editDistance(input, c)
    if (d < bestDist) [best, bestDist] = [c, d]
  }
  // Only suggest when it's a plausible typo, not a wildly different word.
  return bestDist <= Math.max(2, Math.ceil(best.length / 2)) ? best : null
}

main()
