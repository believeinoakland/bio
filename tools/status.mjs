/* status — what is BUILT, read from ONE place and checked against the code.
 *
 * Bob, 2026-09-18: *"there must be a single source of truth that can efficiently AND
 * CONSISTENTLY be searched, read, used, and updated. That will allow you to stop guessing
 * and assuming because the answers are right there — as long as that single source of truth
 * is always kept updated."*
 *
 * THE DEFECT IT REPLACES, MEASURED THE SAME DAY. Three independent reads of the code against
 * `BIO_System_Design.md` §3's state column found it wrong in BOTH directions, mostly the one
 * nothing audits: the content object, D-164's "central gap", content-grain search, the
 * observation log, the public verify surface and three of six doctype readers were all BUILT
 * while the map called them absent, building or a stub — and a queue item was sequenced to
 * build what already existed (REC-89). Status lived as prose, was copied between documents,
 * and drifted, so every session re-derived the truth by guessing from fragments.
 *
 * THE SHAPE. `docs/architecture/construct-status.json` is the ONE source: one claim per fact,
 * each carrying PROBES that name the code which makes it true — an op, a table, a file, a
 * pattern that must match, or searches that must stay EMPTY for an absence. This tool:
 *
 *   node tools/status.mjs <topic>   LOOKUP — the verified state of anything matching <topic>
 *                                   (a construct number, a claim id, or words), with the live
 *                                   evidence. Run this instead of reading prose or guessing.
 *   node tools/status.mjs --check   every probe re-run; exit 1 on ANY disagreement, and on a §3
 *                                   state column that differs from its rendering.
 *   node tools/status.mjs --write   render §3's state column from the data.
 *
 * WHY THE PUSH GUARD RUNS IT. A status file that must be REMEMBERED to be updated goes stale
 * exactly as the prose did. So the push is refused while code and claims disagree, in either
 * direction: land a table the file calls ABSENT, or delete an op it calls BUILT, and the push
 * names the claim to update. "Always kept updated" is then a property of the push, not of
 * anybody's memory.
 *
 * WHAT A PROBE CANNOT DO, stated rather than discovered later. A probe proves PRESENCE of a
 * named thing or ABSENCE under the names searched; it does not prove the thing WORKS (the
 * battery does that) and an absence is only as good as the names tried — which is why an
 * ABSENT claim should search under more than one. `uinone` sees LITERAL call sites only.
 *
 * NEGATIVE CONTROL: `node bio-plane/test/status.control.mjs` from the repo root.
 */

import { readFileSync, existsSync, writeFileSync, realpathSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
export const DATA = "docs/architecture/construct-status.json";
export const MAP = "docs/architecture/BIO_System_Design.md";
export const STATES = ["BUILT", "PARTIAL", "ABSENT", "DEFERRED", "UNDETERMINED"];
/* The member UI's call helpers, DERIVED 2026-09-18 by matching every OPS name against
   `helper("op"` in app.html — not recalled. A new helper is a probe blind spot; the suite
   re-derives this list and fails if a helper calling an op is missing from it. */
export const UI_HELPERS = ["recR", "recPostR", "actAsk", "intentAsk", "intentPreflight",
  "captureAct", "apiQ", "apiR", "api"];

const cache = new Map();
function read(repo, rel) {
  const k = `${repo}\0${rel}`;
  if (!cache.has(k)) {
    const p = join(repo, rel);
    cache.set(k, existsSync(p) ? readFileSync(p, "utf8") : null);
  }
  return cache.get(k);
}
const lineOf = (text, idx) => text.slice(0, idx).split("\n").length;

function opsBlock(repo) {
  const t = read(repo, "bio-plane/src/index.mjs");
  if (t === null) return null;
  const s = t.indexOf("const OPS = {");
  return s < 0 ? null : { text: t, start: s };
}

export function evalProbe(p, { repo = ROOT, sets = {} } = {}) {
  const files = (x) => (typeof x === "string" && x.startsWith("@") ? sets[x] || [] : x || []);
  if (p.op) {
    const b = opsBlock(repo);
    if (!b) return { ok: false, evidence: "bio-plane/src/index.mjs has no OPS table — UNREADABLE, not absent" };
    const re = new RegExp(`^\\s{2}${p.op}:\\s*\\{\\s*classes`, "m");
    const m = re.exec(b.text.slice(b.start));
    return m ? { ok: true, evidence: `op=${p.op} (index.mjs:${lineOf(b.text, b.start + m.index)})` }
             : { ok: false, evidence: `op=${p.op} is NOT in index.mjs's OPS table` };
  }
  if (p.table) {
    const re = new RegExp(`CREATE\\s+(?:VIRTUAL\\s+)?TABLE\\s+IF\\s+NOT\\s+EXISTS\\s+${p.table}\\b`);
    for (const f of ["bio-plane/src/schema.mjs", "bio-plane/src/store.mjs"]) {
      const t = read(repo, f); if (t === null) continue;
      const m = re.exec(t);
      if (m) return { ok: true, evidence: `table ${p.table} (${f.split("/").pop()}:${lineOf(t, m.index)})` };
    }
    return { ok: false, evidence: `table ${p.table} is declared in neither schema.mjs nor store.mjs` };
  }
  if (p.file) {
    return existsSync(join(repo, p.file)) ? { ok: true, evidence: `${p.file} exists` }
                                           : { ok: false, evidence: `${p.file} does NOT exist` };
  }
  if (p.hit) {
    const re = new RegExp(p.hit, p.flags || "");
    const fl = files(p.in); const missing = [];
    for (const f of fl) {
      const t = read(repo, f); if (t === null) { missing.push(f); continue; }
      const m = re.exec(t);
      if (m) return { ok: true, evidence: `/${p.hit}/ at ${f}:${lineOf(t, m.index)}` };
    }
    return { ok: false, evidence: `/${p.hit}/ matches nowhere in ${fl.join(", ")}`
      + (missing.length ? ` (UNREADABLE: ${missing.join(", ")})` : "") };
  }
  if (p.none) {
    const fl = files(p.in); const missing = [];
    for (const pat of p.none) {
      const re = new RegExp(pat, p.flags || "");
      for (const f of fl) {
        const t = read(repo, f); if (t === null) { missing.push(f); continue; }
        const m = re.exec(t);
        if (m) return { ok: false, evidence: `/${pat}/ FOUND at ${f}:${lineOf(t, m.index)} — "${m[0]}"` };
      }
    }
    /* An unreadable file is not an empty one: an absence claimed over a file we could not
       read is UNVERIFIED, and saying "absent" there is the false-absence class. */
    if (missing.length) return { ok: false, evidence: `UNREADABLE: ${[...new Set(missing)].join(", ")} — an absence cannot be verified over a file that is not there` };
    return { ok: true, evidence: `none of ${p.none.map((x) => `/${x}/`).join(", ")} in ${fl.length} file(s)` };
  }
  if (p.uinone) {
    const t = read(repo, "civicos-ui/app.html");
    if (t === null) return { ok: false, evidence: "UNREADABLE: civicos-ui/app.html" };
    for (const op of p.uinone) {
      const re = new RegExp(`\\b(?:${UI_HELPERS.join("|")})\\(\\s*["'\`]${op}["'\`]`);
      const m = re.exec(t);
      if (m) return { ok: false, evidence: `the UI CALLS op=${op} at app.html:${lineOf(t, m.index)}` };
    }
    return { ok: true, evidence: `no literal UI call of ${p.uinone.join(", ")}` };
  }
  /* A CENSUS — name-independent. Found 2026-09-18 by CONDUCT #4: an ABSENT probe that searches for
     the design's NAME goes blind when a builder has a reason to rename (REC-87 could not call its
     step `member`, so `4.transcribe` read ABSENT over a built construct). Counting an enumeration,
     or pinning its exact key set, trips on ANY addition under ANY name and forces the review. */
  if (p.count) {
    let n = null;
    if (p.count === "ops") {
      const b = opsBlock(repo);
      if (!b) return { ok: false, evidence: "UNREADABLE: no OPS table" };
      n = [...b.text.slice(b.start).matchAll(/^\s{2}[a-z][a-z0-9]*:\s*\{\s*classes/gm)].length;
    } else if (p.count === "tables") {
      const set = new Set();
      for (const f of ["bio-plane/src/schema.mjs", "bio-plane/src/store.mjs"]) {
        const t = read(repo, f); if (t === null) return { ok: false, evidence: `UNREADABLE: ${f}` };
        for (const m of t.matchAll(/CREATE\s+(?:VIRTUAL\s+)?TABLE\s+IF\s+NOT\s+EXISTS\s+([a-z_0-9]+)/g)) set.add(m[1]);
      }
      n = set.size;
    } else return { ok: false, evidence: `unknown census: ${p.count}` };
    return n === p.equals ? { ok: true, evidence: `census: ${n} ${p.count}` }
      : { ok: false, evidence: `census: ${n} ${p.count}, the claim says ${p.equals} — something was added or removed; review the ABSENT claims it could express, then update the count` };
  }
  if (p.keys) {
    const t = read(repo, (p.in || [])[0] || "");
    if (t === null) return { ok: false, evidence: `UNREADABLE: ${(p.in || [])[0]}` };
    const i = t.indexOf(`export const ${p.keys} = {`);
    if (i < 0) return { ok: false, evidence: `${p.keys} is not declared in ${p.in[0]}` };
    const body = t.slice(i, t.indexOf("\n};", i));
    const got = [...body.matchAll(/^\s{2}'?([A-Za-z_][\w-]*)'?\s*:/gm)].map((m) => m[1]);
    const want = p.equals || [];
    const extra = got.filter((k) => !want.includes(k)), gone = want.filter((k) => !got.includes(k));
    return !extra.length && !gone.length ? { ok: true, evidence: `${p.keys} is exactly {${got.join(", ")}}` }
      : { ok: false, evidence: `${p.keys} changed —${extra.length ? ` ADDED ${extra.join(", ")}` : ""}${gone.length ? ` REMOVED ${gone.join(", ")}` : ""}; review the claims these could express, then update the set` };
  }
  return { ok: false, evidence: `unknown probe kind: ${JSON.stringify(p)}` };
}

export function load({ repo = ROOT } = {}) {
  const t = read(repo, DATA);
  if (t === null) return { error: `${DATA} is UNREADABLE — nothing can be said about what is built` };
  try { return JSON.parse(t); } catch (e) { return { error: `${DATA} does not parse: ${e.message}` }; }
}

/* Every claim judged. A claim is SOUND when its state is legal, it carries at least one probe
   (or is UNDETERMINED with a stated reason), and every probe agrees with the code. */
export function judge({ repo = ROOT, data = null } = {}) {
  const d = data || load({ repo });
  if (d.error) return { error: d.error, claims: [] };
  const out = [];
  for (const c of d.constructs || []) for (const cl of c.claims || []) {
    const problems = [];
    if (!STATES.includes(cl.state)) problems.push(`state "${cl.state}" is not one of ${STATES.join(", ")}`);
    if (cl.state === "UNDETERMINED") { if (!cl.reason) problems.push("UNDETERMINED with no stated reason"); }
    else if (!cl.probes || !cl.probes.length) problems.push(`a ${cl.state} claim with NO probe is prose, and prose is what drifted`);
    /* AN ABSENCE NEEDS A SEARCH THAT MUST STAY EMPTY. Measured 2026-09-18: three ABSENT claims
       rested on a `hit` over the code's own comment saying the thing was missing, and when CPDF-19
       built one of them, its correction comment QUOTED the old sentence — so the probe passed on a
       fixed defect. A comment is not evidence of absence; only a `none` or `uinone` search is. */
    if (cl.state === "ABSENT" && !(cl.probes || []).some((p) => p.none || p.uinone))
      problems.push("an ABSENT claim needs at least one `none` or `uinone` search — a `hit` on a comment saying so is not evidence");
    const results = (cl.probes || []).map((p) => ({ p, ...evalProbe(p, { repo, sets: d.sets || {} }) }));
    for (const r of results) if (!r.ok) problems.push(r.evidence);
    out.push({ n: c.n, construct: c.name, id: cl.id, state: cl.state, text: cl.text, note: cl.note,
               reason: cl.reason, results, problems });
  }
  return { claims: out, data: d };
}

/* A CLAIM'S FIRST SENTENCE: up to the first `. ` outside backticks (BOB #31, 2026-09-23, M0-138). The map
   is cut at its reading budget, and rendering every claim WHOLE made each landing that added a clause
   push it over — so integrators trimmed claim texts to fit, cutting the source of truth to fit its
   rendering. §3 carries the first sentence; the whole text stays in construct-status.json, served by
   `node tools/status.mjs <n>`, which every cell names. A cut sentence ends in ` …`, so the map never
   reads as the whole claim. Never trim a claim text to fit this rendering.
   WHO ELSE READS THE CELL: `corpuscheck --authority` and `statussweep` read every `§N item M` citation in
   §3 — the map citing a design item is what makes it visible — and some live only in a claim's later
   sentences (8.claim's §7.1 items 4 and 9, found by corpuscheck.test on this item's first render). So a
   cut carries the remainder's citations, verbatim, after the ellipsis: the authority cites what it cited. */
const CITE = /§\s*\d+(?:\.\d+)*\s+item\s+\d+/gi;
export function firstSentence(text) {
  const s = String(text);
  let tick = false;
  for (let i = 0; i < s.length - 1; i++) {
    if (s[i] === "`") tick = !tick;
    else if (!tick && s[i] === "." && s[i + 1] === " ") {
      const head = s.slice(0, i + 1);
      const cites = [...new Set(s.slice(i + 1).match(CITE) || [])].filter((c) => !head.includes(c));
      return head + " …" + (cites.length ? ` (also cites ${cites.join(", ")})` : "");
    }
  }
  return s;
}

/* §3's state column, RENDERED. A cell never carries a pipe, so the table cannot break. */
export function renderCell(construct) {
  const by = {};
  for (const cl of construct.claims || []) (by[cl.state] = by[cl.state] || []).push(firstSentence(cl.text));
  const parts = STATES.filter((s) => by[s]).map((s) => `**${s}:** ${by[s].join("; ")}`);
  /* A construct's DESIGN POINTER is carried through the rendering verbatim. It is not status —
     it says where the construct is designed — and other instruments read it from §3: `statussweep`
     and `corpuscheck --authority` cite the map's `X.md` + "§N item M" pairs. The first rendering
     dropped it and turned both red; who else reads a column is part of changing it. */
  const design = construct.design ? ` ${construct.design}` : "";
  return (parts.join(" · ") + ` — verified at the code: \`node tools/status.mjs ${construct.n}\`` + design)
    .replace(/\|/g, "/").replace(/\n/g, " ");
}

export function renderMap({ repo = ROOT, data = null } = {}) {
  const d = data || load({ repo });
  if (d.error) return { error: d.error };
  const text = read(repo, MAP);
  if (text === null) return { error: `${MAP} is UNREADABLE` };
  const lines = text.split("\n"); const seen = new Set();
  for (let i = 0; i < lines.length; i++) {
    const m = /^\| (\d+) \| /.exec(lines[i]);
    if (!m) continue;
    const c = (d.constructs || []).find((x) => x.n === Number(m[1]));
    if (!c) continue;
    const cells = lines[i].split(" | ");
    cells[cells.length - 1] = renderCell(c) + " |";
    lines[i] = cells.join(" | "); seen.add(c.n);
  }
  const missing = (d.constructs || []).map((c) => c.n).filter((n) => !seen.has(n));
  return { text: lines.join("\n"), current: text, missing };
}

/* THE MAP'S STATUS DATE MOVES WITH ITS BODY. The corpus standard fails a governed document whose
   body changed after its `as of` date, and a rendering IS a body change — found 2026-09-18 when the
   first render left `main` red on bare `plancheck` (the date arm reads git history, which `--local`
   skips). So `--write` moves the ONE `as of` date in the Status front matter when it changes the file. */
export function bumpAsOf(text, today) {
  const end = text.indexOf("**Place in the system**");
  const head = end < 0 ? text : text.slice(0, end);
  const re = /as of \d{4}-\d{2}-\d{2}/;
  if (!re.test(head)) return text;
  return head.replace(re, `as of ${today}`) + (end < 0 ? "" : text.slice(end));
}

export function lookup(topic, { repo = ROOT } = {}) {
  const j = judge({ repo });
  if (j.error) return { error: j.error, hits: [] };
  const q = String(topic).toLowerCase().trim();
  const hits = j.claims.filter((c) => String(c.n) === q || c.id.toLowerCase() === q
    || c.id.toLowerCase().startsWith(q + ".") || c.construct.toLowerCase().includes(q)
    || c.text.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
  return { hits };
}

function printClaim(c) {
  const flag = c.problems.length ? "  DRIFT" : "";
  console.log(`  ${c.id.padEnd(22)} ${c.state.padEnd(12)} ${c.text}${flag}`);
  for (const r of c.results) console.log(`      ${r.ok ? "ok  " : "FAIL"} ${r.evidence}`);
  if (c.reason) console.log(`      reason: ${c.reason}`);
  if (c.note) console.log(`      note: ${c.note}`);
  for (const p of c.problems) if (!c.results.some((r) => r.evidence === p)) console.log(`      FAIL ${p}`);
}

/* REALPATH, NOT THE ARGUMENT: found by this tool's own suite on its first push-guard arm. Under a
   symlinked directory (macOS: /var -> /private/var) Node resolves `import.meta.url` but not
   `process.argv[1]`, so a plain comparison made the CLI DO NOTHING AND EXIT 0 — a check that
   passes without running. pushguard.mjs already guards against the same thing the same way. */
const IS_CLI = process.argv[1] && pathToFileURL(realpathSync(process.argv[1])).href === import.meta.url;
if (IS_CLI) {
  const arg = process.argv[2];
  if (!arg || arg === "--help") {
    console.log("usage: node tools/status.mjs <topic> | --check | --write\n"
      + "  <topic>   a construct number, a claim id, or words — prints the VERIFIED state with evidence");
    process.exit(arg ? 0 : 2);
  } else if (arg === "--check" || arg === "--write") {
    const j = judge();
    if (j.error) { console.error(`status: ${j.error}`); process.exit(1); }
    const drift = j.claims.filter((c) => c.problems.length);
    const r = renderMap({ data: j.data });
    if (r.error) { console.error(`status: ${r.error}`); process.exit(1); }
    if (arg === "--write") {
      if (r.text !== r.current) writeFileSync(join(ROOT, MAP), bumpAsOf(r.text, new Date().toISOString().slice(0, 10)));
      console.log(`status: rendered ${MAP} §3 state column${r.text === r.current ? " (unchanged)" : ""}`);
    }
    const stale = arg === "--check" && r.text !== r.current;
    for (const c of drift) { console.log(`DRIFT  construct ${c.n} · ${c.id} (${c.state}): ${c.text}`);
      for (const p of c.problems) console.log(`         ${p}`); }
    if (stale) console.log(`STALE  ${MAP} §3's state column differs from its rendering — run \`node tools/status.mjs --write\` and commit.`);
    if (r.missing.length) console.log(`MISSING  construct(s) ${r.missing.join(", ")} have no row in ${MAP} §3`);
    const probes = j.claims.reduce((a, c) => a + c.results.length, 0);
    console.log(`status: ${j.claims.length} claims, ${probes} probes over ${j.data.constructs.length} constructs — `
      + `${drift.length} drift${stale ? ", §3 STALE" : ""}${r.missing.length ? ", rows MISSING" : ""}`);
    if (drift.length) console.log(`  Update ${DATA} to what the code says (and say why in the commit), or fix the code. Never delete a probe to pass.`);
    process.exit(drift.length || stale || r.missing.length ? 1 : 0);
  } else {
    const { hits, error } = lookup(process.argv.slice(2).join(" "));
    if (error) { console.error(`status: ${error}`); process.exit(1); }
    if (!hits.length) { console.log(`status: no claim matches "${process.argv.slice(2).join(" ")}". That is NOT evidence it is absent — try a construct number (1–15) or another word, or grep the code.`); process.exit(3); }
    let last = null;
    for (const c of hits) { if (c.n !== last) { console.log(`\nCONSTRUCT ${c.n} — ${c.construct}`); last = c.n; } printClaim(c); }
    process.exit(0);
  }
}
