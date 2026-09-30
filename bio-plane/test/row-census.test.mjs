/* row-census — promotion R50's census suite (N319, K382, K408, K431; LEGACY-TESTS #11, T13).

   Promotion pins `ROW_CENSUS` = {version, rows, digest} beside `CATALOG_VERSION`: the census of every refusal row, in
   any module's table, as its last stamp read them (R34, R50). Promotion cannot read a later module's table (P4), so
   this suite holds the pin against the tree, computing the census EXACTLY as R50 words it (`row-census.mjs`, whose
   header states the reading; this suite reproduced promotion's own figure on its stamp commit 54abd9a659: 820 rows,
   f01ed42a…).

   WHAT PASSES. The census of the tree IS the pin; or it is the pin once the rows the open tranche's job records name
   `awaiting stamp` are taken back out (R50, K408: a row changed after the stamp by a job in a later layer, which the
   next tranche's layer-2 promotion job stamps). Each such row is declared below with the record that names it, the
   declaration is VERIFIED against that record (a line naming the check and `awaiting stamp`), and the row is LISTED.
   WHAT FAILS, naming the row: any other difference (a row that arrived, departed, or changed its check, code, `where`
   or translation with no record, or a stamp that missed one), found by diffing against the stamp's own lines
   (`fixtures/row-census-<version>.jsonl`, itself held to the pin's digest).
   NEGATIVE CONTROL: (run 2026-09-29, LEGACY-TESTS #11; the first three arms are in the suite and run with it, the
   fourth on a scratch worktree, restored by `git checkout`) (1) a row added to the census without a re-pin -> the
   comparison fails naming `arrived with no record: C-999.1 CONTROL_ARRIVAL`; (2) a stamped row taken out -> it fails
   naming `departed with no record: C-59.6 MINT_EXHAUSTED`; (3) that row's translation changed -> it fails naming
   `changed with no record: C-59.6 MINT_EXHAUSTED`, and a declared `awaiting stamp` row the tree does not bear out is a
   failure, not an exemption; (4) a row `C-59.99 CONTROL_ROW` added to record-core's own `RECORD_CORE_CHECKS` on the real
   tree -> 7 pass 1 fail, `CENSUS MOVED: arrived with no record: C-59.99 CONTROL_ROW`.
   RE-PINNED 2026-09-30 (LEGACY-TESTS #12, T14; PROMOTION #15, N318, N350): over 1.44.0, the stamp's own lines
   (`fixtures/row-census-1.44.0.jsonl`, 827 lines) reproduced by this reader on the stamp commit 872f6d4bd8 (827 rows,
   5eae043f…); the sort's tie broken by the line (N350); C-96.1's held-twice and open-tie assertions and 1.43.0's
   declarations retired.
   RE-PINNED 2026-09-30 (LEGACY-TESTS #14, T16; PROMOTION #17): over 1.46.0, the stamp's own lines
   (`fixtures/row-census-1.46.0.jsonl`, 877 lines) reproduced by this reader on the stamp commit 1dcde36e8b (877 rows,
   1002f871…); 1.45.0's declarations retired, T16's layers 3+ declared (see AWAITING_STAMP). Negative control re-run
   (private worktree): arms (1)-(3) in the suite pass; (4) C-59.99 CONTROL_ROW added to `RECORD_CORE_CHECKS` -> 7 pass
   1 fail, `CENSUS MOVED: arrived with no record: C-59.99 CONTROL_ROW`.
   RE-PINNED 2026-09-30 (LEGACY-TESTS #15, T17; PROMOTION #18, K577, K579): over 1.47.0, the stamp's own lines
   (`fixtures/row-census-1.47.0.jsonl`, 879 lines) reproduced by this reader on the stamp commit 6645daa0e0 (879 rows,
   b8bbd059…); 1.46.0's declarations (T16's layers 3+) and the queue split's composition are stamped in 1.47.0 and
   retired; T17's layers 3+ declared (see AWAITING_STAMP). */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { censusRows, censusOf, lineOf } from "./row-census.mjs";
import { ROW_CENSUS, CATALOG_VERSION } from "../src/gate.mjs";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const FIXTURE = (v) => fileURLToPath(new URL(`./fixtures/row-census-${v}.jsonl`, import.meta.url));

/* THE OPEN TRANCHE'S ROWS AWAITING STAMP, each as its job record names it. `after` is the version they were changed
   after; a declaration for an older version is stamped since and is listed to be retired, never applied. `departed`
   carries the line as the stamp read it (so the stamp's census can be rebuilt); `arrived` names the row by check and
   code (its line is the tree's). */
const AWAITING_STAMP = [
  /* RE-ANCHORED 2026-09-30 (LEGACY-TESTS #15, T17; PROMOTION #18, K577, K579): over 1.47.0, the stamp's own lines
     (`fixtures/row-census-1.47.0.jsonl`, 879 lines) reproduced by this reader on the stamp commit 6645daa0e0 (879 rows,
     b8bbd059…). T16's declarations (16 arrived: C-118.3–C-118.6, C-121.1–C-121.6, C-122.1, C-120.4–C-120.7, C-2.18;
     11 changed: C-2.15's translation, the `where`s of C-19.2, C-32.10, C-32.11, C-76.1 moved to `src/tasks/` and of
     C-32.13, C-32.15, C-53.12, C-65.1, C-92.10, C-92.11 moved to `src/ratification/refusals.mjs`) are stamped in 1.47.0
     and retired.
     T17's rows changed at layers 3+, after the layer-2 stamp, for T18's stamp (N318): C-76.1's key renamed by tasks
     (N382, K606: `NOT_YOURS` departed, `TASK_NOT_YOURS` arrived, its line otherwise unchanged); C-120.1's and C-120.2's
     `where` re-pointed to `#tensionsJudged` by case-authoring (N383). Found by diffing the tree's census against the
     1.47.0 fixture; nothing else moved. CASE-AUTHORING #6 closed without naming them so; BOB's ruling K616
     (`build/rulings.md`) names C-120.1 and C-120.2 `awaiting stamp` for T18 and is their record (LEGACY-TESTS #16). */
  { after: "1.47.0", kind: "departed", by: "TASKS #2 (N382, K606, key renamed)", record: "build/jobs/T17/tasks.md",
    line: ["C-76.1","NOT_YOURS","src/tasks/index.mjs #refuseNotYours > is-task-actor-fence","This task is not yours to act on: it is with another member now, so nothing was done to it. The record says below who holds it. Ask them, or an administrator, if it still needs you."] },
  { after: "1.47.0", kind: "arrived", by: "TASKS #2 (N382, K606, key renamed)", record: "build/jobs/T17/tasks.md", check: "C-76.1", code: "TASK_NOT_YOURS" },
  { after: "1.47.0", kind: "changed", by: "CASE-AUTHORING #6 (N383, `where` re-pointed to #tensionsJudged)", record: "build/rulings.md",
    line: ["C-120.1","TENSION_NOT_DISCLOSED","src/case-authoring/index.mjs #publishCase > is-tension-disclosed","A finding in this case rests on something the record holds in unresolved conflict, and a case may be published with it only if the conflict is disclosed. Each one is named. One in conflict with a record you cannot see is named by its finding, and the published case will highlight it without naming that record. Disclose it, or resolve it first. Nothing was published."] },
  { after: "1.47.0", kind: "changed", by: "CASE-AUTHORING #6 (N383, `where` re-pointed to #tensionsJudged)", record: "build/rulings.md",
    line: ["C-120.2","DISCLOSURE_NOT_STANDING","src/case-authoring/index.mjs #publishCase > is-disclosure-standing","One of the conflicts disclosed is not an unresolved conflict on this case's findings: it may have been resolved since. Read the list again. Nothing was published."] },
];
/* COMPOSITIONS AWAITING STAMP: a change to which checks a gate runs moves no row, so the census cannot see it; each is
   declared here by name, verified against its record like a row, and listed (R50, K408, K464). Queue's registered step
   (1.44.0's declaration) is stamped in 1.45.0 and retired (LEGACY-TESTS #13, T15). LEGACY-TESTS #14 (T16, 2026-09-30):
   inquiry's step (1.45.0's declaration) is stamped in 1.46.0 and retired; the queue split's is declared for T17.
   LEGACY-TESTS #15 (T17, 2026-09-30): the queue split's (1.46.0's declaration) is stamped in 1.47.0 (PROMOTION #18) and
   retired; no T17 job names a composition change. */
const COMPOSITIONS_AWAITING = [
];
/* The plane's suite shape: every arm printed PASS or FAIL with its reason, the tally last, the exit its verdict. */
let pass = 0, fail = 0;
const test = (label, fn) => {
  try { fn(); pass++; console.log(`  PASS  ${label}`); }
  catch (e) { fail++; console.log(`  FAIL  ${label}\n         ${String(e && e.message || e).split("\n").join("\n         ")}`); }
};
const keyOf = (check, code) => `${check} ${code}`;
const keyOfLine = (l) => { const [check, code] = JSON.parse(l); return keyOf(check, code); };

/** The comparison, as a function so the negative control drives the SAME code: `lines` are the tree's census lines. */
function compare(lines, { pin = ROW_CENSUS, awaiting = AWAITING_STAMP, stamped = null } = {}) {
  const live = awaiting.filter((a) => a.after === pin.version);
  const byKey = new Map(lines.map((l) => [keyOfLine(l), l]));
  const listed = [], problems = [];
  const rebuilt = [...lines];   /* a multiset: two row objects with one line (C-41.x, held twice) are two lines */
  const drop = (l) => { const i = rebuilt.indexOf(l); if (i >= 0) rebuilt.splice(i, 1); };
  for (const a of live) {
    if (a.kind === "arrived") {
      const l = byKey.get(keyOf(a.check, a.code));
      if (!l) problems.push(`declared arrived after ${a.after} but not in the tree: ${keyOf(a.check, a.code)} (${a.by})`);
      else { drop(l); listed.push(`awaiting stamp, arrived: ${keyOf(a.check, a.code)} (${a.by})`); }
    } else if (a.kind === "departed") {
      const l = JSON.stringify(a.line);
      if (byKey.has(keyOf(a.line[0], a.line[1]))) problems.push(`declared departed after ${a.after} but still in the tree: ${keyOf(a.line[0], a.line[1])} (${a.by})`);
      else { rebuilt.push(l); listed.push(`awaiting stamp, departed: ${keyOf(a.line[0], a.line[1])} (${a.by})`); }
    } else if (a.kind === "changed") {
      const was = JSON.stringify(a.line), l = byKey.get(keyOf(a.line[0], a.line[1]));
      if (!l || l === was) problems.push(`declared changed after ${a.after} but ${l ? "unchanged" : "not"} in the tree: ${keyOf(a.line[0], a.line[1])} (${a.by})`);
      else { drop(l); rebuilt.push(was); listed.push(`awaiting stamp, changed: ${keyOf(a.line[0], a.line[1])} (${a.by})`); }
    }
  }
  const c = censusOf(rebuilt.map((l) => { const [check, code, where, translation] = JSON.parse(l); return { check, code, where, translation }; }));
  const held = c.rows === pin.rows && c.digest === pin.digest;
  const named = [];
  if (!held && stamped) {
    const S = new Map(stamped.map((l) => [keyOfLine(l), l])), R = new Map(c.lines.map((l) => [keyOfLine(l), l]));
    const plural = (m) => { const n = new Map(); for (const k of m) n.set(k, (n.get(k) || 0) + 1); return n; };
    const sCount = plural(stamped.map(keyOfLine)), rCount = plural(c.lines.map(keyOfLine));
    for (const [k, l] of R) if (!S.has(k)) named.push(`arrived with no record: ${k}`);
      else if (S.get(k) !== l && !stamped.includes(l)) named.push(`changed with no record: ${k}`);
    for (const k of S.keys()) if (!R.has(k)) named.push(`departed with no record: ${k}`);
    for (const [k, n] of rCount) if (S.has(k) && n !== sCount.get(k)) named.push(`held ${n} times, stamped ${sCount.get(k)}: ${k}`);
  }
  return { held: held && !problems.length, census: c, listed, problems, named };
}

const tree = await censusRows(REPO);
const now = censusOf(tree.rows);
const stampedPath = FIXTURE(ROW_CENSUS.version);
const stamped = existsSync(stampedPath) ? readFileSync(stampedPath, "utf8").split("\n").filter(Boolean) : null;
console.log(`  CENSUS (R50): ${tree.files.length} files, ${now.rows} rows, sha256 ${now.digest}`);
console.log(`  PIN: ${ROW_CENSUS.version}, ${ROW_CENSUS.rows} rows, sha256 ${ROW_CENSUS.digest}`);
console.log(`  not importable under node (no row literal in any, else BLIND below): ${tree.unimportable.map((u) => u.file).join(", ") || "none"}`);
console.log(`  scripts that run when imported, left out: ${tree.scripts.map((s) => s.file).join(", ") || "none"}`);

test("R50: the census is a census — its files, its tables read, no file holding rows left unread", () => {
  assert.ok(tree.files.length >= 200, `only ${tree.files.length} files: the module paths were not read`);
  assert.ok(now.rows >= 800, `only ${now.rows} rows: the tables were not read`);
  assert.deepEqual(tree.blind, [], "a file node cannot import holds a row literal, so its rows are not in the census");
  assert.deepEqual(tree.scripts.filter((s) => s.checkKey).map((s) => s.file), [],
    "a script left out holds a `check:` key, so leaving it out could move the census");
});

test("R50: one row object in two tables, or one table under two exports, counts once; two row objects with one check count twice", () => {
  /* RETIRED 2026-09-30 (LEGACY-TESTS #12, T14; K408 (4), K458): the assertion that C-96.1 is held twice. The catalogue's
     copy left (LEGACY-CHECKS #8) and 1.44.0 counts membership's row once. What stays is the reader's own half: nothing
     is doubled by the reader, every repeated (check, code) being two DISTINCT row objects in two tables. */
  const where = new Map();
  for (const r of tree.rows) where.set(keyOf(r.check, r.code), [...(where.get(keyOf(r.check, r.code)) || []), `${r.file}#${r.table}`]);
  for (const [k, homes] of where) if (homes.length > 1) assert.equal(new Set(homes).size, homes.length, `${k} read twice from one table: ${homes}`);
  assert.equal(now.lines.filter((l) => l.startsWith('["C-96.1",')).length, 1, "C-96.1 is held once, membership's");
});

/* R50 sorts by check, then code, then the line itself (N350, PROMOTION #15): no two lines tie, so the digest does not
   depend on the order the rows are read in. RE-ANCHORED 2026-09-30 (LEGACY-TESTS #12, T14): the "open tie" this arm
   pinned (C-96.1 held twice, T13) is gone with the catalogue's copy, and the sort's third key closes the class. */
test("R50: the digest does not depend on the order rows are read — the sort's third key is the line itself", () => {
  assert.equal(censusOf([...tree.rows].reverse()).digest, now.digest);
  const shuffled = tree.rows.map((r, i) => [((i * 7919) % 104729), r]).sort((x, y) => x[0] - y[0]).map(([, r]) => r);
  assert.equal(censusOf(shuffled).digest, now.digest);
  /* The third key does work: two lines sharing check and code sort by the line in either read order. */
  const a = { check: "C-1.1", code: "X", where: "a", translation: "t" }, b = { ...a, where: "b" };
  assert.deepEqual(censusOf([b, a]).lines, censusOf([a, b]).lines);
  assert.equal(censusOf(tree.rows.map((r) => ({ ...r, where: r.where ?? undefined }))).digest, now.digest, "a missing where reads null");
});

test("R50 R34: the pin names the stamp it moves with — ROW_CENSUS.version is CATALOG_VERSION", () => {
  assert.equal(ROW_CENSUS.version, CATALOG_VERSION);
});

/* LEGACY-TESTS #14 (T16, 2026-09-30), K567: a record may name its row with the exact phrase
   "for promotion's stamp" (RATIFICATION #7's wording, build/jobs/T16/ratification.md:20) beside
   `awaiting stamp`; nothing broader is accepted. */
const AWAITING = /awaiting stamp|for promotion's stamp/i;
test("R50: every row awaiting stamp is named so by its job record", () => {
  for (const a of AWAITING_STAMP.filter((x) => x.after === ROW_CENSUS.version)) {
    const check = a.named ?? (a.kind === "arrived" ? a.check : a.line[0]);
    const text = readFileSync(join(REPO, a.record), "utf8");
    assert.ok(text.split("\n").some((l) => l.includes(check) && AWAITING.test(l)),
      `${a.record} has no line naming ${check} and "awaiting stamp" (${a.by})`);
  }
  for (const c of COMPOSITIONS_AWAITING.filter((x) => x.after === ROW_CENSUS.version)) {
    const text = readFileSync(join(REPO, c.record), "utf8");
    assert.ok(text.split("\n").some((l) => l.includes(c.needle) && AWAITING.test(l)),
      `${c.record} has no line naming the ${c.needle} and "awaiting stamp" (${c.by})`);
    console.log(`  awaiting stamp, composition: ${c.what} (${c.by})`);
  }
  for (const c of COMPOSITIONS_AWAITING.filter((x) => x.after !== ROW_CENSUS.version))
    console.log(`  STAMPED SINCE, retire this declaration: composition ${c.what} (after ${c.after})`);
  for (const a of AWAITING_STAMP.filter((x) => x.after !== ROW_CENSUS.version))
    console.log(`  STAMPED SINCE, retire this declaration: ${a.kind} ${a.kind === "arrived" ? keyOf(a.check, a.code) : keyOf(a.line[0], a.line[1])} (after ${a.after})`);
});

test("R50: the stamp's own lines are the pin — the snapshot this suite names rows against is the stamp's", () => {
  if (!stamped) { console.log(`  no snapshot of ${ROW_CENSUS.version}: a failure below cannot name its rows until one is taken`); return; }
  const c = censusOf(stamped.map((l) => { const [check, code, where, translation] = JSON.parse(l); return { check, code, where, translation }; }));
  assert.deepEqual({ rows: c.rows, digest: c.digest }, { rows: ROW_CENSUS.rows, digest: ROW_CENSUS.digest });
});

test("R50: the tree holds the pin, the rows awaiting stamp listed — any other difference fails naming the row", () => {
  const r = compare(now.lines, { stamped });
  for (const l of r.listed) console.log(`  ${l}`);
  for (const l of [...r.problems, ...r.named]) console.log(`  CENSUS MOVED: ${l}`);
  assert.deepEqual(r.problems, []);
  assert.ok(r.held, `the census, less the rows awaiting stamp, is ${r.census.rows} rows sha256 ${r.census.digest}, `
    + `not the pin ${ROW_CENSUS.rows} ${ROW_CENSUS.digest}: ${r.named.join("; ") || "(no snapshot to name the rows)"}`);
});

test("R50 NEGATIVE CONTROL: a row added without a re-pin fails, naming it; so do a departure and a changed translation", () => {
  const added = lineOf({ check: "C-999.1", code: "CONTROL_ARRIVAL", where: "src/nowhere.mjs control", translation: "A control arm's row." });
  const a = compare([...now.lines, added], { stamped });
  assert.equal(a.held, false);
  assert.ok(a.named.includes("arrived with no record: C-999.1 CONTROL_ARRIVAL"), a.named.join("; "));
  const gone = now.lines.find((l) => l.startsWith('["C-59.6",'));
  const d = compare(now.lines.filter((l) => l !== gone), { stamped });
  assert.equal(d.held, false);
  assert.ok(d.named.includes("departed with no record: C-59.6 MINT_EXHAUSTED"), d.named.join("; "));
  const moved = JSON.parse(gone); moved[3] = `${moved[3]} (a control arm's edit)`;
  const m = compare(now.lines.map((l) => (l === gone ? JSON.stringify(moved) : l)), { stamped });
  assert.equal(m.held, false);
  assert.ok(m.named.includes("changed with no record: C-59.6 MINT_EXHAUSTED"), m.named.join("; "));
  /* And a declaration the tree does not bear out is itself a failure, not an exemption. */
  const x = compare(now.lines, { stamped, awaiting: [...AWAITING_STAMP,
    { after: ROW_CENSUS.version, kind: "arrived", by: "a control arm", record: "-", check: "C-999.2", code: "NOWHERE" }] });
  assert.equal(x.held, false);
  assert.ok(x.problems.some((p) => p.includes("C-999.2 NOWHERE")), x.problems.join("; "));
  /* A row declared changed whose line the tree still bears as stamped is a failure too (LEGACY-TESTS #13, T15). */
  const y = compare(now.lines, { stamped, awaiting: [...AWAITING_STAMP,
    { after: ROW_CENSUS.version, kind: "changed", by: "a control arm", record: "-", line: JSON.parse(gone) }] });
  assert.equal(y.held, false);
  assert.ok(y.problems.some((p) => p.includes("unchanged in the tree: C-59.6 MINT_EXHAUSTED")), y.problems.join("; "));
});

console.log(`\nrow-census: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
