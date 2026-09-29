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
   THE NEGATIVE CONTROL is in the suite: a row added to the tree's census without a re-pin fails, by name, through the
   same comparison, and so do a departure and a changed translation. */
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
  { after: "1.43.0", kind: "departed", by: "REVIEW #4 J1 (N322, K434)", record: "build/jobs/T13/review.md",
    line: ["C-87.12", "MINT_EXHAUSTED", "src/review/index.mjs mintExhausted > is-review-mint-exhausted",
           "The plane could not find a free identifier for this, so nothing was saved and nothing was issued. Identifiers "
           + "are drawn at random so that none of them says how many others exist, and every one it tried was already "
           + "taken. Trying again may succeed; if it keeps happening, tell whoever runs this instance."] },
  { after: "1.43.0", kind: "arrived", by: "CONTROL-PLANE #4 J3 (N333, K442)", record: "build/jobs/T13/control-plane.md",
    check: "C-69.4", code: "STORE_INTERNAL_ERROR" },
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
  const lines = now.lines.map((l) => JSON.parse(l));
  /* C-96.1 is held twice by T13 (membership's own and the catalogue's copy, K408 (4)); PROMOTION #14 counted it twice. */
  assert.equal(lines.filter(([check]) => check === "C-96.1").length, 2, "C-96.1, held twice, counts twice");
  /* And nothing else is doubled by the reader: every repeated (check, code) is two DISTINCT row objects in two files. */
  const where = new Map();
  for (const r of tree.rows) where.set(keyOf(r.check, r.code), [...(where.get(keyOf(r.check, r.code)) || []), `${r.file}#${r.table}`]);
  for (const [k, homes] of where) if (homes.length > 1) assert.equal(new Set(homes).size, homes.length, `${k} read twice from one table: ${homes}`);
});

/* R50 sorts by check, then code, and says nothing of two DIFFERENT lines sharing both: C-96.1 held twice (membership's
   `where` and the catalogue copy's) is the one such pair on this tree. The census keeps them in the order it reads its
   files (sorted by path, exports by name), which is the order PROMOTION #14's pin was computed in (reproduced on its
   stamp commit). REPORTED to BOB (a tie-break by the whole line would make the digest order-free outright). */
test("R50: the digest does not depend on the order rows are read, save R50's open tie (two lines sharing check and code keep file order)", () => {
  const ties = new Map();
  for (const r of tree.rows) ties.set(keyOf(r.check, r.code), [...(ties.get(keyOf(r.check, r.code)) || []), r]);
  const reordered = [...ties.values()].reverse().flat();   /* every key's rows moved, each tie's own order kept */
  assert.equal(censusOf(reordered).digest, now.digest);
  const openTies = [...ties].filter(([, rs]) => new Set(rs.map(lineOf)).size > 1).map(([k]) => k);
  console.log(`  R50's open tie on this tree (different lines, one check and code): ${openTies.join(", ") || "none"}`);
  assert.deepEqual(openTies, ["C-96.1 NOT_AN_ADMIN"], "a new open tie makes the digest depend on read order");
  assert.equal(censusOf(tree.rows.map((r) => ({ ...r, where: r.where ?? undefined }))).digest, now.digest, "a missing where reads null");
});

test("R50 R34: the pin names the stamp it moves with — ROW_CENSUS.version is CATALOG_VERSION", () => {
  assert.equal(ROW_CENSUS.version, CATALOG_VERSION);
});

test("R50: every row awaiting stamp is named so by its job record", () => {
  for (const a of AWAITING_STAMP.filter((x) => x.after === ROW_CENSUS.version)) {
    const check = a.kind === "departed" ? a.line[0] : a.check;
    const text = readFileSync(join(REPO, a.record), "utf8");
    assert.ok(text.split("\n").some((l) => l.includes(check) && /awaiting stamp/i.test(l)),
      `${a.record} has no line naming ${check} and "awaiting stamp" (${a.by})`);
  }
  for (const a of AWAITING_STAMP.filter((x) => x.after !== ROW_CENSUS.version))
    console.log(`  STAMPED SINCE, retire this declaration: ${a.kind} ${a.kind === "departed" ? keyOf(a.line[0], a.line[1]) : keyOf(a.check, a.code)} (after ${a.after})`);
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
});

console.log(`\nrow-census: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
