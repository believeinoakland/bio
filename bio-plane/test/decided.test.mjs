/* decided — the ruling index, `tools/decided.mjs` (M0-97 and D-341, 2026-09-21).
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
 * NEGATIVE CONTROL: `node bio-plane/test/decided.control.mjs` from the repo root breaks `tools/decided.mjs` one arm at a time and each arm must turn a NAMED assertion here red
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
 */

import "./stdio.mjs";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { scan, registerEntries, query, render } from "../../tools/decided.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const TOOL = join(ROOT, "tools/decided.mjs");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want).slice(0, 600)}\n         got  ${JSON.stringify(got).slice(0, 600)}`}`);
  ok ? pass++ : fail++;
};
const SECTIONS = 7;
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

/* The real corpus, read ONCE, with every register entry the tool saw. */
const REGISTER = [];
const ROWS = scan(undefined, undefined, { sink: REGISTER });
const BEFORE = scan(undefined, undefined, { entries: false });
const lineOf = (() => { const c = {}; return (f, n) => (c[f] ??= readFileSync(join(ROOT, f), "utf8").split("\n"))[n - 1]; })();

/* ========================================================================== */
section("1 — M0-97: EVERY ANSWERED OR ENACTED REGISTER ENTRY IS FILED UNDER ITS OWN ID");
{
  /* THE ORACLE IS THE FILE'S OWN HEADINGS, read by `git grep` — not by the tool's parser. */
  const g = spawnSync("git", ["grep", "-n", "-E", "^#{1,6} DEC-[0-9]+ · ", "--", "docs", "CLAUDE.md"], { cwd: ROOT, encoding: "utf8" });
  t("the oracle ran (git grep exit 0 — a search that failed returns no headings, which would pass everything)", g.status, 0);
  const heads = (g.stdout || "").trim().split("\n").filter(Boolean).map((l) => {
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
  const segment = (h) => { const L = readFileSync(join(ROOT, h.file), "utf8").split("\n"); return flat(L.slice(h.line - 1, Math.min(L.length, next(h) - 1)).join(" ")); };
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

console.log(`\nsections reached ${reached}/${SECTIONS}`);
if (reached !== SECTIONS) { console.log("  FAIL  a section did not run — the tally above is not the whole suite"); fail++; }
console.log(`decided: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
