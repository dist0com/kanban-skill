#!/usr/bin/env node
// One-time migration: add `modules: []` to every card that lacks the field.
//
// The `modules` field (task #34) tags a card with the parts of the product it touches.
// Cards written before it exist parse as `modules: []` already, but this backfills the
// line so the field is visible on disk and people can tag cards as they work them. Runs
// on the board in this repo; safe to re-run — a card that already has the line is skipped.
//
//   node scripts/migrate-add-modules.mjs [--dry-run]
//
// The insert is textual, right after the `related:` line, so nothing else in the card is
// reformatted. Cards with no `related:` line get the field before the frontmatter's
// closing `---`.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const TODO = path.join(REPO_ROOT, 'docs', 'kanban', 'todo')
const dry = process.argv.includes('--dry-run')

function walkMd(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkMd(full, acc)
    else if (entry.name.endsWith('.md') && entry.name !== 'README.md') acc.push(full)
  }
  return acc
}

let changed = 0
let skipped = 0
for (const file of walkMd(TODO)) {
  const lines = fs.readFileSync(file, 'utf8').split('\n')
  if (lines[0].trim() !== '---') { skipped++; continue } // no frontmatter — leave it
  const close = lines.indexOf('---', 1)
  if (close === -1) { skipped++; continue }
  const fm = lines.slice(1, close)
  if (fm.some((l) => /^modules:/.test(l))) { skipped++; continue } // already tagged
  const relIdx = fm.findIndex((l) => /^related:/.test(l))
  const at = relIdx !== -1 ? 1 + relIdx + 1 : close // after `related:`, else before closing ---
  lines.splice(at, 0, 'modules: []')
  const rel = path.relative(REPO_ROOT, file)
  if (dry) console.log(`would add modules: [] to ${rel}`)
  else {
    fs.writeFileSync(file, lines.join('\n'))
    console.log(`added modules: [] to ${rel}`)
  }
  changed++
}
console.log(`\n${dry ? '(dry run) ' : ''}${changed} card(s) ${dry ? 'to update' : 'updated'}, ${skipped} already had it`)
