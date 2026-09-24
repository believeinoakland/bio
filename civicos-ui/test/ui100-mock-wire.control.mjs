/* UI-100's NEGATIVE CONTROL — every `unknown op` and `requiredArgument` mock in this estate is built
 * from the plane's own source and catalogue through `plane-refusal-wire.mjs`, and this file breaks the
 * derivation ALONE, one arm at a time, to watch the named assertions fail across the whole class.
 *
 * WHAT IT ADDS OVER `ui84-mock-wire.control.mjs`, which it deliberately does not replace. UI-84's
 * control runs ONE suite and proves the derivation works there. This one runs the SEVEN suites UI-100
 * touches and proves something UI-84's cannot: that the derivation is SHARED, so a translation dropped
 * once breaks every surface that renders it and NONE of the surfaces that only gap-detect. That split
 * is the row's second half — *"drive each surface and state whether it RENDERS the refusal or only
 * gap-detects it"* — written as a FALSIFIABLE DECLARATION rather than as a sentence in a report.
 *
 * DECLARED BEFORE ARMING — what MUST fail, and what MUST NOT:
 *
 *   (A) THE ROW'S OWN, IN ITS OWN WORDS: *"retype one mock's `error` without `translation` and the
 *       derivation arm names it."* `queue.test.mjs`'s absent-op fixture is put back BY HAND to exactly
 *       the literal it carried until 2026-09-24 — `{ ok:false, error:"unknown op queue" }` — a hand
 *       copy with no code, no check and no canned sentence.
 *       MUST FAIL: `queue.test.mjs`, at the REACH arms that read `.q-feed-why` — the member no longer
 *       reads DEC-49's canned sentence, and the invented sentence is back on the page.
 *       MUST NOT FAIL: every other suite. The arm is one fixture in one file and nothing else imports it.
 *       **THE FIXTURE IT PATCHES IS THE `tasks` ONE, AND THAT IS A CORRECTION.** Its first spelling
 *       retyped the `op=queue` fixture and came back GREEN against this declaration — because the REACH
 *       drive is `makePlane({ resAbsent:true })`, the TASKS feed, so the arm patched a fixture no
 *       scenario it measures reaches. An arm that could never have been honoured reads exactly like a
 *       sound subject, and this one would have read as proof that the REACH arms were watertight.
 *
 *   (B) THE DISPATCH MISS AT THE SHARED MODULE. `translation` dropped from `unknownOpWire`, which is
 *       the one place the whole class now gets it from.
 *       MUST FAIL: `queue.test.mjs` (the canned sentence leaves `.q-feed-why`) and
 *       `preauth-vocabulary.test.mjs` (its three `unknown op` REACH arms, UI-84's).
 *       MUST NOT FAIL — AND THIS IS A CLAIM, NOT A HOPE: `document-structure`, `act-proposal`,
 *       `auth-surface` and `case-frozen-pair`. Each of those four only GAP-DETECTS. Their surfaces
 *       match `error` as a SUBSTRING and then render a sentence of their own (`docProgGapHtml`,
 *       `proposalAct`'s NO_SUCH_OP_HERE substitution) or render nothing at all (`inquiryCasePairs`,
 *       whose own header says it never shows the refusal to anybody); `auth-surface`'s is a
 *       fallthrough for ops that suite does not model. `error` is untouched by this arm, so the
 *       detectors still fire. A RED here would be a finding: it would mean a surface this item
 *       reported as gap-detecting actually renders the plane's sentence. `refusal-translation-surface`
 *       is green here too and for a different reason worth stating: it does not import this module.
 *
 *   (C) THE ARGUMENT COMPLAINT AT THE SHARED MODULE. `translation` dropped from `requiredArgumentWire`.
 *       MUST FAIL: `preauth-vocabulary.test.mjs`, at `op=verify`'s two-sided `#v-refused` pin and the
 *       DEC-49 SUBJECT arm (UI-84's arm A, one layer down).
 *       MUST NOT FAIL: `publishedcase.test.mjs` — declared green IN ADVANCE and it is the honest
 *       statement of what that fixture is. Its `op=publishedbytes` arm answers only a request carrying
 *       `path`, and no call in `app.html` sends one, so the fixture is UNDRIVEN: correcting it to the
 *       wire is a fixture that can now represent what it will be handed, not an assertion anybody
 *       wrote. A RED here would mean the arm is driven after all, which would be the better finding.
 *
 *   (D) OVER-STRICTNESS, the arm WORKER.md requires: correct work in a spelling this item did not
 *       anticipate must PASS. The catalogue's DISPATCH_CHECKS family is RENAMED to DISPATCH_MISS_CHECKS
 *       — the same row, the same sentence, reachable only by a lookup that DISCOVERS the family rather
 *       than naming one. MUST BE GREEN in all seven suites. The rename stays INSIDE the `_CHECKS`
 *       convention deliberately: UI-84 recorded that a spelling outside it (DISPATCH_XCHECKS) moves TWO
 *       variables — the name AND the family's membership of the convention every consumer keys on — so
 *       it withdraws the row instead of renaming it, and a red result would be about the arm.
 *       **IT IS A THREE-FILE ARM, AND THAT TOO IS A CORRECTION MEASURED HERE.** Renaming the family in
 *       `bio-checks.mjs` ALONE came back with `case-frozen-pair` dead at `ERR_RUNTIME_FAILURE`, against
 *       a green declaration — because `index.mjs` IMPORTS `DISPATCH_CHECKS` by name and `dispatchRow`
 *       reads it, so the catalogue-only rename does not rename a family, it stops the plane, and every
 *       suite that boots a real plane through miniflare dies at startup. `refusal-translation-surface`
 *       names it by name too (UI-84's own arm imports the row directly). So the arm now renames it at
 *       all three sites that NAME it, leaving exactly one variable unmoved: whether a lookup that
 *       DISCOVERS the family still finds the row. THE SITES ARE THE FINDING: this estate has exactly
 *       three, and the module is not one of them.
 *
 *   (E) THE WIDE DIRECTION — THE PLANE STOPS DECORATING. `...dispatchRow("UNKNOWN_OP"),` deleted from
 *       `bio-plane/src/index.mjs`'s `!spec` line, `error` left byte-identical.
 *       MUST FAIL, in all six importing suites, AS A DEAD SUITE AND NOT AS A FAILED ASSERTION: the
 *       module calls `assertDerived()` at import, so a plane that stops decorating stops each suite AT
 *       ITS IMPORT, naming which derivation came back empty. This is the property that makes the wide
 *       direction impossible rather than merely asserted: a fixture built this way can never end up
 *       carrying a sentence the wire does not send, because there is nothing to carry. The run line to
 *       read it against is "NO TALLY LINE".
 *       **CORRECTED: IT IS EVERY IMPORTER, `publishedcase` INCLUDED.** This first declared every suite
 *       but `publishedcase`, reasoning that a suite importing only `requiredArgumentWire` could not care
 *       whether the plane still decorates the DISPATCH miss. Measured, it dies with the rest, and by the
 *       module's own design rather than by accident: `assertDerived()` runs at IMPORT and checks BOTH
 *       halves of the wire, so no importer goes on asserting against half a derivation. The one suite
 *       here that survives is `refusal-translation-surface`, which does not import the module at all —
 *       it reads the catalogue directly, the way UI-84 left it — and that asymmetry is the cleanest
 *       statement of what the module buys: a suite wired to the catalogue alone cannot tell that the
 *       PLANE stopped sending the row it is asserting about.
 *
 * EVERY ARM IS ARMED ALONE, the others held open. Every file is restored from a UNIQUELY-NAMED per-arm
 * pristine copy and the restore verified BY sha256 AND BY `cmp`, with a byte count printed and floored.
 * Each patch must match EXACTLY ONCE or the arm is reported as NEVER ARMED — an arm that did not arm is
 * a finding, not a pass.
 *
 * THE BASELINE ROW IS NOT DECORATION. Without one, seven-suites-broken and seven-suites-working read
 * the same, and this control's own first draft would have had no way to tell them apart (WORKER.md).
 *
 * SCRATCH GOES OUTSIDE THE WORKTREE, uniquely named for THIS item and this process. Ruled by BOB #32 on
 * 2026-09-24, superseding the "inside your own worktree" practice `ui84-mock-wire.control.mjs` was
 * written under hours earlier: a file in the worktree is walked by repository-walking suites, trips
 * `gates.mjs` §2e's under-inclusion check, and makes the tree dirty, and three items paid for that in
 * one night. The name carries the item and the pid because a shared temp root spans every session on
 * this machine and a generic name there is an identity nobody owns.
 *
 * RUN IT: `node civicos-ui/test/ui100-mock-wire.control.mjs` from the repo root. It writes nothing
 * inside the worktree and leaves every subject file byte-identical.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: this file calls process.exit, and a
   writer's own exit must not discard the writer's own output when a parent spawns it with
   {stdio:"pipe"}. Same reason as ui84-mock-wire.control.mjs, which stdio-census.test.mjs names. */
import fs from "fs";
import os from "os";
import crypto from "crypto";
import { execFileSync } from "child_process";
import path from "path";

const ROOT   = new URL("../../", import.meta.url).pathname.replace(/\/$/, "");
const T      = (n) => path.join(ROOT, "civicos-ui/test", n + ".test.mjs");
const MODULE = path.join(ROOT, "civicos-ui/test/plane-refusal-wire.mjs");
const PLANE  = path.join(ROOT, "bio-plane/src/index.mjs");
const CATLG  = path.join(ROOT, "bio-plane/checks/bio-checks.mjs");
const TMP    = path.join(os.tmpdir(), `ui100-mock-wire-control-${process.pid}`);

/* The seven suites UI-100 touches, in the order the report reads them. */
const SUITES = ["queue", "preauth-vocabulary", "document-structure", "act-proposal",
                "auth-surface", "case-frozen-pair", "publishedcase", "refusal-translation-surface"];

const sha = (p) => crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const MIN_BYTES = { [MODULE]: 5000, [PLANE]: 400000, [CATLG]: 300000,
                    [T("queue")]: 40000, [T("refusal-translation-surface")]: 10000 };

/* THE TALLY, READ FROM EACH SUITE'S OWN FOOT — never a wrapper's exit and never a pipe's. THREE
   FORMATS EXIST in this estate and all five are read here, because a reader that knows one of them
   scores the others as -1 and a control whose baseline is -1 measures nothing. A run with no tally
   line at all DID NOT REACH ITS OWN FOOT and is reported as -1, never as 0 (WORKER.md).
   THE FIFTH WAS FOUND BY THE BASELINE ROW, which is the whole argument for having one: with four
   formats read, `refusal-translation-surface` scored -1 at the baseline and the run REFUSED to arm
   anything. Without the baseline row that suite would have read as "already failing" under every arm
   and its green results would have been invisible — six-arms-broken and six-arms-working, exactly the
   confusion WORKER.md records. */
function tally(out){
  let m;
  if((m = /^[a-z0-9-]+: (\d+) assertions, all green/m.exec(out)))     return { failed:0, total:+m[1] };
  if((m = /^[a-z0-9-]+: (\d+) assertions, (\d+) failed/m.exec(out)))    return { failed:+m[2], total:+m[1] };
  if((m = /^[a-z0-9-]+: (\d+) of (\d+) assertions FAILED/m.exec(out))) return { failed:+m[1], total:+m[2] };
  if((m = /^[a-z0-9-]+\.test\.mjs: (\d+) pass, (\d+) fail/m.exec(out))) return { failed:+m[2], total:+m[1] + +m[2] };
  if((m = /^[a-z0-9-]+: (\d+)\/(\d+) assertions/m.exec(out)))          return { failed:+m[2] - +m[1], total:+m[2] };
  return { failed:-1, total:-1 };
}
const failingLines = (out) => out.split("\n").filter(l => /^\s*FAIL /.test(l))
  .map(l => l.trim().slice(0, 130));

function runSuite(name){
  try{
    const out = execFileSync(process.execPath, [T(name)], { cwd: ROOT, encoding:"utf8",
      stdio:["ignore","pipe","pipe"], env:{ ...process.env } });
    return { code:0, out };
  }catch(e){ return { code: e.status === undefined ? -1 : e.status,
                      out: String(e.stdout||"") + String(e.stderr||"") }; }
}
function runAll(){
  const rows = {};
  for(const s of SUITES){ const r = runSuite(s); rows[s] = { ...tally(r.out), code:r.code, out:r.out }; }
  return rows;
}
const show = (s, t) => t.total < 0
  ? `${s}: NO TALLY LINE (exit ${t.code})`
  : `${s}: ${t.total - t.failed}/${t.total}${t.failed ? ` — ${t.failed} FAILED` : " green"} (exit ${t.code})`;

/* AN ARM MAY PATCH SEVERAL FILES, and arm (D) is why. Measured 2026-09-24: renaming a
   catalogue family in `bio-checks.mjs` ALONE does not move one variable, it moves two —
   `index.mjs` IMPORTS `DISPATCH_CHECKS` by name and `dispatchRow` reads it, so a rename in
   the catalogue alone BREAKS THE PLANE, and every suite that boots a real plane through
   miniflare dies at startup rather than reporting on the fixture. That is UI-84's own arm-C
   finding one level out: there the arm moved the family's MEMBERSHIP of the `_CHECKS`
   convention as well as its name; here it moves the plane's ability to start. So the arm
   renames the family at EVERY site that NAMES it — the catalogue's export, the plane's
   import and its reader, and the one suite that imports it — leaving exactly one variable
   unmoved: whether a lookup that DISCOVERS the family still finds the row. */
const ARMS = [
  /* CORRECTED 2026-09-24 MID-RUN, RECORDED RATHER THAN SMOOTHED, and it is this control's
     own best finding. The first spelling of this arm retyped the `op=queue` fixture and came
     back GREEN 145/145 against a RED declaration. The arm was wrong, not the subject: the
     drive that renders `.q-feed-why` is `makePlane({ resAbsent:true })`, the TASKS feed, so
     the arm patched a fixture no scenario in the REACH block reaches. It is WORKER.md's
     "arms that could never have been honoured" class, and it would have read as proof that
     the REACH arms were sound. Re-pointed at the fixture the drive actually uses. */
  { id:"A", files:[T("queue")],
    why:"THE ROW'S OWN: the absent-op mock the REACH drive uses, retyped BY HAND without a translation",
    from:[`      if(state.resAbsent) return NO(unknownOpWire("tasks"));`],
    to:  [`      if(state.resAbsent) return NO({ ok:false, error:"unknown op tasks" });`],
    mustFail:["queue"] },
  { id:"B", files:[MODULE],
    why:"the dispatch miss at the SHARED module: `translation` dropped from unknownOpWire",
    from:[`  translation:UNKNOWN_OP_CANNED && UNKNOWN_OP_CANNED.translation, op });`],
    to:  [`  translation:undefined, op });`],
    mustFail:["queue", "preauth-vocabulary"] },
  { id:"C", files:[MODULE],
    why:"the argument complaint at the SHARED module: `translation` dropped from requiredArgumentWire",
    from:[`           translation:REQUIRED_ARGUMENT_CANNED && REQUIRED_ARGUMENT_CANNED.translation,`],
    to:  [`           translation:undefined,`],
    mustFail:["preauth-vocabulary"] },
  { id:"D", files:[CATLG, PLANE, T("refusal-translation-surface")],
    why:"OVER-STRICTNESS: the catalogue family renamed INSIDE the _CHECKS convention, at every site that NAMES it",
    from:[`export const DISPATCH_CHECKS = {`,
          `         REQUIRED_ARGUMENT_CHECKS, INSTALLATION_CHECKS, DISPATCH_CHECKS,`,
          `import { BASIS_VERSION_CHECKS, DISPATCH_CHECKS } from "../../bio-plane/checks/bio-checks.mjs";`],
    to:  [`export const DISPATCH_MISS_CHECKS = {`,
          `         REQUIRED_ARGUMENT_CHECKS, INSTALLATION_CHECKS, DISPATCH_MISS_CHECKS as DISPATCH_CHECKS,`,
          `import { BASIS_VERSION_CHECKS, DISPATCH_MISS_CHECKS as DISPATCH_CHECKS } from "../../bio-plane/checks/bio-checks.mjs";`],
    mustFail:[] },
  /* CORRECTED 2026-09-24 MID-RUN, recorded rather than smoothed. This declared every suite
     BUT `publishedcase` — reasoning that `publishedcase` imports only `requiredArgumentWire`
     and so could not care whether the plane still decorates the DISPATCH miss. MEASURED: it
     dies with the rest, and the reason is the module's own design rather than a surprise.
     `assertDerived()` runs at IMPORT and checks BOTH derivations, so any importer of
     `plane-refusal-wire.mjs` stops the moment EITHER half of the wire stops being readable.
     That is stronger than the declaration, not weaker: a suite cannot go on asserting against
     half a derived wire. `refusal-translation-surface` is the one suite here that does NOT
     import the module — it reads the catalogue directly, UI-84's way — and it survives. */
  { id:"E", files:[PLANE],
    why:"the WIDE direction: the plane stops decorating the dispatch miss",
    from:[`    if (!spec) return json({ ok: false, error: "unknown op", reason: "UNKNOWN_OP", ...dispatchRow("UNKNOWN_OP"),\n                             op }, 400);`],
    to:  [`    if (!spec) return json({ ok: false, error: "unknown op", reason: "UNKNOWN_OP",\n                             op }, 400);`],
    mustFail:SUITES.filter(s => s !== "refusal-translation-surface") },
];

fs.mkdirSync(TMP, { recursive:true });
console.log(`UI-100 NEGATIVE CONTROL — five arms, each ALONE, across ${SUITES.length} suites, against the FINAL tree`);
console.log(`scratch: ${TMP} (outside the worktree — BOB #32, 2026-09-24)\n`);

/* ---- BASELINE ROW ---- */
const base = runAll();
console.log("BASELINE (nothing armed):");
for(const s of SUITES) console.log("   ", show(s, base[s]));
const baseBad = SUITES.filter(s => base[s].failed !== 0);
if(baseBad.length){
  console.error("\nBASELINE IS NOT GREEN — every arm below would be measuring a tree that is already broken:",
                baseBad.join(", "));
  for(const s of baseBad) for(const l of failingLines(base[s].out)) console.error("   ", s, l);
  process.exit(1);
}

let asDeclared = 0;
for(const arm of ARMS){
  const pristines = arm.files.map((f, i) => {
    const q = path.join(TMP, `pristine-${arm.id}-${i}-${path.basename(f)}`);
    fs.copyFileSync(f, q); return q;
  });
  const before = arm.files.map(sha), bytes = arm.files.map(f => fs.statSync(f).size);
  const small = arm.files.findIndex((f, i) => bytes[i] < (MIN_BYTES[f] || 1000));
  if(small >= 0){
    console.error(`\nARM ${arm.id}: SUBJECT TOO SMALL (${path.relative(ROOT, arm.files[small])}, `
      + `${bytes[small]} B) — refusing to arm against a truncated file.`);
    process.exit(1);
  }
  /* EVERY patch of the arm must match EXACTLY ONCE, and they are checked BEFORE any is
     written: a multi-file arm that armed two of its three files would measure a tree that
     never existed, which is worse than an arm that did not arm at all. */
  const srcs = arm.files.map(f => fs.readFileSync(f, "utf8"));
  const hits = arm.from.map((needle, i) => srcs[i].split(needle).length - 1);
  if(hits.some(h => h !== 1)){
    console.log(`\nARM ${arm.id} — NEVER ARMED: its patches matched [${hits.join(", ")}] times, not once `
      + `each. AN ARM THAT DID NOT ARM IS A FINDING, and this arm reports nothing about the subject.`);
    continue;
  }
  arm.files.forEach((f, i) => fs.writeFileSync(f, srcs[i].replace(arm.from[i], arm.to[i])));
  console.log(`\nARM ${arm.id} — ${arm.why}`);
  console.log(`  armed in ${arm.files.map(f => path.relative(ROOT, f)).join(", ")} `
    + `(${bytes.join(" + ")} B)`);
  const got = runAll();
  const red = SUITES.filter(s => got[s].failed !== 0);
  for(const s of SUITES) console.log("   ", show(s, got[s]));
  for(const s of red) for(const l of failingLines(got[s].out).slice(0, 3)) console.log("      FAILING:", s, l);
  /* Restore FIRST, verify SECOND, judge LAST — so a judgement never runs against an armed tree. */
  let allRestored = true;
  arm.files.forEach((f, i) => {
    fs.copyFileSync(pristines[i], f);
    const after = sha(f), size = fs.statSync(f).size;
    const identical = fs.readFileSync(f).equals(fs.readFileSync(pristines[i]));
    const good = before[i] === after && identical;
    allRestored = allRestored && good;
    console.log(`  RESTORED ${path.relative(ROOT, f)}: sha256 ${before[i].slice(0,8)}… -> ${after.slice(0,8)}… · `
      + `${identical ? "cmp identical" : "CMP DIFFERS"} · ${size} B · ${good ? "VERIFIED" : "*** NOT VERIFIED ***"}`);
  });
  if(!allRestored) process.exit(1);
  const want = arm.mustFail.slice().sort().join(",");
  const have = red.slice().sort().join(",");
  const ok = want === have;
  if(ok) asDeclared++;
  console.log(`  DECLARED red: [${want || "none"}] · ACTUAL red: [${have || "none"}] · `
    + (ok ? "AS DECLARED" : "*** DIFFERS FROM THE DECLARATION — a finding about the ARM, record it ***"));
}

fs.rmSync(TMP, { recursive:true, force:true });
console.log(`\nUI-100 control: ${asDeclared} of ${ARMS.length} arms AS DECLARED. An arm whose result differs `
  + `from its declaration is a finding about the ARM and must be recorded, not smoothed.`);
