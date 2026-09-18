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
 *   (A2 was RE-AIMED after its first run: forcing the op probe's CONDITION true also dereferenced a
 *   null match, so the suite CRASHED instead of failing the named assertion — a second variable.)
 * AND ONE ARM ON THE PUSH GUARD, run by hand because it arms a different file: `statusCheck`'s
 *   drift verdict flipped to ok -> section 7's "A DRIFTED SOURCE OF TRUTH REFUSES THE PUSH" FAILS
 *   (40/1); `tools/pushguard.mjs` restored by `cp` and verified byte-identical (sha256 fa088ea3…).
 * AND THE SUITE FOUND A DEFECT IN ITS SUBJECT ON ITS FIRST RUN: under a symlinked tmpdir the CLI's
 *   entry test failed, so `status.mjs --check` DID NOTHING AND EXITED 0 — a pass without a run.
 *   Fixed with realpath, and the guard now requires the tool's completion line, not exit 0.
 */

import "./stdio.mjs";
import "./sandbox.mjs";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { evalProbe, judge, renderCell, renderMap, lookup, UI_HELPERS, ROOT, STATES }
  from "../../tools/status.mjs";
import { statusCheck } from "../../tools/pushguard.mjs";
import { copyFileSync } from "node:fs";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const SECTIONS = 7;
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
  ]}]};
  const j = judge({ repo, data });
  const drifted = j.claims.filter((c) => c.problems.length).map((c) => c.id).sort();
  t("exactly the unsound claims drift — discrimination, not an empty or full walk", drifted,
    ["1.absent-built", "1.bad-state", "1.built-gone", "1.prose", "1.und-bare"]);
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
  const body = (name) => { const i = ui.search(new RegExp(`(?:async\\s+)?function\\s+${name}\\s*\\(`));
    return i < 0 ? "" : ui.slice(i, i + 1600); };
  const defs = [...ui.matchAll(/(?:async\s+)?function\s+([A-Za-z_]\w*)\s*\(\s*([A-Za-z_]\w*)/g)]
    .map((m) => ({ name: m[1], param: m[2] }));
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
} finally {
  rmSync(repo, { recursive: true, force: true });
}

console.log(`\nsections reached ${reached}/${SECTIONS}`);
if (reached !== SECTIONS) { console.log("  FAIL  a section did not run — the tally above is not the whole suite"); fail++; }
console.log(`status: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
