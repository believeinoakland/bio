#!/usr/bin/env node
/* corpuscheck — every design document says what it is, where it sits, what it lacks,
   and what it contains, and says so CURRENTLY.

   Bob, 2026-09-14: the design corpus describes the system across levels; every design
   document — high-level or below — carries front matter that self-describes its
   completeness, a table of contents, and an explicit list of the sections still being
   developed. "Incompleteness should be explicit, not assumed as derivable. All of this
   front matter should always be up to date." The receipt is the Content Framework: written
   and approved 2026-07-30, then 46 days unreferenced by the orientation set and never
   saying what it lacked, while the content construct it owned went undesigned.

   The standard is docs/architecture/CORPUS-STANDARD.md. This tool is its enforcement, run by
   plancheck, so drift FAILS the gate the way a stale DECIDED index does.

   THE FRONT MATTER GRAMMAR (checked, not described):

     # <first heading of the file>            front matter begins on the line after it

     **Status** · <prose ... as of YYYY-MM-DD ...>
     **Place in the system** · <prose>
     **Incomplete sections** · None — <why>        OR a bulleted list follows, every
     - §<number or heading text> — <what is missing>   bullet naming a real section
     **Contents**                                   OR **Contents** (depth N), N in 1..3
     - [<heading text>](#<slug>)                    generated; must equal the body's headings
       - [<subheading>](#<slug>)
     ---                                            end of front matter

   `as of YYYY-MM-DD` must be no earlier than the file's last commit day: a body edit
   that leaves the front matter's date behind is exactly the staleness this exists to catch.
   It appears EXACTLY ONCE, the latest date, at the END of the Status (M0-28): the date
   check reads the FIRST match, so a second `as of` earlier in the prose is the date that
   gets judged while the trailing one a reader bumps is read by nothing. A date written any
   other way ("measured 2026-08-01") is not an `as of` and is left alone.

   USAGE
     node tools/corpuscheck.mjs                 check every governed document; exit 1 on fail
     node tools/corpuscheck.mjs --write [files]  regenerate the Contents block in place
     node tools/corpuscheck.mjs --list           print the governed set
   Governed: docs/architecture/*.md plus the files listed in CORPUS-STANDARD.md's
   "Governed documents outside docs/architecture" table (one backticked path per row). */

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, relative, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const STANDARD = "docs/architecture/CORPUS-STANDARD.md";
const HEADING = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
const FENCE = /^(```|~~~)/;

export function governed() {
  const out = new Set();
  const dir = join(ROOT, "docs/architecture");
  if (existsSync(dir)) {
    for (const f of readdirSync(dir).sort()) if (f.endsWith(".md")) out.add(`docs/architecture/${f}`);
  }
  const std = existsSync(join(ROOT, STANDARD)) ? readFileSync(join(ROOT, STANDARD), "utf8") : "";
  // the governed table is the part of §5 BEFORE its first sub-heading; "Not yet governed" rows are not governed
  const sect = (std.split(/^## /m).find((s) => /^(\d+\.\s*)?Governed documents outside/i.test(s)) || "").split(/^### /m)[0];
  for (const m of sect.matchAll(/^\|\s*`([^`]+\.md)`/gm)) out.add(m[1]);
  return [...out];
}

/* GitHub-style slug, the one most viewers resolve. Duplicate headings get -1, -2 … */
export function slugger() {
  const seen = new Map();
  return (text) => {
    let s = text.toLowerCase().replace(/<[^>]+>/g, "").replace(/`/g, "")
      .replace(/[^\p{L}\p{N}\s_-]/gu, "").trim().replace(/\s+/g, "-");
    const n = seen.get(s) ?? 0; seen.set(s, n + 1);
    return n ? `${s}-${n}` : s;
  };
}

/* Headings of the BODY (after the front matter), fences skipped, levels 1..depth. */
export function bodyHeadings(lines, from, depth) {
  const out = []; let fenced = false;
  for (let i = from; i < lines.length; i++) {
    const l = lines[i];
    if (FENCE.test(l)) { fenced = !fenced; continue; }
    if (fenced) continue;
    const m = HEADING.exec(l);
    if (m && m[1].length <= depth) out.push({ level: m[1].length, text: m[2].trim(), line: i + 1 });
  }
  return out;
}

export function renderContents(heads) {
  const slug = slugger();
  const min = Math.min(...heads.map((h) => h.level));
  return heads.map((h) => `${"  ".repeat(h.level - min)}- [${h.text}](#${slug(h.text)})`);
}

/* Locate the front matter block. Returns {start, end, fields, depth} or {error}. */
export function parseFront(lines) {
  const first = lines.findIndex((l) => HEADING.test(l));
  if (first < 0) return { error: "no heading at all — a document needs a title line" };
  let i = first + 1;
  // the block ends at a `---` line or at the next heading, whichever comes first
  let end = -1;
  for (let j = i; j < lines.length; j++) {
    if (/^---\s*$/.test(lines[j])) { end = j; break; }
    if (HEADING.test(lines[j])) { end = j; break; }
  }
  if (end < 0) end = lines.length;
  const block = lines.slice(i, end);
  const idx = (label) => block.findIndex((l) => l.startsWith(`**${label}**`));
  const fields = {
    status: idx("Status"), place: idx("Place in the system"),
    incomplete: idx("Incomplete sections"), contents: idx("Contents"),
  };
  const missing = Object.entries(fields).filter(([, v]) => v < 0).map(([k]) => k);
  if (missing.length) return { error: `front matter lacks ${missing.join(", ")} (block is lines ${i + 1}-${end})`, start: i, end };
  const order = ["status", "place", "incomplete", "contents"];
  for (let k = 1; k < order.length; k++) {
    if (fields[order[k]] < fields[order[k - 1]]) return { error: `front matter fields out of order — Status, Place in the system, Incomplete sections, Contents`, start: i, end };
  }
  const dm = /^\*\*Contents\*\*\s*(?:\(depth\s*([1-3])\))?/.exec(block[fields.contents]);
  const depth = dm && dm[1] ? Number(dm[1]) : 3;
  const seg = (k) => {
    const from = fields[k]; const next = order[order.indexOf(k) + 1];
    const to = next ? fields[next] : block.length;
    return block.slice(from, to);
  };
  return {
    start: i, end, depth, blockEnd: end,
    status: seg("status").join("\n"),
    place: seg("place").join("\n"),
    incomplete: seg("incomplete"),
    contents: seg("contents").slice(1).filter((l) => l.trim() !== ""),
    contentsLine: i + fields.contents,
    contentsEnd: i + block.length,
  };
}

function lastCommitDay(path) {
  try {
    const out = execSync(`git log -1 --format=%as -- ${JSON.stringify(path)}`, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    return out || null;
  } catch { return null; }
}

/* Refs that name the document's own matter rather than a section — always resolvable. */
const POSITIONAL = new Set(["whole document", "header", "preamble", "footer", "title", "front matter",
  "banner", "changelog", "references", "revision history", "status line"]);

function sectionIds(heads) {
  return heads.map((h) => {
    const num = /^(\d+(?:\.\d+)*[a-z]?|[A-Z]\d*)[.·:\s]/.exec(h.text);
    return { num: num ? num[1] : null, text: h.text.toLowerCase() };
  });
}

export function checkFile(path, { git = true } = {}) {
  const abs = isAbsolute(path) ? path : join(ROOT, path);
  if (!existsSync(abs)) return { path, fails: [`MISSING — ${path} is governed and does not exist`], notes: [] };
  const text = readFileSync(abs, "utf8");
  const lines = text.split("\n");
  const fails = [], notes = [];
  const fm = parseFront(lines);
  if (fm.error) return { path, fails: [`NO FRONT MATTER — ${path}: ${fm.error}`], notes };

  // Status: an `as of YYYY-MM-DD` and it is not behind the file's last commit
  const asOf = /as of (\d{4}-\d{2}-\d{2})/.exec(fm.status);
  if (!asOf) fails.push(`${path}: Status carries no \`as of YYYY-MM-DD\` — a completeness statement with no date cannot be judged current`);
  else if (git) {
    const last = lastCommitDay(path);
    if (last && last > asOf[1]) fails.push(`${path}: Status says \`as of ${asOf[1]}\` but the file last changed ${last} — the body moved and the front matter did not`);
  }
  /* ONE `as of`, the LATEST, at the END of the Status — CORPUS-STANDARD.md §3 (M0-28).
     The check above `exec`s the FIRST match, so a Status carrying a second, earlier `as of`
     in its prose is judged on a date no editor would think to bump, and bumping the trailing
     date a reader can see changes nothing the checker reads. SK-6 swept the governed set and
     found three documents carrying two dates — benign only because the two were EQUAL, live
     the next time one of them was edited. A date in any OTHER form ("measured 2026-08-01") is
     not matched, so a Status may still say when a measurement was taken. */
  const asOfAll = [...fm.status.matchAll(/as of (\d{4}-\d{2}-\d{2})/g)].map((m) => m[1]);
  if (asOfAll.length > 1) fails.push(`${path}: Status carries ${asOfAll.length} \`as of\` dates — ${asOfAll.join(" then ")} — and only the first (${asOfAll[0]}) is judged; keep ONE, the latest, at the END of the Status (CORPUS-STANDARD.md §3)`);
  if (fm.status.replace(/^\*\*Status\*\*\s*·?\s*/, "").trim().length < 40) fails.push(`${path}: Status is too short to describe completeness`);
  if (fm.place.replace(/^\*\*Place in the system\*\*\s*·?\s*/, "").trim().length < 40) fails.push(`${path}: Place in the system is too short to place the construct`);

  // Body headings and Contents
  const heads = bodyHeadings(lines, fm.blockEnd, fm.depth);
  if (!heads.length) fails.push(`${path}: no headings after the front matter — nothing for a Contents to index`);
  const want = renderContents(heads);
  const have = fm.contents;
  if (want.join("\n") !== have.join("\n")) {
    const firstDiff = want.findIndex((l, k) => l !== have[k]);
    const k = firstDiff < 0 ? Math.min(want.length, have.length) : firstDiff;
    fails.push(`${path}: Contents does not match the headings (first difference at entry ${k + 1}:\n`
      + `          have ${JSON.stringify(have[k] ?? "<end>")}\n          want ${JSON.stringify(want[k] ?? "<end>")})\n`
      + `        Run \`node tools/corpuscheck.mjs --write ${path}\`.`);
  }

  // Incomplete sections: `None — ...` or bullets naming real sections
  const inc = fm.incomplete;
  const head = inc[0].replace(/^\*\*Incomplete sections\*\*\s*·?\s*/, "").trim();
  const bullets = inc.slice(1).filter((l) => /^\s*[-*]\s+/.test(l));
  if (/^None\b/.test(head)) {
    if (!/—|-/.test(head) || head.length < 12) fails.push(`${path}: Incomplete sections says None without saying how that was established`);
    if (bullets.length) fails.push(`${path}: Incomplete sections says None and then lists ${bullets.length} bullet(s)`);
  } else {
    if (!bullets.length) fails.push(`${path}: Incomplete sections is neither \`None — <how checked>\` nor a bulleted list`);
    const ids = sectionIds(bodyHeadings(lines, fm.blockEnd, 6));
    for (const b of bullets) {
      const m = /^\s*[-*]\s+§\s*([^—]+?)\s+—\s+\S/.exec(b);
      if (!m) { fails.push(`${path}: Incomplete bullet is not \`- §<section> — <what is missing>\`: ${b.trim().slice(0, 80)}`); continue; }
      const ref = m[1].trim();
      const refs = ref.split(/\s*[,/]\s*|\s+and\s+/).map((r) => r.trim()).filter(Boolean);
      for (const r of refs) {
        const rl = r.toLowerCase().replace(/^§\s*/, "");
        const hit = POSITIONAL.has(rl) || ids.some((s) => (s.num && s.num.toLowerCase() === rl) || s.text.includes(rl) || (s.num && rl.startsWith(s.num.toLowerCase() + " ")));
        if (!hit) fails.push(`${path}: Incomplete sections names §${r}, which is not a section of the document`);
      }
    }
    notes.push(`${path}: ${bullets.length} incomplete section(s) declared`);
  }
  return { path, fails, notes, heads: heads.length };
}

export function writeContents(path) {
  const abs = isAbsolute(path) ? path : join(ROOT, path);
  const lines = readFileSync(abs, "utf8").split("\n");
  const fm = parseFront(lines);
  if (fm.error) throw new Error(`${path}: ${fm.error} — write the Status, Place, and Incomplete sections first; only Contents is generated`);
  const heads = bodyHeadings(lines, fm.blockEnd, fm.depth);
  const rendered = renderContents(heads);
  const header = lines[fm.contentsLine];
  const out = [...lines.slice(0, fm.contentsLine), header, ...rendered, "", ...lines.slice(fm.contentsEnd)];
  // collapse a doubled blank before the closing ---
  const text = out.join("\n").replace(/\n\n\n(---\s*\n)/, "\n\n$1");
  writeFileSync(abs, text);
  return rendered.length;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  if (args.includes("--list")) { for (const p of governed()) console.log(p); process.exit(0); }
  if (args.includes("--write")) {
    const files = args.filter((a) => !a.startsWith("--")).map((a) => relative(ROOT, join(process.cwd(), a)).replace(/\\/g, "/"));
    const set = files.length ? files : governed();
    for (const p of set) { const n = writeContents(p); console.log(`  wrote ${n} Contents entries into ${p}`); }
    process.exit(0);
  }
  const noGit = args.includes("--no-git");
  let fails = 0, docs = 0;
  for (const p of governed()) {
    const r = checkFile(p, { git: !noGit }); docs++;
    for (const n of r.notes) console.log(`  note  ${n}`);
    for (const f of r.fails) { console.log(`  FAIL  ${f}`); fails++; }
  }
  console.log(`\ncorpuscheck: ${docs} governed document(s), ${fails} fail`);
  process.exit(fails ? 1 : 0);
}
