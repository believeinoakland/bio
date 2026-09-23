/* GATE: never-cache (history) — M0-126, BOB #30 (TREE-SHARING §3a condition 1): its verdict reads git ls-tree/show of historical commits in this checkout (the STATE half at `STATE_PIN`), which no
   result key can name; traced 2026-09-23. M0-136 (2026-09-23): it no longer reads the LIVE `origin/coord` — the coord state
   is read at `COORD_PIN` (`./coordpin.mjs`, named there with its why and its cost), and a planted-ref arm below proves the
   verdict identical whatever `origin/coord` holds.
   NEGATIVE CONTROL (M0-136, RUN 2026-09-23 by the M0-136 worker): `node bio-plane/test/coordpin.control.mjs decided` —
   this suite pointed back at the live `origin/coord` (arm L1, one line after the pin's import) -> exactly two FAILs,
   "…reads the PINNED coord commit, never a ref name" and "…is IDENTICAL whatever origin/coord holds", 61 pass / 2 fail, exit 1;
   the pin spelled out in the suite instead (S0, over-strictness) PASSES; each restored, sha256 and `cmp` identical. */
/* decided — the ruling index, `tools/decided.mjs` (M0-97 and D-341, 2026-09-21; M0-99, 2026-09-22).
 *
 * M0-99 — `docs/DECIDED.md` is no longer COMMITTED: 88 commits touched the generated file on 2026-09-21
 *   and every lane's landing re-merged it. Section 8 drives the change: the index is produced on demand
 *   through ONE freshness call (`fresh()`: absent or stale is written by rename, current is left alone),
 *   rulings edited on two branches merge with no index conflict and the query answers from the merged
 *   corpus (the row's acceptance, over the REAL `.gitignore`), and the liar — the index kept committed
 *   under `merge=ours` — merges clean too, which is why the arm that catches it asserts the file is
 *   UNTRACKED and ignored by a `.gitignore` the repository carries (`indexTracking()`, plancheck arm 2b).
 *
 * `CLAUDE.md` §1 names `node tools/decided.mjs "<subject>"` the ONE source for what has been
 * decided, so an index that cannot return a ruling it should hold, or returns one it should
 * not, sends a session to re-ask a settled question. Four defects, one file, one suite:
 *   M0-97 — Bob's decision register records an answer in a LOWERCASE `decided:` field and the
 *     marker scan reads uppercase words only: 0 of the 72 answered or enacted entries were filed
 *     under their own id from inside the entry, and "severance" never returned DEC-70, which
 *     rules it — a real re-ask (M-85). Now each such entry is ONE ruling under its own id.
 *   D-341 — a wrapped ruling was quoted from the next three lines whatever they were, so a ruling
 *     on a block's last line absorbed the next block's `## CLAIM` header. Now the window ends at
 *     a heading or a blank line, except that a TITLE's content is the paragraph beneath it.
 *   FOUND BY THE CLASS SWEEP, in the same function and the same query: a long ledger row's search
 *     context could miss the very line it surrounds (130 of 1,383 rows), and an id query with
 *     nothing filed under it matched OTHER ids by prefix (`DEC-2` answered with DEC-20 to DEC-29).
 *
 * THE LIMIT, STATED FIRST: the headline equality is against the register's own headings, read
 * here by `git grep` rather than by the tool, so it sees TRACKED files only; and it proves the
 * entry pass FILES every ruling entry, not that a session will phrase its question so as to hit it.
 *
 * NEGATIVE CONTROL: `node bio-plane/test/decided.control.mjs` from the repo root breaks `tools/decided.mjs` (or, for arm 16, the repository's `.gitignore`) one arm at a time and each arm must turn a NAMED assertion here red
 *   (1) the register-entry pass never files an entry -> "EVERY ANSWERED OR ENACTED ENTRY IS RETURNED" fails naming DEC-70, and "DEC-70 IS RETURNED" fails by name
 *   (2) MARKER lower-cased with the entry pass intact -> "LOWERCASE PROSE IS NOT A RULING" fails
 *   (3) the row's liar, the entry pass REPLACED by a lower-cased MARKER -> "THE INDEX GROWS ONLY BY THE ENTRIES IT DID NOT FILE BEFORE" fails, with the flood and the equality
 *   (4) the verdict ignored, every entry carrying `decided:` filed -> "A DEFERRED ENTRY IS NOT RETURNED" fails naming DEC-2
 *   (5) the already-filed check dropped -> "FILES NONE TWICE" fails on the fixture whose answer a marker already filed
 *   (6) the window's stop dropped whole, D-341's own control -> "A CLAIM APPENDED AFTER A TRAILING released: LINE" fails
 *   (7) the heading edge alone dropped -> "A CLAIM APPENDED WITH NO BLANK LINE" fails
 *   (8) the blank-line edge alone dropped -> "THE NEXT PARAGRAPH IS NOT ABSORBED" fails
 *   (9) the window stops at every line break, the row's other liar -> "A HAND-WRAPPED RULING QUOTES WHOLE" fails
 *   (10) the heading test narrowed to the row's literal `^#` -> "A LINE OPENING ON A SESSION NUMBER IS NOT A HEADING" fails
 *   (11) the title rule dropped -> "A TITLE'S RULING IS FILED UNDER THE ID ITS SECTION OPENS WITH" fails
 *   (12) the search context's fix reverted -> "A LONG LEDGER ROW IS FOUND BY ITS OWN WORDS" fails
 *   (13) the id query reverted to a bare substring -> "AN ID QUERY MATCHES THE WHOLE ID" fails
 *   (14) an entry's date borrowed from the whole entry instead of `decided:` -> "AN UNDATED decided: STAYS UNDATED" fails, and DEC-73's CLI answer with it
 *   (15) an entry's FIRST answer read instead of its last -> "AN ENTRY ANSWERED TWICE IS ONE RULING, QUOTING THE LAST ANSWER" fails, and DEC-31's with it
 *   RUN 2026-09-21 by the M0-97 worker: see this item's claim block in `docs/development/CLAIMS.md` for the figures.
 *   (16) M0-99's own: the `.gitignore` line removed -> "THE ACCEPTANCE — rulings edited on two branches MERGE WITH NO DECIDED.md CONFLICT" fails, with "...AND ITS OWN .gitignore IGNORES IT"
 *   (17) the freshness call never writes -> "THE FRESHNESS CALL WRITES AN ABSENT INDEX" fails, and "A STALE INDEX IS REWRITTEN" with it
 *   (18) the freshness call rewrites a current index -> "A CURRENT INDEX IS NOT REWRITTEN" fails
 *   (19) the predicate blind to a tracked index -> "...and the predicate plancheck arm 2b reads NAMES it" fails (the liar's arm)
 *   (20) any ignore rule counted as the repository's -> "A RULE IN .git/info/exclude IS NOT THE REPOSITORY IGNORING IT" fails
 *   (21) a negated rule read as an ignore -> "A NEGATED RULE IS NOT AN IGNORE" fails
 *   (22) `--check` falls through to the query -> "`--check` is RETIRED, LOUDLY" fails
 *   (23) only the root `.gitignore` counted, the over-strictness arm's own control -> "OVER-STRICTNESS: a rule in a NESTED, committed .gitignore" fails
 *   RUN 2026-09-22 by the M0-99 worker, all 23 arms again: 23 of 23 AS DECLARED, driver 155 pass / 0 fail, baseline and
 *   closing 59 / 0, every restore byte-identical by sha256 and `cmp`, "the oracle ran" green under every arm; arms 16-23
 *   failed 5, 7, 1, 1, 1, 1, 1 and 1 assertions, and arms 1-15 still fail at their named assertions after this landing.
 */

import "./stdio.mjs";
import "./sandbox.mjs";
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync, statSync, utimesSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { scan, registerEntries, query, render, fresh, indexTracking, INDEX_PATH, corpus } from "../../tools/decided.mjs";
import { isMovedPath } from "../../tools/statepaths.mjs";   /* M0-121: the predicate's walk-free home; coord.mjs re-exports it */
import { plantedCoord, assertPlanted, REPO as PIN_REPO } from "./coordpin.mjs";   /* M0-136: coord read at a PINNED commit */
import { relative, sep } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const TOOL = join(ROOT, "tools/decided.mjs");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want).slice(0, 600)}\n         got  ${JSON.stringify(got).slice(0, 600)}`}`);
  ok ? pass++ : fail++;
};
const SECTIONS = 9;
let reached = 0;
const section = (n) => { reached++; console.log(`\n--- ${n} ---`); };
const cli = (...args) => {
  const r = spawnSync(process.execPath, [TOOL, ...args], { cwd: ROOT, encoding: "utf8" });
  return { code: r.status, out: `${r.stdout || ""}${r.stderr || ""}` };
};
/* A synthetic corpus: `scan()` over one path with a reader that returns the fixture, so nothing
   on disk moves. The path is a real register file's, so a row's `file` reads like the real one. */
const FIX = join(ROOT, "docs/development/DECISIONS.md");
const over = (text, opts) => scan([FIX], () => text, opts);

/* The real corpus, read ONCE, with every register entry the tool saw.
   CORRECTED 2026-09-22 by M0-110 (TREE-SHARING.md §1; BOB #28's ruling 2). The corpus holds the STATE files — CLAIMS.md
   (154 of the index's rulings), the ledgers, the August decision register — which live on the branch `coord` after the
   cutover, where `decided.mjs` reads them through the coord layer. A battery suite that judged the index over their
   LIVE text would judge `coord`, which no `main` gate record settles: one coord write could turn this suite red with
   `main` unmoved. So the STATE half of the corpus is read here from a PINNED tree — `de40aa56`, the `main` M0-110 was
   built from, when every state file was still on it — and the rest from the working tree as before. Every arm below
   asks what it always asked, of the same volume of real rulings, and none of it moves when a lane writes to `coord`.
   A state file the pinned tree lacks (a shallow clone) is SKIPPED and the oracle's floor then fails by name — never a
   silent pass. The live, moving state is `decided.mjs`'s own business (it reads through the layer); the index over it
   is not judged by the battery. */
/* CORRECTED 2026-09-23 (M0-136): the FULL id, never the 8-hex abbreviation it was — git resolves an abbreviation against
   the whole object store, so a fetch bringing in a second object with that prefix would make it ambiguous and this suite
   read nothing at the pin: a verdict moving with what was fetched. */
const STATE_PIN = "de40aa56f5d397666228502132d56756f51ff6b9";
const pinCache = new Map();
const atPin = (rel) => {
  if (!pinCache.has(rel)) { const r = spawnSync("git", ["show", `${STATE_PIN}:${rel}`], { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 28 }); pinCache.set(rel, r.status === 0 ? r.stdout : null); }
  return pinCache.get(rel);
};
const relOf = (abs) => relative(ROOT, abs).split(sep).join("/");
const PINNED_STATE = (() => { const r = spawnSync("git", ["ls-tree", "-r", "--name-only", STATE_PIN, "--", "docs"], { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 26 });
  return (r.status === 0 ? r.stdout.split("\n").filter(Boolean) : []).filter((f) => isMovedPath(f) && /\.(md|html)$/.test(f)); })();
const CORPUS = [...corpus().filter((f) => !isMovedPath(relOf(f))), ...PINNED_STATE.map((f) => join(ROOT, f))];
const READ = (f) => { const rel = relOf(f); return isMovedPath(rel) ? (atPin(rel) ?? "") : readFileSync(f, "utf8"); };
const REGISTER = [];
const ROWS = scan(CORPUS, READ, { sink: REGISTER });
const BEFORE = scan(CORPUS, READ, { entries: false });
const lineOf = (() => { const c = {}; return (f, n) => (c[f] ??= READ(join(ROOT, f)).split("\n"))[n - 1]; })();

/* ========================================================================== */
section("1 — M0-97: EVERY ANSWERED OR ENACTED REGISTER ENTRY IS FILED UNDER ITS OWN ID");
{
  /* THE ORACLE IS THE FILE'S OWN HEADINGS, read by `git grep` — not by the tool's parser. */
  /* M0-110: `main`'s files by `git grep` (the state files excluded — they are pointers after the cutover), and the
     pinned state files by `git grep` AT THE PIN, whose lines print as `<pin>:<path>:<n>:` and are read back without the
     pin. Still git's own search, never the tool's parser. */
  const EXCL = [":(exclude)docs/development/CLAIMS.md", ":(exclude)docs/development/QUEUE.md", ":(exclude)docs/development/BACKLOG.md",
                ":(exclude)docs/development/DEBT.md", ":(exclude)docs/development/PLACEMENT.md", ":(exclude)docs/archive/ledgers",
                ":(exclude)docs/development/kickoffs/*-NEXT.md"];
  const g = spawnSync("git", ["grep", "-n", "-E", "^#{1,6} DEC-[0-9]+ · ", "--", "docs", "CLAUDE.md", ...EXCL], { cwd: ROOT, encoding: "utf8" });
  const gp = spawnSync("git", ["grep", "-n", "-E", "^#{1,6} DEC-[0-9]+ · ", STATE_PIN, "--", ...PINNED_STATE], { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 26 });
  t("the oracle ran (git grep exit 0 — a search that failed returns no headings, which would pass everything)", [g.status, gp.status], [0, 0]);
  const heads = [(g.stdout || "").trim(), (gp.stdout || "").trim().split("\n").map((l) => l.startsWith(`${STATE_PIN}:`) ? l.slice(STATE_PIN.length + 1) : l).join("\n")]
    .join("\n").split("\n").filter(Boolean).map((l) => {
    const m = /^([^:]+):(\d+):#{1,6} (DEC-\d+) · (.*)$/.exec(l);
    return m && { file: m[1], line: +m[2], id: m[3], status: m[4] };
  }).filter(Boolean);
  const words = (s) => s.split("·").map((w) => (/^[a-z]+/i.exec(w.trim()) || [""])[0].toLowerCase());
  const ruling = heads.filter((h) => { const w = words(h.status); return !w.some((x) => x === "open" || x === "deferred") && w.some((x) => x === "answered" || x === "enacted"); });
  const deferred = heads.filter((h) => words(h.status).includes("deferred"));
  const perFile = {};
  for (const h of ruling) perFile[h.file] = (perFile[h.file] || 0) + 1;
  console.log(`  oracle: ${heads.length} register headings; ${ruling.length} answered or enacted (${Object.entries(perFile).map(([f, n]) => `${f}: ${n}`).join(", ")}); ${deferred.length} deferred`);
  t("the oracle is non-empty and floored — an equality over an empty corpus passes for free", [ruling.length >= 72, perFile["docs/development/DECISIONS.md"] >= 17], [true, true]);

  /* Returned by the query the CLI answers from, pointing INSIDE the entry itself, and quoting it. */
  const next = (h) => { const later = heads.filter((x) => x.file === h.file && x.line > h.line).map((x) => x.line); return later.length ? Math.min(...later) : Infinity; };
  /* "Quotes it" is judged against the entry's own BYTES, whitespace collapsed — not against the
     tool's parse of them — so a row that summarised, or quoted a neighbour, fails here. */
  const flat = (s) => s.replace(/\s+/g, " ");
  const segment = (h) => { const L = READ(join(ROOT, h.file)).split("\n"); return flat(L.slice(h.line - 1, Math.min(L.length, next(h) - 1)).join(" ")); };
  const returned = [], missing = [];
  for (const h of ruling) {
    const { filed, hits } = query(h.id, ROWS);
    const own = hits.filter((r) => r.via === "entry" && r.file === h.file && r.line > h.line && r.line < next(h));
    const quotes = own.length === 1 && own[0].text.length > 0 && segment(h).includes(flat(own[0].text.replace(/…$/, "")));
    (filed && own.length === 1 && quotes ? returned : missing).push(h.id);
  }
  console.log(`  PRINTED EQUALITY: ${ruling.length} answered or enacted headings · ${returned.length} returned by \`decided.mjs "DEC-n"\` from inside their own entry`);
  t(`EVERY ANSWERED OR ENACTED ENTRY IS RETURNED BY ITS OWN ID, from inside itself (missing: ${missing.join(", ") || "none"})`,
    [returned.length, missing], [ruling.length, []]);
  const d70 = query("DEC-70", ROWS).hits.filter((r) => r.via === "entry" && r.file === "docs/development/DECISIONS.md");
  t("DEC-70 IS RETURNED from its own entry — the ruling M-85's re-ask never saw — dated 2026-09-10 and quoting its answer",
    d70.map((r) => [r.date, /SEVERANCE DISCHARGES SUPPORT/.test(r.text)]), [["2026-09-10", true]]);
  const d31 = query("DEC-31", ROWS).hits.filter((r) => r.via === "entry");
  t("DEC-31 — DEFERRED on 2026-08-03, ANSWERED on 2026-09-17 in the same entry — is filed ONCE, as the answer in force",
    d31.map((r) => [r.date, /^ANSWERED 2026-09-17/.test(r.text)]), [["2026-09-17", true]]);

  /* A deferred entry is not a ruling. */
  const filedDeferred = deferred.filter((h) => ROWS.some((r) => r.id === h.id && r.file === h.file && r.line > h.line && r.line < next(h)));
  t(`A DEFERRED ENTRY IS NOT RETURNED — no row under its id points inside it (${deferred.map((h) => h.id).join(", ")} checked; filed: ${filedDeferred.map((h) => h.id).join(", ") || "none"})`,
    [deferred.length >= 2, filedDeferred.map((h) => h.id)], [true, []]);
  const reg = REGISTER.filter((e) => e.verdict !== "ruling");
  t("...and the tool itself classifies exactly those as not-a-ruling, with nothing UNCLASSIFIED",
    [reg.filter((e) => e.verdict === "not-a-ruling").map((e) => e.id).sort(), REGISTER.filter((e) => e.verdict === "unclassified").map((e) => e.id)],
    [deferred.map((h) => h.id).sort(), []]);

  /* An entry row outside a register file is a SPECIMEN — D-367's class, arriving in the new pass. */
  const files = [...new Set(ROWS.filter((r) => r.via === "entry").map((r) => r.file))].sort();
  console.log(`  entry rows are drawn from: ${files.join(", ")}`);
  t("NO ENTRY ROW OUTSIDE A REGISTER FILE — a line-start entry heading written as an example elsewhere would mint a phantom ruling",
    files.filter((f) => !/(^|\/)DECISIONS[^/]*\.md$/.test(f)), []);
}

/* ========================================================================== */
section("2 — M0-97: THE INDEX GROWS ONLY BY THE ENTRIES IT DID NOT FILE BEFORE, AND FILES NONE TWICE");
{
  const id3 = (r) => `${r.file}:${r.line}|${r.id}|${r.text}`;
  const before = new Set(BEFORE.map(id3));
  const markerNow = ROWS.filter((r) => r.via === "marker");
  t("the marker scan is UNCHANGED by the entry pass — beside it, never replacing it",
    [markerNow.length, markerNow.every((r) => before.has(id3(r)))], [BEFORE.length, true]);
  const grown = ROWS.filter((r) => !before.has(id3(r)));
  const due = REGISTER.filter((e) => e.verdict === "ruling"
    && !BEFORE.some((r) => r.file === e.file && r.id === e.id && r.line === (e.response && e.response.value ? e.response : e.decided).line));
  console.log(`  the index: ${BEFORE.length} rows before the entry pass, ${ROWS.length} after — grown by ${grown.length}; ruling entries not filed before: ${due.length}`);
  t("THE INDEX GROWS ONLY BY THE ENTRIES IT DID NOT FILE BEFORE — every added row is one such entry, and each such entry is added",
    [grown.every((r) => r.via === "entry"), grown.map((r) => `${r.file}|${r.id}`).sort(), grown.length],
    [true, due.map((e) => `${e.file}|${e.id}`).sort(), due.length]);
  const seen = new Map();
  for (const r of ROWS) { const k = `${r.file}:${r.line}|${r.id}`; seen.set(k, (seen.get(k) || 0) + 1); }
  t("FILES NONE TWICE — no (file, line, id) appears twice anywhere in the real index",
    [...seen].filter(([, n]) => n > 1).map(([k]) => k), []);

  /* The fixture: an entry whose answer a marker ALREADY filed under its own id adds nothing. */
  const already = [
    "### DEC-903 · answered",
    "response: DEC-903 was RULED by the fixture on its answer line, so the marker scan files it already.",
    "decided: 2026-09-21 · the fixture",
  ].join("\n");
  const rows = over(already);
  t("FILES NONE TWICE — an entry whose answer line a marker already filed under the same id yields ONE row",
    rows.map((r) => [r.id, r.line, r.via]), [["DEC-903", 2, "marker"]]);

  /* The liar the row names: a MARKER that matches lowercase floods the index. */
  const lower = over("The chair decided to wait, and the motion was ruled out of order; the minutes were corrected later.\n");
  t("LOWERCASE PROSE IS NOT A RULING — `decided`, `ruled` and `corrected` in ordinary prose file nothing",
    lower.length, 0);
}

/* ========================================================================== */
section("3 — M0-97: THE ENTRY SHAPE, ONE CASE AT A TIME (a fixture, nothing on disk moves)");
{
  const reg = [
    "## Open",
    "### DEC-904 · answered",
    "raised: 2026-01-02 · the fixture",
    "question: does a multi-line answer quote from its joined lines?",
    "response: **DEFERRED at first, as DEC-31 was.**",
    "decided: 2026-08-03 · the fixture",
    "response: **YES — THE ANSWER CONTINUES ON AN INDENTED LINE,",
    "  AND THE QUOTE READS ACROSS IT.** Then a second sentence.",
    "decided: 2026-09-20 · the fixture",
    "  (a continuation of the decided field)",
    "",
    "### DEC-905 · answered · enacted",
    "response: filed once, under both words.",
    "decided: 2026-09-21",
    "",
    "### DEC-906 · enacted",
    "response: enacted alone is a ruling.",
    "decided: 2026-09-21",
    "",
    "### DEC-907 · open",
    "question: an open entry carries no answer.",
    "provisional: nothing is blocked",
    "",
    "### DEC-908 · deferred",
    "response: deferred, with a decided line of its own.",
    "decided: 2026-09-21 · the fixture",
    "trigger: never",
    "",
    "### DEC-909 · withdrawn",
    "response: a status outside the vocabulary.",
    "decided: 2026-09-21",
    "",
    "### DEC-910 · answered",
    "response: answered, and no decided line at all.",
    "",
    "### DEC-911 · answered",
    "raised: 2026-09-01 · the fixture",
    "response: an answer whose decided line names no date.",
    "decided: the status quo is the decision",
  ].join("\n");
  const sink = [];
  const rows = over(reg, { sink });
  t("exactly the ruling entries are filed, each ONCE — answered, answered · enacted, enacted, and the undated one",
    rows.map((r) => r.id), ["DEC-904", "DEC-905", "DEC-906", "DEC-911"]);
  /* `?.` throughout, and it is not style: CORRECTED 2026-09-21 after `decided.control.mjs` arms 1 and
     3 left no entry rows, `rows.find` returned nothing, and `r904.line` THREW — the suite died before
     its tally, which reads as a suite that never ran. An absent row must FAIL an assertion here. */
  const r904 = rows.find((r) => r.id === "DEC-904");
  t("AN ENTRY ANSWERED TWICE IS ONE RULING, QUOTING THE LAST ANSWER — from its JOINED lines, at that `response:` line, dated from the LAST `decided:`",
    [r904?.line, r904?.date, r904?.text.includes("THE QUOTE READS ACROSS IT"), r904?.status], [7, "2026-09-20", true, "answered"]);
  const r911 = rows.find((r) => r.id === "DEC-911");
  t("AN UNDATED decided: STAYS UNDATED — the date is never borrowed from `raised:` or anywhere else in the entry",
    [Boolean(r911), r911?.date], [true, null]);
  const verdict = Object.fromEntries(sink.map((e) => [e.id, e.verdict]));
  t("every entry is classified and NAMED: open and deferred are not rulings; an unknown status and a missing `decided:` are UNCLASSIFIED",
    verdict, { "DEC-904": "ruling", "DEC-905": "ruling", "DEC-906": "ruling", "DEC-907": "not-a-ruling", "DEC-908": "not-a-ruling",
               "DEC-909": "unclassified", "DEC-910": "unclassified", "DEC-911": "ruling" });
  const page = render(rows, sink.map((e) => ({ ...e, file: "docs/development/DECISIONS.md" })));
  t("the rendered index NAMES what it could not classify, and shows an entry row's status",
    [/2 decision-register entries this index could NOT/.test(page), /- DEC-909 — status `withdrawn`/.test(page),
     /- DEC-910 — `answered`, but it carries no `decided:` field/.test(page), /- \*\*DEC-905\*\* · 2026-09-21 · answered · enacted — /.test(page),
     /^4 rulings across 1 documents\.$/m.test(page), /^4 of them are decision-register entries/m.test(page)],
    [true, true, true, true, true, true]);
  t("registerEntries reads an entry to the next heading of ANY level, and no further",
    registerEntries(["### DEC-912 · answered", "response: a", "## A section", "decided: 2026-09-21"]).map((e) => [e.id, e.end, e.decided]),
    [["DEC-912", 2, null]]);
}

/* ========================================================================== */
section("4 — D-341: A QUOTE ENDS AT ITS PARAGRAPH'S EDGE, AND NEVER INSIDE THE NEXT BLOCK");
{
  const one = (text) => { const r = over(text); return r.length === 1 ? r[0].text : `(${r.length} rows)`; };
  const released = "released: 2026-09-14 by the fixture — its paths are free, and the index was SETTLED as a floor";
  t("A CLAIM APPENDED AFTER A TRAILING released: LINE is not absorbed into the ruling above it (the row's own control)",
    /CLAIM|somebody/.test(one(`${released}\n\n## CLAIM 2026-09-14 FIXTURE (the next area's block)\nsession: somebody else\n`)), false);
  t("A CLAIM APPENDED WITH NO BLANK LINE is not absorbed either — the heading is an edge on its own",
    /CLAIM|somebody/.test(one(`${released}\n## CLAIM 2026-09-14 FIXTURE (the next area's block)\nsession: somebody else\n`)), false);
  t("THE NEXT PARAGRAPH IS NOT ABSORBED — a blank line is an edge on its own",
    /somebody/.test(one(`${released}\n\nsession: somebody else's field, lowercase so no sentence break can stop it\n`)), false);
  const wrapped = "The question of the archive's reach was RULED by the fixture: the index scans the archive and\n"
    + "every rolled register stays in scope, so moving a closed pass out of the working tree never\n"
    + "hides a ruling from the question a session asks.\n";
  t("A HAND-WRAPPED RULING QUOTES WHOLE — the liar that stops at every line break fails here",
    one(wrapped).endsWith("hides a ruling from the question a session asks."), true);
  t("A LINE OPENING ON A SESSION NUMBER IS NOT A HEADING — `#23 directly:` continues a wrapped ruling (over-strictness)",
    one("The partition was RULED by the fixture on the direction relayed to BOB\n#23 directly, and it binds every lane that appends to a shared file.\n")
      .endsWith("it binds every lane that appends to a shared file."), true);
  const title = over("## RULED, 2026-07-31: the allowlist is not a viable mechanism\n\nBob, answering DEC-913: the fixture's reason, in the section's first paragraph.\n\n## The next section\n");
  t("A TITLE'S RULING IS FILED UNDER THE ID ITS SECTION OPENS WITH — a heading's content is the paragraph beneath it",
    title.map((r) => [r.id, /the fixture's reason/.test(r.text), /next section/.test(r.text)]), [["DEC-913", true, false]]);

  /* The real corpus: the defect's instances, counted. */
  const glued = ROWS.filter((r) => /(^|\s)#{1,6} [A-Z]/.test(r.text));
  t(`NO RULING IN THE REAL INDEX QUOTES A HEADING FROM ANOTHER BLOCK (found: ${glued.map((r) => `${r.file}:${r.line}`).join(", ") || "none"})`,
    glued.length, 0);
  t("...and no ruling carries `## CLAIM` text — the row's own acceptance",
    ROWS.filter((r) => r.text.includes("## CLAIM")).length, 0);
  const ic82 = ROWS.filter((r) => r.file === "docs/development/CLAIMS.md" && r.id === "IC-82" && /QUEUE row flips/.test(r.text));
  t("the IC-82 ruling D-341 was found on now ends at its own sentence",
    ic82.map((r) => r.text.endsWith("are CONDUCT's.")), [true]);
}

/* ========================================================================== */
section("5 — THE CLASS SWEEP: THE SEARCH CONTEXT HOLDS ITS OWN LINE, AND AN ID QUERY MATCHES THE WHOLE ID");
{
  const long = Array.from({ length: 5 }, (_, i) => `| row ${i} | ${"filler ".repeat(220)}|`).join("\n");
  const rows = over(`${long}\nThe ledger's verdict was SETTLED in favour of the zanzibar reading of the fixture.\n`);
  t("A LONG LEDGER ROW IS FOUND BY ITS OWN WORDS — a context cut at 4,000 characters reached only the rows above it",
    query("zanzibar", rows).hits.length, 1);
  const missing = ROWS.filter((r) => r.via === "marker" && !r.ctx.includes(lineOf(r.file, r.line).toLowerCase().trim().slice(0, 60)));
  t(`...and over the REAL corpus every marker row's context holds its own line (missing: ${missing.length})`, missing.length, 0);

  /* Six lines apart, so neither row's nine-line context reaches the other. The second ruling is
     FILED under REC-9001 and only CITES DEC-2 — CORRECTED 2026-09-21 on this suite's first run,
     which read `filed: true`: the draft's sentence made DEC-2 its first id, so the fixture filed a
     ruling under the very id the arm asks about. The subject was right; the fixture was not. */
  const ids = over([
    "The fixture RULED once on DEC-20 and once on DEC-21, and neither is the one asked about here.",
    "", "", "", "", "",
    "The fixture's last word was SETTLED under REC-9001, and it cites DEC-2.",
  ].join("\n"));
  const q2 = query("DEC-2", ids);
  t("AN ID QUERY MATCHES THE WHOLE ID — `DEC-2` does not answer with DEC-20 or DEC-21, and does answer a sentence ending `DEC-2.`",
    [q2.filed, q2.hits.map((r) => r.line)], [false, [7]]);
  t("...and a filename is matched the same way — `D-2` is not inside `DEBT-closed-2026-08.md`",
    query("D-2", scan([join(ROOT, "docs/archive/ledgers/DEBT-closed-2026-08.md")], () => "The fixture RULED on nothing in particular today.\n")).hits.length, 0);
}

/* ========================================================================== */
section("6 — THROUGH THE CLI, the path a session actually takes");
{
  const sev = cli("severance");
  t("\"severance\" RETURNS DEC-70 FROM ITS OWN ENTRY", [sev.code, /\nDEC-70 · 2026-09-10 · answered \n {2}READING B/.test(sev.out), /docs\/development\/DECISIONS\.md:342\n/.test(sev.out)], [0, true, true]);
  const d2 = cli("DEC-2");
  t("`decided.mjs DEC-2` says the entry is DEFERRED and that nothing is FILED under it — never a ruling",
    [d2.code, /DEC-2 is a decision-register entry, status `deferred`, at docs\/development\/DECISIONS\.md:\d+/.test(d2.out), /No ruling is FILED under DEC-2\./.test(d2.out),
     /\nDEC-2 [·\n]/.test(d2.out)], [0, true, true, false]);
  const d73 = cli("DEC-73");
  t("`decided.mjs DEC-73` returns the entry, undated as its `decided:` line is", [d73.code, /\nDEC-73 · answered · enacted \n/.test(d73.out)], [0, true]);
  const none = cli("DEC-99999");
  t("an id nothing mentions is answered as a FLOOR, never as an absence", [none.code, /That is a FLOOR, not a ceiling/.test(none.out)], [0, true]);
}

/* ========================================================================== */
section("7 — THE TOOL'S OWN CONTROL STILL RUNS, and covers the two new patterns");
{
  const c = cli("--control");
  t("`decided.mjs --control` exits 0", c.code, 0);
  t("...with its M0-97 and D-341 arms among the PASS lines",
    [/PASS {2}M0-97: /.test(c.out), /PASS {2}D-341: /.test(c.out), /FAIL/.test(c.out)], [true, true, false]);
}

/* ========================================================================== */
section("8 — M0-99: THE INDEX IS PRODUCED ON DEMAND, AND NEVER COMMITTED");
/* ORCHESTRATION.md §"THE RECORD IS PARTITIONED BY WRITER", rule 2. Every fixture below is a REAL
   repository with the REAL generator copied in (it indexes the `docs/` and `CLAUDE.md` beside its
   own `tools/`) and, unless an arm says otherwise, the REAL `.gitignore` — so a control that breaks
   the repository's own line reaches every fixture, which is why they copy it rather than write one. */
{
  const SANDBOX = mkdtempSync(join(tmpdir(), "m099-"));
  const g = (cwd, ...args) => spawnSync("git", ["-c", "user.email=m099@example.invalid", "-c", "user.name=M0-99 suite",
    "-c", "commit.gpgsign=false", ...args], { cwd, encoding: "utf8" });
  const REAL_IGNORE = readFileSync(join(ROOT, ".gitignore"));
  const put = (root, rel, body) => { mkdirSync(dirname(join(root, rel)), { recursive: true }); writeFileSync(join(root, rel), body); };
  const repo = (name, { ignore = REAL_IGNORE, files = {} } = {}) => {
    const root = join(SANDBOX, name);
    put(root, "tools/decided.mjs", readFileSync(TOOL));
    /* CORRECTED 2026-09-22 by M0-110: `decided.mjs` imports `coord.mjs` (the corpus is read through the coord layer),
       so a copy carried alone cannot load — the fixture would measure a broken import, not the rule. Carried with it. */
    put(root, "tools/coord.mjs", readFileSync(join(ROOT, "tools/coord.mjs")));
    /* CORRECTED 2026-09-23 by M0-121: `coord.mjs` imports the state-path predicate from `statepaths.mjs`, so a copy
       carried without it cannot load (8 assertions failed on the broken import, not the rule). Carried with it. */
    put(root, "tools/statepaths.mjs", readFileSync(join(ROOT, "tools/statepaths.mjs")));
    put(root, "CLAUDE.md", "# fixture\n");
    if (ignore !== null) put(root, ".gitignore", ignore);
    for (const [rel, body] of Object.entries(files)) put(root, rel, body);
    g(root, "init", "-q", "-b", "main");
    return root;
  };
  const run = (root, ...args) => {
    const r = spawnSync(process.execPath, [join(root, "tools/decided.mjs"), ...args], { cwd: root, encoding: "utf8" });
    return { code: r.status, out: `${r.stdout || ""}${r.stderr || ""}` };
  };
  const commit = (root, msg) => { g(root, "add", "-A"); return g(root, "commit", "-q", "-m", msg); };
  const idx = (root) => existsSync(join(root, INDEX_PATH)) ? readFileSync(join(root, INDEX_PATH), "utf8") : "";
  const RULINGS = ["# rulings", "", "DEC-901 was RULED by the fixture: the index is produced where it is read.", "",
    ...Array.from({ length: 8 }, (_, i) => `filler line ${i}, which neither branch touches.`), "",
    "DEC-902 was RULED by the fixture: a generated file is not merged.", ""].join("\n");
  /* The acceptance's two branches, each run the way a session runs them: edit rulings, run the tool,
     `git add -A`, commit. Branch a edits one ruling and adds one; b edits the other and adds two, so
     the two generated indexes differ in their head count as well as their rows — under a committed
     index that is a conflict by construction, and the control that re-commits it must see one. */
  const twoBranches = (root) => {
    const edit = (from, to) => put(root, "docs/rulings.md", readFileSync(join(root, "docs/rulings.md"), "utf8").replace(from, to));
    g(root, "checkout", "-q", "-b", "a");
    edit("produced where it is read.", "produced where it is read, on the alpha branch.");
    put(root, "docs/alpha.md", "DEC-903 was RULED by the fixture on the alpha branch alone.\n");
    run(root); commit(root, "a: one ruling edited, one added, the tool run");
    g(root, "checkout", "-q", "-b", "b", "main");
    edit("a generated file is not merged.", "a generated file is not merged, on the beta branch.");
    put(root, "docs/beta.md", "DEC-904 was RULED by the fixture on the beta branch.\n\nDEC-905 was RULED by the fixture on the beta branch too.\n");
    run(root); commit(root, "b: one ruling edited, two added, the tool run");
    g(root, "checkout", "-q", "a");
    const m = g(root, "merge", "--no-edit", "b");
    return { status: m.status, said: `${m.stdout}${m.stderr}`, unmerged: g(root, "diff", "--name-only", "--diff-filter=U").stdout.trim() };
  };

  /* ---- THIS REPOSITORY. The oracle is git, asked directly — not the predicate under test. */
  const ls = spawnSync("git", ["ls-files", "--", INDEX_PATH], { cwd: ROOT, encoding: "utf8" });
  const ci = spawnSync("git", ["check-ignore", "-v", "--no-index", "--", INDEX_PATH], { cwd: ROOT, encoding: "utf8" });
  const at = spawnSync("git", ["check-attr", "merge", "--", INDEX_PATH], { cwd: ROOT, encoding: "utf8" });
  t("THE REAL REPOSITORY DOES NOT TRACK docs/DECIDED.md — `git ls-files` lists nothing (the liar keeps it committed under merge=ours)",
    [ls.status, ls.stdout.trim()], [0, ""]);
  t("...AND ITS OWN .gitignore IGNORES IT — git names the root `.gitignore` as the rule's source, never a per-clone exclude",
    [ci.status, /^\.gitignore:\d+:docs\/DECIDED\.md\t/.test(ci.stdout)], [0, true]);
  t("...and no merge driver is attached to it — `git check-attr merge` reads unspecified",
    [at.status, at.stdout.trim()], [0, `${INDEX_PATH}: merge: unspecified`]);
  const it = indexTracking();
  t("...and `indexTracking()`, the predicate plancheck arm 2b reads, agrees with the oracle",
    [it.tracked, it.ignored, it.undetermined], [false, true, false]);

  /* ---- THE ONE FRESHNESS CALL, driven through the CLI of a fixture, where absent, current and stale
     can each be arranged without touching this repository. */
  const F = repo("fresh", { files: { "docs/rulings.md": "# rulings\n\nDEC-901 was RULED by the fixture: the first subject stands.\n" } });
  commit(F, "the corpus, committed; the index never is");
  const P = join(F, INDEX_PATH);
  const r1 = run(F);
  t("THE FRESHNESS CALL WRITES AN ABSENT INDEX — the CLI says so, and the file holds the corpus's ruling",
    [r1.code, / · absent, written$/m.test(r1.out), idx(F).includes("the first subject stands")], [0, true, true]);
  if (existsSync(P)) utimesSync(P, new Date(2001, 0, 1), new Date(2001, 0, 1));
  const bytes0 = idx(F), mtime0 = existsSync(P) ? statSync(P).mtimeMs : -1;
  const r2 = run(F);
  t("A CURRENT INDEX IS NOT REWRITTEN — its bytes AND its mtime stay, so a tree that has not moved is not touched",
    [r2.code, / · already current, not rewritten$/m.test(r2.out), idx(F) === bytes0, existsSync(P) && statSync(P).mtimeMs === mtime0], [0, true, true, true]);
  put(F, "docs/later.md", "DEC-906 was RULED by the fixture after the index was written: the later subject.\n");
  const r3 = run(F);
  t("A STALE INDEX IS REWRITTEN — the ruling added after it was written is in what the next reader gets",
    [r3.code, / · stale, written$/m.test(r3.out), idx(F).includes("the later subject")], [0, true, true]);
  const st = g(F, "status", "--porcelain", "--ignored", "--untracked-files=all").stdout;
  t("...BY RENAME: no temporary file is left beside it, and the index reads IGNORED, never untracked",
    [/DECIDED\.md\.tmp/.test(st), /^!! docs\/DECIDED\.md$/m.test(st), /^\?\? docs\/DECIDED\.md$/m.test(st)], [false, true, false]);
  const chk = run(F, "--check");
  t("`--check` is RETIRED, LOUDLY — exit 2 naming M0-99; never 0, and never answered as a query",
    [chk.code, /RETIRED \(M0-99/.test(chk.out), /No RULING/.test(chk.out)], [2, true, false]);
  /* This repository, in process: the one call leaves the working copy CURRENT, and what it returns is
     the index of the corpus this suite read at its head. It may write the (ignored) copy here. */
  /* CORRECTED 2026-09-22 by M0-110: "the corpus the suite read" is the PINNED state half above, and `fresh()` reads the
     LIVE corpus through the coord layer, so the equality is asked of the tool's own live scan — the property is
     unchanged: the one call writes exactly the index of the corpus as the tool reads it now. */
  const here = fresh();
  const liveRegister = [];
  const liveRows = scan(undefined, undefined, { sink: liveRegister });
  t("ON THIS REPOSITORY, after the one call the working copy is CURRENT and is the index of the corpus the suite read",
    [fresh({ write: false }).state, here.body === render(liveRows, liveRegister)], ["current", true]);

  /* ---- THE ACCEPTANCE, the row's own words: a ruling edited on two branches merges with no
     DECIDED.md conflict, and `decided.mjs "<subject>"` answers from the merged corpus. */
  const A = repo("accept", { files: { "docs/rulings.md": RULINGS } });
  run(A); commit(A, "base: two rulings, the tool run as a session runs it");
  const am = twoBranches(A);
  t("THE ACCEPTANCE — rulings edited on two branches MERGE WITH NO DECIDED.md CONFLICT, each branch having run the tool",
    [am.status, am.unmerged, /DECIDED/.test(am.said)], [0, "", false]);
  t("...and no commit on either branch, nor the merge, carries the index",
    [g(A, "log", "--all", "--format=%h", "--", INDEX_PATH).stdout.trim(), g(A, "ls-files", "--", INDEX_PATH).stdout.trim()], ["", ""]);
  const qa = run(A, "produced where it is read, on the alpha branch"), qb = run(A, "not merged, on the beta branch"), q5 = run(A, "DEC-905");
  t("...and `decided.mjs \"<subject>\"` ANSWERS FROM THE MERGED CORPUS — both edited rulings, and one only the other branch added",
    [/\nDEC-901 /.test(qa.out), /\nDEC-902 /.test(qb.out), /\nDEC-905 /.test(q5.out)], [true, true, true]);
  const after = run(A);
  t("...and the copy the merge left behind was STALE, and the ONE freshness call brings it to the merged corpus",
    [/ · stale, written$/m.test(after.out), ["on the alpha branch", "on the beta branch", "DEC-904", "DEC-905"].every((s) => idx(A).includes(s))],
    [true, true]);

  /* ---- THE LIAR, DRIVEN: the same two branches with the index COMMITTED under `merge=ours`. */
  const L = repo("liar", { ignore: "node_modules/\n", files: { ".gitattributes": `${INDEX_PATH} merge=ours\n`, "docs/rulings.md": RULINGS } });
  g(L, "config", "merge.ours.driver", "true");
  run(L); commit(L, "base: the index COMMITTED, under merge=ours");
  const lm = twoBranches(L);
  t("THE LIAR MERGES CLEAN TOO — `merge=ours` keeps one side's committed index, so 'no conflict' alone cannot tell it from the fix",
    [lm.status, lm.unmerged], [0, ""]);
  const lt = indexTracking({ repo: L });
  t("...and the predicate plancheck arm 2b reads NAMES it: TRACKED, and not ignored by any .gitignore the repository carries",
    [lt.tracked, lt.ignored, lt.undetermined], [true, false, false]);
  const kept = g(L, "show", `HEAD:${INDEX_PATH}`).stdout;
  t("...and the index it kept is STALE: the merged corpus holds a ruling the committed copy does not",
    [kept.length > 200, kept.includes("DEC-905"), /\nDEC-905 /.test(run(L, "DEC-905").out)], [true, false, true]);

  /* ---- THE PREDICATE'S EDGES: what counts as the repository ignoring it. */
  const X = repo("exclude", { ignore: null, files: { "docs/rulings.md": RULINGS } });
  commit(X, "no .gitignore at all");
  put(X, ".git/info/exclude", `${INDEX_PATH}\n`);
  const xt = indexTracking({ repo: X });
  t("A RULE IN .git/info/exclude IS NOT THE REPOSITORY IGNORING IT — one clone's exclude travels to nobody",
    [xt.tracked, xt.ignored, String(xt.rule).startsWith(".git/info/exclude")], [false, false, true]);
  const N = repo("nested", { ignore: null, files: { "docs/.gitignore": "DECIDED.md\n", "docs/rulings.md": RULINGS } });
  commit(N, "the rule in a nested, committed .gitignore");
  t("OVER-STRICTNESS: a rule in a NESTED, committed .gitignore IS the repository ignoring it — a spelling this item did not use",
    [indexTracking({ repo: N }).ignored], [true]);
  const G = repo("negated", { ignore: `${INDEX_PATH}\n!${INDEX_PATH}\n`, files: { "docs/rulings.md": RULINGS } });
  commit(G, "a negated rule");
  t("A NEGATED RULE IS NOT AN IGNORE — git reports it as the match of a path it does NOT ignore",
    indexTracking({ repo: G }).ignored, false);
  t("OUTSIDE A REPOSITORY the predicate is UNDETERMINED, and says so — never read as either answer",
    indexTracking({ repo: SANDBOX }).undetermined, true);

  rmSync(SANDBOX, { recursive: true, force: true });
}

/* ========================================================================== */
section("9 — M0-136: THE LIVE CORPUS IS READ AT THE PINNED COORD COMMIT, AND THE VERDICT DOES NOT MOVE WITH origin/coord");
{
  /* §8's in-repository arm calls `fresh()` and `scan()` over the LIVE corpus, and §6 drives the CLI, which FETCHED `origin/coord` (`freshen`) — 5 fetches a run, measured 2026-09-23 — so two reads a fetch could separate were compared. The probe is that live scan and its rendered index; the planted commit empties CLAIMS.md (154 of the index's rulings), which moves both when read. */
  const p = plantedCoord({
    probe: `const { createHash } = await import("node:crypto");\nconst { scan, render } = await import(${JSON.stringify(PIN_REPO + "/tools/decided.mjs")});\nconst reg = []; const rows = scan(undefined, undefined, { sink: reg });\nconsole.log(JSON.stringify({ rows: rows.length, register: reg.length, index: createHash("sha256").update(render(rows, reg)).digest("hex").slice(0, 16) }));`,
    plant: { "docs/development/CLAIMS.md": "planted by M0-136: a CLAIMS.md with no rulings\n" } });
  assertPlanted(t, "decided", p);
}

console.log(`\nsections reached ${reached}/${SECTIONS}`);
if (reached !== SECTIONS) { console.log("  FAIL  a section did not run — the tally above is not the whole suite"); fail++; }
console.log(`decided: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
