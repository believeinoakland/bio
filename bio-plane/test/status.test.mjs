/* GATE: never-cache (history) — M0-126, BOB #30 (TREE-SHARING §3a condition 1): its verdict reads git log -1 (the last commit's date), which no
   result key can name; traced 2026-09-23.
   READS NO LIVE REF — M0-136, 2026-09-23. What it reads: HEAD's OWN history — `git log -1 --format=%as -- <doc>` for
   each governed document (`tools/corpuscheck.mjs`, run by `pushguard.mjs` `corpusCheck`: a Status date the body moved
   past), and `git ls-files` (the marker scan). No `origin/*`, `coord`, `FETCH_HEAD`, `ls-remote` or fetch: `pushguard.mjs`
   names `coord` only for a push of that ref, which no arm here drives. HOW CHECKED: this file and the modules it imports
   (`./stdio.mjs`, `./sandbox.mjs`, `tools/status.mjs`, `tools/pushguard.mjs`, and `tools/corpuscheck.mjs`, which the
   guard spawns) grepped for `spawnSync`/`execFileSync`/`execSync`/`git` and those ref tokens; and the suite run with a
   logging `git` first on PATH: 53 calls, those. The CLOCK: `status.mjs --write` stamps today's date, and §7 runs it only
   on a fixture whose map carries no Status date; no arm compares a date to the clock. */
/* status — the single source of truth for what is BUILT (`tools/status.mjs`,
 * `docs/architecture/construct-status.json`).
 *
 * Bob, 2026-09-18: the record must have ONE source of truth that is always kept updated, so a
 * session stops guessing. The instrument is only worth its name if it FAILS when the code and a
 * claim disagree — in BOTH directions, because the drift measured that day ran mostly the
 * direction nothing audits: things BUILT while the map called them absent.
 *
 * WHAT THIS SUITE DEFENDS AGAINST:
 *   - an ABSENT claim that stays green after the thing is built (the measured direction);
 *   - a BUILT claim that stays green after the thing is deleted;
 *   - an absence "verified" over a file that could not be read (the false-absence class);
 *   - a claim with no probe — prose, which is what drifted;
 *   - a rendered cell that breaks §3's table on a pipe;
 *   - a UI call helper the `uinone` probe does not know, which would make every
 *     "the UI does not call X" claim silently blind.
 *
 * NEGATIVE CONTROL: `node bio-plane/test/status.control.mjs` from the repo root — each arm
 * breaks one property of the tool and must turn a NAMED assertion here red.
 *   RUN 2026-09-18 by BOB #14: six arms, 33 pass / 0 fail, exit 0, every restore byte-identical.
 *   RE-RUN the same day with A7 added (an ABSENT claim resting only on a comment): seven arms, 38 pass / 0 fail.
 *   RE-RUN with A8 added (a rendering that leaves the Status date behind): eight arms.
 *   RE-RUN with A9 added (a key set that ignores additions): nine arms.
 *   RE-RUN 2026-09-23 by M0-138 with A10 added (render whole texts again): ten arms, 54 pass / 0 fail, exit 0;
 *     A10 FAILED at "THE RENDERED MAP FITS ITS READING BUDGET — docs/architecture/BIO_System_Design.md" (and at
 *     "renderCell renders the first sentence"), tools/status.mjs restored by sha256 (f498cce1…) AND cmp, byte-identical.
 * AND A SECOND BY-HAND ARM ON THE PUSH GUARD (2026-09-18): `corpusCheck` made to accept any completion
 *   line regardless of its fail count -> section 8's "A STALE STATUS DATE REFUSES THE PUSH" FAILS (51/1);
 *   `tools/pushguard.mjs` restored by `cp`, verified byte-identical (sha256 7d978c73…).
 * AND A THIRD (2026-09-18): `markerCheck` made to ignore the opening marker -> section 9's
 *   "A FILE CARRYING MERGE MARKERS REFUSES THE PUSH" FAILS; restored by `cp`, byte-identical.
 *   (A2 was RE-AIMED after its first run: forcing the op probe's CONDITION true also dereferenced a
 *   null match, so the suite CRASHED instead of failing the named assertion — a second variable.)
 * AND ONE ARM ON THE PUSH GUARD, run by hand because it arms a different file: `statusCheck`'s
 *   drift verdict flipped to ok -> section 7's "A DRIFTED SOURCE OF TRUTH REFUSES THE PUSH" FAILS
 *   (40/1); `tools/pushguard.mjs` restored by `cp` and verified byte-identical (sha256 fa088ea3…).
 * AND THE SUITE FOUND A DEFECT IN ITS SUBJECT ON ITS FIRST RUN: under a symlinked tmpdir the CLI's
 *   entry test failed, so `status.mjs --check` DID NOTHING AND EXITED 0 — a pass without a run.
 *   Fixed with realpath, and the guard now requires the tool's completion line, not exit 0.
 * GATE: reads * (M0-126: it drives pushguard's marker, corpus and status checks over THIS tree; traced 2026-09-23 reading
 *   1,022 files that no name in this suite reaches, so its result key covers the whole tree — TREE-SHARING §3a)

   ADDED 2026-09-24 by c18-batch7fix (section 5's derivation corrected): (s1) `queueApplySet` removed from tools/status.mjs UI_HELPERS, restored by cp and verified by sha256 (50f365fa…) AND cmp (19,859 B). DECLARED: only "NO UI helper that calls an op is missing from UI_HELPERS" fails, naming it. -> 63/1, got ["queueApplySet"]. AS DECLARED. (s0) the window cut ALONE, before arrow declarations were parsed: "the network-reaching derivation found the helpers it must" went RED — the guard doing its job, and the reason `const NAME = (…) =>` is now a declaration. */

import "./stdio.mjs";
import "./sandbox.mjs";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { evalProbe, judge, renderCell, renderMap, lookup, bumpAsOf, firstSentence, UI_HELPERS, ROOT, STATES }
  from "../../tools/status.mjs";
import { BUDGET, MAP as BUDGET_MAP } from "../../tools/readbudget.mjs";
import { statusCheck, corpusCheck, markerCheck } from "../../tools/pushguard.mjs";
import { copyFileSync } from "node:fs";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const SECTIONS = 10;
let reached = 0;
const section = (n) => { reached++; console.log(`\n--- ${n} ---`); };

/* A throwaway repository shaped like the real one, so every probe kind runs against files
   it can be made to disagree with. Nothing here touches the estate. */
const repo = mkdtempSync(join(tmpdir(), "status-suite-"));
const put = (rel, text) => { mkdirSync(join(repo, rel, ".."), { recursive: true }); writeFileSync(join(repo, rel), text); };
put("bio-plane/src/index.mjs", "const OPS = {\n  cite:       { classes: [\"member\"], mutating: true },\n  frontier:   { classes: [\"member\"], mutating: false },\n};\n");
put("bio-plane/src/schema.mjs", "CREATE TABLE IF NOT EXISTS content (\n  id TEXT\n);\n");
put("bio-plane/src/store.mjs", "CREATE VIRTUAL TABLE IF NOT EXISTS bundles_fts USING fts5(x);\n/* compilation point */\n");
put("civicos-ui/app.html", "<script>recR(\"frontier\"); actAsk(\"conclude\", {});</script>");

try {
/* ========================================================================== */
section("1 — EVERY PROBE KIND, BOTH WAYS");
{
  const P = (p) => evalProbe(p, { repo, sets: { "@s": ["bio-plane/src/store.mjs"] } }).ok;
  t("an op in the OPS table is found", P({ op: "cite" }), true);
  t("an op NOT in the OPS table is not", P({ op: "publish" }), false);
  t("a table in schema.mjs is found", P({ table: "content" }), true);
  t("a VIRTUAL table in store.mjs is found", P({ table: "bundles_fts" }), true);
  t("an undeclared table is not", P({ table: "leads" }), false);
  t("a file that exists", P({ file: "bio-plane/src/store.mjs" }), true);
  t("a file that does not", P({ file: "nope.mjs" }), false);
  t("`hit` matches", P({ hit: "fts5", in: ["bio-plane/src/store.mjs"] }), true);
  t("`hit` misses", P({ hit: "zzz", in: ["bio-plane/src/store.mjs"] }), false);
  t("`none` holds when nothing matches", P({ none: ["zzz", "qqq"], in: "@s" }), true);
  t("`none` FAILS when any pattern matches — an absence the code contradicts",
    P({ none: ["zzz", "compilation"], in: "@s" }), false);
  t("`uinone` holds for an op the UI never calls", P({ uinone: ["publish"] }), true);
  t("`uinone` FAILS for an op the UI calls through a helper", P({ uinone: ["frontier"] }), false);
  t("...and through a second helper", P({ uinone: ["conclude"] }), false);
  /* THE CENSUS — name-independent (CONDUCT #4, 2026-09-18: REC-87's step could not be called
     `member`, so a name-search read ABSENT over a built construct). */
  t("a census of ops that matches holds", P({ count: "ops", equals: 2 }), true);
  t("A CENSUS TRIPS ON ANY ADDITION — one op more than the claim, under any name", P({ count: "ops", equals: 1 }), false);
  t("a census of tables counts VIRTUAL ones too", P({ count: "tables", equals: 2 }), true);
  put("bio-plane/src/kinds.mjs", "export const KINDS = {\n  layer: { a: 1 },\n  'pdf-page': { a: 2 },\n  typed: { a: 3 },\n};\n");
  t("an exact key set holds when the enumeration is exactly it", P({ keys: "KINDS", in: ["bio-plane/src/kinds.mjs"], equals: ["layer", "pdf-page", "typed"] }), true);
  t("AN EXACT KEY SET TRIPS ON A KEY ADDED UNDER A NAME NOBODY SEARCHED FOR", P({ keys: "KINDS", in: ["bio-plane/src/kinds.mjs"], equals: ["layer", "pdf-page"] }), false);
}

/* ========================================================================== */
section("2 — AN ABSENCE OVER AN UNREADABLE FILE IS NOT AN ABSENCE (the false-absence class)");
{
  const r = evalProbe({ none: ["anything"], in: ["missing/file.mjs"] }, { repo });
  t("`none` over a file that is not there is NOT ok", r.ok, false);
  t("...and it says UNREADABLE rather than absent", /UNREADABLE/.test(r.evidence), true);
  const noOps = mkdtempSync(join(tmpdir(), "status-noops-"));
  t("an op probe with no OPS table is not ok, and says UNREADABLE",
    [evalProbe({ op: "cite" }, { repo: noOps }).ok, /UNREADABLE/.test(evalProbe({ op: "cite" }, { repo: noOps }).evidence)],
    [false, true]);
  rmSync(noOps, { recursive: true, force: true });
}

/* ========================================================================== */
section("3 — JUDGEMENT: DRIFT IN BOTH DIRECTIONS, AND NO CLAIM WITHOUT A PROBE");
{
  const data = { sets: {}, constructs: [{ n: 1, name: "X", claims: [
    { id: "1.built-ok", state: "BUILT", text: "a", probes: [{ op: "cite" }] },
    { id: "1.built-gone", state: "BUILT", text: "b", probes: [{ op: "publish" }] },
    { id: "1.absent-ok", state: "ABSENT", text: "c", probes: [{ none: ["leads"], in: ["bio-plane/src/schema.mjs"] }] },
    { id: "1.absent-built", state: "ABSENT", text: "d", probes: [{ none: ["content"], in: ["bio-plane/src/schema.mjs"] }] },
    { id: "1.prose", state: "BUILT", text: "e", probes: [] },
    { id: "1.und-ok", state: "UNDETERMINED", text: "f", reason: "live fact", probes: [] },
    { id: "1.und-bare", state: "UNDETERMINED", text: "g", probes: [] },
    { id: "1.bad-state", state: "MOSTLY", text: "h", probes: [{ op: "cite" }] },
    { id: "1.absent-by-comment", state: "ABSENT", text: "i", probes: [{ hit: "compilation", in: ["bio-plane/src/store.mjs"] }] },
  ]}]};
  const j = judge({ repo, data });
  const drifted = j.claims.filter((c) => c.problems.length).map((c) => c.id).sort();
  t("exactly the unsound claims drift — discrimination, not an empty or full walk", drifted,
    ["1.absent-built", "1.absent-by-comment", "1.bad-state", "1.built-gone", "1.prose", "1.und-bare"]);
  t("AN ABSENT CLAIM RESTING ONLY ON A `hit` DRIFTS — a comment saying so is not evidence (CPDF-19's quoted sentence passed one)",
    drifted.includes("1.absent-by-comment"), true);
  t("A BUILT CLAIM WHOSE THING IS GONE DRIFTS", drifted.includes("1.built-gone"), true);
  t("AN ABSENT CLAIM WHOSE THING WAS BUILT DRIFTS — the direction nothing else audits",
    drifted.includes("1.absent-built"), true);
  t("A BUILT CLAIM WITH NO PROBE DRIFTS — prose is what drifted", drifted.includes("1.prose"), true);
  t("an UNDETERMINED claim needs a stated reason", drifted.includes("1.und-bare"), true);
  t("the legal states are declared once", STATES, ["BUILT", "PARTIAL", "ABSENT", "DEFERRED", "UNDETERMINED"]);
}

/* ========================================================================== */
section("4 — §3 IS A RENDERING: NO PIPE BREAKS THE TABLE, A STALE COLUMN IS SEEN, A MISSING ROW IS NAMED");
{
  const c = { n: 7, name: "Y", claims: [{ id: "7.a", state: "BUILT", text: "a | b", probes: [] },
                                        { id: "7.b", state: "ABSENT", text: "c", probes: [] }] };
  const cell = renderCell(c);
  t("A RENDERED CELL CARRIES NO PIPE, so a claim can never break §3's table", cell.includes("|"), false);
  t("...and names the lookup that verifies it", cell.includes("node tools/status.mjs 7"), true);
  put("docs/architecture/BIO_System_Design.md", "| # | c | s |\n| --- | --- | --- |\n| 7 | **Y** | stale text |\n");
  const r = renderMap({ repo, data: { constructs: [c, { n: 9, name: "Z", claims: [] }] } });
  t("a hand-written state cell differs from its rendering, so --check can see it", r.text !== r.current, true);
  t("the rendering replaces ONLY the state cell", r.text.split("\n")[2].startsWith("| 7 | **Y** | "), true);
  t("a construct with no row in §3 is NAMED, never skipped", r.missing, [9]);
  const fm = "**Status** · v0.1, as of 2026-09-01 (x)\n\n**Place in the system** · as of 2026-01-01 elsewhere\n| 7 |";
  const bumped = bumpAsOf(fm, "2026-09-18");
  t("A RENDERING MOVES THE STATUS DATE — the body changed, so the front matter must (bare plancheck failed on it)",
    bumped.startsWith("**Status** · v0.1, as of 2026-09-18"), true);
  t("...and ONLY the Status date: a date after the front matter is untouched", bumped.includes("as of 2026-01-01 elsewhere"), true);
}

/* ========================================================================== */
section("5 — THE UI HELPER LIST IS DERIVED, NOT RECALLED: every helper that calls an op is known to `uinone`");
{
  const idx = readFileSync(join(ROOT, "bio-plane/src/index.mjs"), "utf8");
  const s = idx.indexOf("const OPS = {");
  const ops = new Set([...idx.slice(s).matchAll(/^\s{2}([a-z][a-z0-9]*):\s*\{\s*classes/gm)].map((m) => m[1]));
  const ui = readFileSync(join(ROOT, "civicos-ui/app.html"), "utf8");
  /* A CALL HELPER IS A FUNCTION THAT REACHES THE NETWORK, not one whose argument happens to
     spell an op: `actionCorrArm('capture')` flips a radio button. So: the functions that call
     `fetch(` directly, closed under "calls a helper with its own first parameter", to a fixed
     point — then every one of those that the UI ever calls with a literal op name. */
  /* CORRECTED 2026-09-24 by c18-batch7fix at the c17-batch7 union, not exempted. A body was the 1,600 characters after
     a `function` header, and that window was doing work nobody had stated. It made a SHORT function read its
     NEIGHBOUR's body: D-126's four-line `queueSelFor`, which only filters the member's selection, was derived a
     network helper off the `recPostR(op` in `queueApplySet` below it. And the positive half RESTED on the same
     over-reach: `api` — the one seam that calls `fetch(` — is `const api = (op, …) => fetch(`, which the `function`
     pattern never parsed, so `apiQ` and `apiR` were found only because their windows ran into `rec`'s `fetch(`.
     Cutting the window alone therefore found NOTHING (the guard arm below went red — the control this correction
     needed). So a declaration is now either spelling — `function NAME(` / `async function NAME(` or
     `const|let NAME = (async) (` — and a body ends at the next TOP-LEVEL declaration (a line starting with one), so
     each function is judged by its own code. */
  const DECL = String.raw`(?:(?:async\s+)?function\s+NAME\s*\(|(?:const|let)\s+NAME\s*=\s*(?:async\s*)?\()`;
  const TOP = /\n(?:async\s+function|function|const|let)\s+[A-Za-z_]/;
  const body = (name) => { const i = ui.search(new RegExp(DECL.replace("NAME", name).replace("NAME", name)));
    if (i < 0) return "";
    const next = ui.slice(i + 1).search(TOP);
    return ui.slice(i, next < 0 ? i + 1600 : Math.min(i + 1600, i + 1 + next)); };
  const defs = [...ui.matchAll(/(?:(?:async\s+)?function\s+([A-Za-z_]\w*)\s*\(|(?:const|let)\s+([A-Za-z_]\w*)\s*=\s*(?:async\s*)?\()\s*([A-Za-z_]\w*)/g)]
    .map((m) => ({ name: m[1] || m[2], param: m[3] }));
  const net = new Set(defs.filter((d) => /\bfetch\(/.test(body(d.name))).map((d) => d.name));
  for (let grew = true; grew;) { grew = false;
    for (const d of defs) if (!net.has(d.name) && [...net].some((h) =>
        new RegExp(`\\b${h}\\(\\s*${d.param}\\b`).test(body(d.name)))) { net.add(d.name); grew = true; } }
  const helpers = new Set();
  for (const m of ui.matchAll(/\b([A-Za-z_]\w*)\(\s*["'`]([a-z][a-z0-9]*)["'`]/g))
    if (ops.has(m[2]) && net.has(m[1])) helpers.add(m[1]);
  t("the network-reaching derivation found the helpers it must (a derivation finding none would pass)",
    ["recR", "actAsk", "apiQ"].every((h) => helpers.has(h)), true);
  const unknown = [...helpers].filter((h) => !UI_HELPERS.includes(h)).sort();
  console.log(`  DERIVED UI HELPERS (${helpers.size}): ${[...helpers].sort().join(", ")}`);
  t("the OPS table is non-empty (a walk that found nothing would pass everything)", ops.size > 100, true);
  t("NO UI helper that calls an op is missing from UI_HELPERS — a missing one blinds every `uinone` claim",
    unknown, []);
}

/* ========================================================================== */
section("6 — THE ESTATE ITSELF: the real source of truth agrees with the real code");
{
  const j = judge();
  t("the source of truth is readable", Boolean(j.error), false);
  t("it holds a real population of claims (non-empty, all fifteen constructs)",
    [j.claims.length > 50, new Set(j.claims.map((c) => c.n)).size], [true, 15]);
  const drift = j.claims.filter((c) => c.problems.length).map((c) => `${c.id}: ${c.problems[0]}`);
  t("ZERO drift: every claim's probes agree with the code on this tree", drift, []);
  const r = renderMap();
  t("§3's state column is exactly its rendering (run `node tools/status.mjs --write`)", r.text === r.current, true);
  t("every construct has a row in §3", r.missing, []);
  t("a lookup answers from the source, with evidence", lookup("4").hits.length > 0, true);
}
/* ========================================================================== */
section("7 — THE PUSH IS WHERE IT CANNOT BE SKIPPED: the guard REFUSES a drifted source of truth and passes an agreeing one");
{
  /* A real `tools/status.mjs` run as a child process over a scratch repository — the same path
     the hook takes — so this proves the guard acts on the tool's verdict, not on a stub. */
  const mk = (claimOp) => {
    const r = mkdtempSync(join(tmpdir(), "status-guard-"));
    const w = (rel, text) => { mkdirSync(join(r, rel, ".."), { recursive: true }); writeFileSync(join(r, rel), text); };
    mkdirSync(join(r, "tools"), { recursive: true });
    copyFileSync(join(ROOT, "tools/status.mjs"), join(r, "tools/status.mjs"));
    w("bio-plane/src/index.mjs", "const OPS = {\n  cite:       { classes: [\"member\"], mutating: true },\n};\n");
    const data = { sets: {}, constructs: [{ n: 1, name: "X", claims: [
      { id: "1.a", state: "BUILT", text: "the op", probes: [{ op: claimOp }] }] }] };
    w("docs/architecture/construct-status.json", JSON.stringify(data));
    w("docs/architecture/BIO_System_Design.md", "| 1 | **X** | x |\n");
    /* --write renders §3 and ALSO reports drift (exit 1 on the drifted fixture, by design), so
       its exit status is not this setup's concern — only that the rendering was written. */
    spawnSync(process.execPath, [join(r, "tools/status.mjs"), "--write"], { cwd: r, encoding: "utf8" });
    return r;
  };
  const agree = mk("cite"), drift = mk("publish");
  const a = statusCheck({ repo: agree }), d = statusCheck({ repo: drift });
  t("an AGREEING source of truth passes the push", [a.ok, a.kind], [true, "current"]);
  t("A DRIFTED SOURCE OF TRUTH REFUSES THE PUSH", [d.ok, d.kind], [false, "drift"]);
  t("...and the refusal carries the tool's own account, naming the claim", /1\.a/.test(d.output || ""), true);
  const none = mkdtempSync(join(tmpdir(), "status-guard-none-"));
  t("a tree with no status tool is NOT silently verified — it says UNVERIFIED",
    [statusCheck({ repo: none }).kind, /UNVERIFIED/.test(statusCheck({ repo: none }).message)], ["absent", true]);
  for (const x of [agree, drift, none]) rmSync(x, { recursive: true, force: true });
}
/* ========================================================================== */
section("8 — THE PUSH ALSO SEES THE DESIGN CORPUS: a Status date the body moved past is refused BEFORE main goes red");
{
  /* Driven through the guard's `run` seam with corpuscheck's REAL line shapes: a stale-date fail
     cannot be staged without committing to a repository carrying the whole governed corpus. */
  const stale = corpusCheck({ run: () => ({ status: 1, stdout:
    "  FAIL  docs/architecture/CORPUS-STANDARD.md: Status says `as of 2026-09-17` but the file last changed 2026-09-18 — the body moved and the front matter did not\n"
    + "corpuscheck: 51 governed document(s); under docs/development/ 63 document(s) — 30 governed, 30 excluded, 3 undecided, 0 unclassified; 1 fail\n" }) });
  t("A STALE STATUS DATE REFUSES THE PUSH — the defect that left main red twice", [stale.ok, stale.kind], [false, "fail"]);
  const silent = corpusCheck({ run: () => ({ status: 0, stdout: "" }) });
  t("a corpuscheck that exits 0 WITHOUT its completion line verified nothing, and is refused", [silent.ok, silent.kind], [false, "silent"]);
  const live = corpusCheck();
  t("the real corpus on this tree is current (a guard that refused everything would pass the arm above)", [live.ok, live.kind], [true, "current"]);
}
/* ========================================================================== */
section("9 — A COMMITTED CONFLICT IS REFUSED AT THE PUSH (BOB #14 pushed three markers to main at 0c7e4ed5)");
{
  const o = "<".repeat(7), m = "=".repeat(7), c = ">".repeat(7);
  const files = { "a.md": `text\n${o} HEAD\nmine\n${m}\ntheirs\n${c} abc123 (x)\n`,
                  "b.md": `prose that mentions ${o} inline and a fenced \`${m}\` is not a marker\n` };
  const r = markerCheck({ files: Object.keys(files), read: (f) => files[f] });
  t("A FILE CARRYING MERGE MARKERS REFUSES THE PUSH, naming each line", [r.ok, r.marked], [false, ["a.md:2", "a.md:4", "a.md:6"]]);
  t("the sequences inside prose or a code span are NOT markers — line starts only", r.marked.some((x) => x.startsWith("b.md")), false);
  t("the real tracked tree carries no marker (a guard that refused everything would pass the arm above)", markerCheck().ok, true);
}

/* ========================================================================== */
section("10 — §3 RENDERS EACH CLAIM'S FIRST SENTENCE, AND THE MAP FITS ITS BUDGET WITHOUT A CLAIM TRIMMED (M0-138)");
{
  /* BOB #31 (2026-09-23): rendering every claim WHOLE pushed the map past its 48 KiB cut on each landing that
     added a clause, and integrators trimmed claim texts to fit — the source of truth cut to fit its rendering. */
  t("a claim renders up to its first `. `, marked as cut", firstSentence("one rule. Then detail."), "one rule. …");
  t("a `. ` INSIDE BACKTICKS is not a sentence end", firstSentence("reads `a. b` then stops. More."), "reads `a. b` then stops. …");
  t("OVER-STRICTNESS: a one-sentence claim, even ending in a period, renders WHOLE",
    [firstSentence("only one."), firstSentence("x (v1.5, §2.4) y")], ["only one.", "x (v1.5, §2.4) y"]);
  t("a cut carries the remainder's `§N item M` citations, so the authority still cites them",
    firstSentence("head (§3 item 1). Later §7.1 item 4 and §3 item 1."), "head (§3 item 1). … (also cites §7.1 item 4)");
  const whole = { n: 4, name: "W", claims: [{ id: "4.a", state: "BUILT", text: "first. second", probes: [] }] };
  t("renderCell renders the first sentence, never the whole text", renderCell(whole).includes("second"), false);

  const d = judge().data;
  const r = renderMap({ data: d });
  const bytes = Buffer.byteLength(r.text, "utf8");
  const claims = d.constructs.flatMap((c) => c.claims);
  const cut = claims.filter((cl) => firstSentence(cl.text) !== cl.text);
  console.log(`  corpus: ${claims.length} claims, ${cut.length} cut at a first sentence; rendered map ${bytes} B, budget ${BUDGET.map} B`);
  t("the corpus is real: claims exist and some are long enough to be cut (an empty walk would pass)",
    [claims.length > 50, cut.length > 5], [true, true]);
  t(`THE RENDERED MAP FITS ITS READING BUDGET — ${BUDGET_MAP} (${bytes} B of ${BUDGET.map} B)`, bytes <= BUDGET.map, true);
  t("the budget read is the map's own (readbudget's MAP is status's MAP)", BUDGET_MAP, "docs/architecture/BIO_System_Design.md");
  t("every whole text stays in the source and is served by the lookup",
    lookup("3.history-append").hits.map((h) => h.text), [claims.find((cl) => cl.id === "3.history-append").text]);
}
} finally {
  rmSync(repo, { recursive: true, force: true });
}

console.log(`\nsections reached ${reached}/${SECTIONS}`);
if (reached !== SECTIONS) { console.log("  FAIL  a section did not run — the tally above is not the whole suite"); fail++; }
console.log(`status: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
